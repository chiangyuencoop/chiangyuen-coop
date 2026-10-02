import React, { useState, useRef, useEffect } from 'react';
import { uploadImageFile } from '../../services/imageUpload';
import {
  UploadCloud,
  Image as ImageIcon,
  Loader2,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Edit3,
  Camera,
  AlertCircle,
  XCircle,
  Sparkles,
} from 'lucide-react';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder: 'products' | 'personnel' | 'general';
  placeholder?: string;
  helpText?: string;
  onUploadStatusChange?: (isUploading: boolean) => void;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value,
  onChange,
  folder,
  placeholder = 'https://... หรืออัปโหลดจากเครื่อง',
  helpText = 'รองรับไฟล์ภาพ JPG, PNG, WEBP จากเครื่องหรือถ่ายด้วยมือถือ',
  onUploadStatusChange,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState<string>('กำลังประมวลผลรูปภาพ...');
  const [uploadSource, setUploadSource] = useState<'firebase-storage' | 'base64' | 'manual' | null>(null);
  const [fileSizeInfo, setFileSizeInfo] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Notify parent of uploading state changes
  useEffect(() => {
    onUploadStatusChange?.(isUploading);
    return () => {
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
      }
    };
  }, [isUploading, onUploadStatusChange]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so re-selecting the exact same file fires onChange
    e.target.value = '';

    // Clear previous notices and errors
    setUploadError(null);
    setUploadNotice(null);

    // 1. Validate file type
    const isImageByMime = file.type.startsWith('image/');
    const isImageByExt = /\.(jpe?g|png|webp|gif|bmp|heic|svg)$/i.test(file.name);
    if (!isImageByMime && !isImageByExt) {
      setUploadError('กรุณาเลือกไฟล์รูปภาพเท่านั้น เช่น .JPG, .PNG, .WEBP หรือถ่ายรูปด้วยกล้องมือถือ');
      return;
    }

    // 2. Validate file size (limit 15MB)
    const maxSizeBytes = 15 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setUploadError(`ขนาดไฟล์รูปภาพใหญ่เกินไป (${sizeMb} MB) ระบบจำกัดขนาดไม่เกิน 15 MB กรุณาเลือกไฟล์ภาพใหม่`);
      return;
    }

    setIsUploading(true);
    setUploadStage('กำลังประมวลผลและลดขนาดภาพ...');

    // Safety timeout: In the rarest browser freeze, strictly force reset isUploading after 9 seconds
    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    safetyTimeoutRef.current = setTimeout(() => {
      setIsUploading(false);
      onUploadStatusChange?.(false);
    }, 9000);

    try {
      const result = await uploadImageFile(file, folder, (stage) => {
        setUploadStage(stage);
      });

      // Pass the uploaded or converted URL to the parent form immediately
      onChange(result.url);
      setUploadSource(result.source);
      setFileSizeInfo(result.fileSizeText);

      if (result.warning) {
        setUploadNotice('ระบบบันทึกรูปภาพเรียบร้อย (แปลงเป็น Data URL อัตโนมัติ เพื่อความรวดเร็ว)');
      } else {
        setUploadNotice(null);
      }
    } catch (err: any) {
      console.error('Image upload failed:', err);
      const errorMessage =
        err?.message ||
        'เกิดข้อผิดพลาดในการประมวลผลไฟล์รูปภาพ กรุณาลองเลือกรูปภาพอื่น หรือใช้การวางลิงก์รูปภาพแทน';
      setUploadError(errorMessage);
    } finally {
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
      setIsUploading(false);
      onUploadStatusChange?.(false);
    }
  };

  const handleClearImage = () => {
    onChange('');
    setUploadSource(null);
    setFileSizeInfo(null);
    setUploadError(null);
    setUploadNotice(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-gray-700">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowManualInput(!showManualInput)}
          className="text-[11px] text-[#005B35] hover:text-emerald-700 font-medium flex items-center gap-1 transition-colors"
        >
          <Edit3 className="w-3 h-3" />
          <span>{showManualInput ? 'ซ่อนช่องกรอก URL' : 'กรอก URL โดยตรง'}</span>
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Preview and Upload Card */}
      <div className="border border-dashed border-gray-300 rounded-2xl p-3.5 bg-gray-50/70 hover:bg-gray-50 transition-colors">
        {value ? (
          <div className="flex items-center gap-3.5">
            {/* Image Thumbnail */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-white border border-gray-200 shrink-0 shadow-2xs group">
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80';
                }}
              />
            </div>

            {/* Info and Actions */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>มีรูปภาพพร้อมบันทึก</span>
              </div>

              <div className="text-[11px] text-gray-500 truncate mt-0.5 max-w-xs sm:max-w-sm">
                {uploadSource === 'firebase-storage'
                  ? 'จัดเก็บบน Firebase Storage'
                  : uploadSource === 'base64'
                  ? 'จัดเก็บแบบ Data URL (ประมวลผลสำเร็จ)'
                  : 'ลิงก์รูปภาพพร้อมใช้งาน'}
                {fileSizeInfo && ` • ขนาด ${fileSizeInfo}`}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-gray-200 hover:border-emerald-300 text-xs text-gray-700 font-medium shadow-2xs hover:bg-emerald-50 transition-colors"
                >
                  <Camera className="w-3 h-3 text-[#005B35]" />
                  <span>เปลี่ยนรูป</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearImage}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-red-200 hover:bg-red-50 text-xs text-red-600 font-medium shadow-2xs transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>ลบรูป</span>
                </button>

                {!value.startsWith('data:') && (
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="เปิดดูรูปขนาดเต็ม"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Empty State: Upload Prompt */
          <div className="text-center py-3 sm:py-4">
            {isUploading ? (
              <div className="flex flex-col items-center justify-center py-2 text-[#005B35]">
                <Loader2 className="w-7 h-7 animate-spin mb-2 text-[#005B35]" />
                <span className="text-xs font-semibold text-gray-800">{uploadStage}</span>
                <span className="text-[11px] text-gray-400 mt-1">
                  ระบบใส่ระบบตัดเวลาอัตโนมัติ (Timeout 5 วินาที) ไม่มีการค้างหมุน
                </span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#005B35] hover:bg-[#004527] text-white text-xs font-bold shadow-sm transition-all hover:scale-102 cursor-pointer active:scale-98"
                >
                  <UploadCloud className="w-4 h-4 text-[#D4AF37]" />
                  <span>อัปโหลดรูปภาพจากเครื่อง / มือถือ</span>
                </button>

                <span className="text-[11px] text-gray-400">หรือ</span>

                <button
                  type="button"
                  onClick={() => setShowManualInput(true)}
                  className="text-xs text-gray-600 hover:text-[#005B35] font-medium underline underline-offset-2 cursor-pointer"
                >
                  วางลิงก์รูปภาพ URL
                </button>
              </div>
            )}

            {!isUploading && (
              <p className="text-[10px] text-gray-400 mt-2">
                {helpText}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Error Message Notification */}
      {uploadError && (
        <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 p-2.5 rounded-xl border border-red-200 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">
            <span className="font-semibold">ข้อผิดพลาด: </span>
            {uploadError}
          </div>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-red-400 hover:text-red-600 p-0.5"
            title="ปิดการแจ้งเตือน"
          >
            <XCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Helpful Fallback/Notice message */}
      {uploadNotice && (
        <div className="flex items-center gap-2 text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
          <span className="flex-1">{uploadNotice}</span>
          <button
            type="button"
            onClick={() => setUploadNotice(null)}
            className="text-emerald-500 hover:text-emerald-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Manual Input Dropdown */}
      {showManualInput && (
        <div className="pt-1 animate-in fade-in duration-150">
          <input
            type="text"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setUploadSource('manual');
            }}
            placeholder={placeholder}
            className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#005B35] focus:outline-none"
          />
          <p className="text-[10px] text-gray-400 mt-0.5">
            สามารถวางลิงก์รูปภาพจากภายนอก (https://...) หรือดู Data URL ที่ระบบสร้างขึ้นได้
          </p>
        </div>
      )}
    </div>
  );
};
