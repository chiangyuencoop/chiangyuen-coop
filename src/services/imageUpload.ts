import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

export interface UploadResult {
  url: string;
  source: 'firebase-storage' | 'base64';
  fileSizeText: string;
  warning?: string;
}

/**
 * Utility to enforce a strict timeout on any Promise.
 * If the promise does not settle within `ms` milliseconds, it rejects with the given error message.
 */
export function withTimeout<T>(promise: Promise<T>, ms: number, timeoutMsg: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(timeoutMsg));
    }, ms);

    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * Resizes and compresses an image File to optimal dimensions and quality.
 * Enforces a 5-second timeout on image reading and canvas processing.
 * Returns both a compressed Blob for storage upload and a Base64 data URL for instant preview/fallback.
 */
export async function compressImage(
  file: File,
  maxDimension = 900,
  quality = 0.8
): Promise<{ blob: Blob; dataUrl: string; sizeText: string }> {
  // Wrap reader & canvas inside withTimeout to prevent mobile browsers / raw images from hanging
  return withTimeout(
    new Promise<{ blob: Blob; dataUrl: string; sizeText: string }>((resolve, reject) => {
      try {
        const reader = new FileReader();

        reader.onerror = () => {
          reject(new Error('ไม่สามารถอ่านไฟล์รูปภาพจากอุปกรณ์ได้'));
        };

        reader.onload = (e) => {
          try {
            const result = e.target?.result as string;
            if (!result) {
              reject(new Error('ไม่พบข้อมูลรูปภาพ'));
              return;
            }

            const img = new Image();
            img.onerror = () => {
              reject(new Error('ไฟล์รูปภาพเสียหาย หรือรูปแบบภาพไม่รองรับ (แนะนำ JPG, PNG, WEBP)'));
            };

            img.onload = () => {
              try {
                let width = img.width;
                let height = img.height;

                if (width <= 0 || height <= 0) {
                  reject(new Error('ขนาดของรูปภาพไม่ถูกต้อง'));
                  return;
                }

                // Calculate aspect ratio preserving dimensions
                if (width > maxDimension || height > maxDimension) {
                  if (width > height) {
                    height = Math.round((height * maxDimension) / width);
                    width = maxDimension;
                  } else {
                    width = Math.round((width * maxDimension) / height);
                    height = maxDimension;
                  }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                  // Fallback to original dataUrl if canvas context is unavailable
                  const approxKb = (result.length / 1024 * 0.75).toFixed(1);
                  resolve({
                    blob: file,
                    dataUrl: result,
                    sizeText: `${approxKb} KB`,
                  });
                  return;
                }

                // White background to handle transparent PNGs converting to JPEG cleanly
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg', quality);

                canvas.toBlob(
                  (blob) => {
                    if (!blob) {
                      // Fallback using raw dataUrl
                      const approxKb = (dataUrl.length / 1024 * 0.75).toFixed(1);
                      resolve({
                        blob: file,
                        dataUrl,
                        sizeText: `${approxKb} KB`,
                      });
                      return;
                    }

                    const sizeInKb = (blob.size / 1024).toFixed(1);
                    resolve({
                      blob,
                      dataUrl,
                      sizeText: `${sizeInKb} KB`,
                    });
                  },
                  'image/jpeg',
                  quality
                );
              } catch (canvasErr) {
                // If canvas throws on extreme device memory, fallback to direct dataUrl
                console.warn('Canvas processing error, using direct FileReader fallback:', canvasErr);
                const approxKb = (result.length / 1024 * 0.75).toFixed(1);
                resolve({
                  blob: file,
                  dataUrl: result,
                  sizeText: `${approxKb} KB`,
                });
              }
            };

            img.src = result;
          } catch (loadErr) {
            reject(new Error('เกิดข้อผิดพลาดในการประมวลผลไฟล์ภาพ'));
          }
        };

        reader.readAsDataURL(file);
      } catch (err: any) {
        reject(new Error(err?.message || 'ไม่สามารถเปิดไฟล์รูปภาพได้'));
      }
    }),
    5000,
    'การประมวลผลลดขนาดภาพใช้เวลานานเกินกำหนด'
  );
}

/**
 * Uploads an image file:
 * 1. Validates & compresses it client-side with timeout (< 5s)
 * 2. Attempts to upload to Firebase Storage with a strict 5-second timeout
 * 3. If Firebase Storage fails or hangs past 5s, automatically falls back to compressed Base64 Data URL
 * 4. Never stays stuck on "กำลังประมวลผลและอัปโหลดรูปภาพ..."
 */
export async function uploadImageFile(
  file: File,
  folder: 'products' | 'personnel' | 'general' = 'general',
  onStageChange?: (stage: string) => void
): Promise<UploadResult> {
  // Check basic file validity
  if (!file) {
    throw new Error('ไม่พบไฟล์รูปภาพที่ต้องการอัปโหลด');
  }

  if (file.size > 15 * 1024 * 1024) {
    throw new Error('ขนาดไฟล์ใหญ่เกินกำหนด (จำกัดไม่เกิน 15 MB) กรุณาเลือกภาพที่มีขนาดเล็กลง');
  }

  onStageChange?.('กำลังลดขนาดและประมวลผลรูปภาพ...');

  let compressed: { blob: Blob; dataUrl: string; sizeText: string };
  try {
    compressed = await compressImage(file);
  } catch (compErr: any) {
    console.warn('Compression failed, attempting direct Base64 fallback:', compErr);
    // If compression failed or timed out, attempt basic FileReader reading as a last-resort Base64
    try {
      const directDataUrl = await withTimeout<string>(
        new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result as string);
          r.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์ได้'));
          r.readAsDataURL(file);
        }),
        3000,
        'ไม่สามารถอ่านไฟล์ภาพได้'
      );
      return {
        url: directDataUrl,
        source: 'base64',
        fileSizeText: `${(file.size / 1024).toFixed(1)} KB`,
        warning: 'ใช้ไฟล์ภาพต้นฉบับเนื่องจากระบบบีบอัดไม่พร้อมใช้งาน',
      };
    } catch {
      throw new Error(compErr?.message || 'ไม่สามารถอ่านหรือประมวลผลไฟล์รูปภาพนี้ได้');
    }
  }

  const { blob, dataUrl, sizeText } = compressed;

  // Next, try uploading to Firebase Storage with strict 5-second timeout
  onStageChange?.('กำลังเชื่อมต่อและบันทึกภาพ...');

  try {
    const cleanFileName = (file.name || 'image')
      .replace(/[^a-zA-Z0-9_.-]/g, '_')
      .replace(/\.[^/.]+$/, '');
    const path = `${folder}/${Date.now()}_${cleanFileName || 'img'}.jpg`;

    // Wrap uploadBytes and getDownloadURL in withTimeout (5 seconds)
    const uploadTask = async (): Promise<string> => {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, blob, {
        contentType: 'image/jpeg',
      });
      return await getDownloadURL(snapshot.ref);
    };

    // Strict 5-second timeout as required
    const downloadUrl = await withTimeout(
      uploadTask(),
      5000,
      'การเชื่อมต่อ Firebase Storage ใช้เวลานานเกิน 5 วินาที'
    );

    return {
      url: downloadUrl,
      source: 'firebase-storage',
      fileSizeText: sizeText,
    };
  } catch (storageErr: any) {
    console.warn(
      'Firebase Storage upload timed out (5s) or failed, switching to Base64 Data URL fallback:',
      storageErr?.message || storageErr
    );

    // Instant automatic fallback to Base64 Data URL so the screen NEVER gets stuck spinning!
    return {
      url: dataUrl,
      source: 'base64',
      fileSizeText: sizeText,
      warning: 'อัปโหลดสู่ Storage ล่าช้าหรือมีข้อจำกัด สลับใช้รูปภาพแบบ Data URL อัตโนมัติเรียบร้อย',
    };
  }
}
