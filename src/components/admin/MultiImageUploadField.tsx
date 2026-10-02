import React, { useState, useRef, useEffect } from 'react';
import { uploadImageFile } from '../../services/imageUpload';
import {
  UploadCloud,
  Image as ImageIcon,
  Loader2,
  Trash2,
  Plus,
  Star,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  ExternalLink,
  Layers,
} from 'lucide-react';

interface MultiImageUploadFieldProps {
  label: string;
  values: string[];
  onChange: (urls: string[]) => void;
  folder: 'products' | 'personnel' | 'general';
  helpText?: string;
  onUploadStatusChange?: (isUploading: boolean) => void;
}

export const MultiImageUploadField: React.FC<MultiImageUploadFieldProps> = ({
  label,
  values = [],
  onChange,
  folder,
  helpText = 'รูปแรกในรายการจะเป็นภาพหน้าปกหลัก (Cover Image)',
  onUploadStatusChange,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [newUrlInput, setNewUrlInput] = useState<string>('');
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    onUploadStatusChange?.(isUploading);
    return () => {
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    };
  }, [isUploading, onUploadStatusChange]);

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Reset input so user can re-select if needed
    const fileList = Array.from(files);
    e.target.value = '';

    setUploadError(null);

    // Validate files
    for (const file of fileList) {
      const isImg = file.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|bmp|heic|svg)$/i.test(file.name);
      if (!isImg) {
        setUploadError('กรุณาเลือกเฉพาะไฟล์รูปภาพ (JPG, PNG, WEBP)');
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        setUploadError(`ไฟล์ ${file.name} มีขนาดใหญ่เกิน 15 MB`);
        return;
      }
    }

    setIsUploading(true);
    setUploadStage(`กำลังประมวลผล ${fileList.length} รูปภาพ...`);

    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    safetyTimeoutRef.current = setTimeout(() => {
      setIsUploading(false);
      onUploadStatusChange?.(false);
    }, 15000);

    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        setUploadStage(`กำลังประมวลผลรูปที่ ${i + 1}/${fileList.length}...`);
        const result = await uploadImageFile(file, folder);
        if (result && result.url) {
          uploadedUrls.push(result.url);
        }
      }

      if (uploadedUrls.length > 0) {
        onChange([...values, ...uploadedUrls]);
      }
    } catch (err: any) {
      console.error('Multi image upload error:', err);
      setUploadError(err?.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
    } finally {
      setIsUploading(false);
      setUploadStage('');
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    }
  };

  const handleAddUrl = () => {
    const trimmed = newUrlInput.trim();
    if (!trimmed) return;
    onChange([...values, trimmed]);
    setNewUrlInput('');
    setShowUrlInput(false);
  };

  const handleDeleteImage = (indexToDelete: number) => {
    const updated = values.filter((_, idx) => idx !== indexToDelete);
    onChange(updated);
  };

  const handleSetCover = (indexToCover: number) => {
    if (indexToCover === 0) return;
    const target = values[indexToCover];
    const remaining = values.filter((_, idx) => idx !== indexToCover);
    onChange([target, ...remaining]);
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= values.length) return;
    const newArr = [...values];
    const temp = newArr[index];
    newArr[index] = newArr[targetIndex];
    newArr[targetIndex] = temp;
    onChange(newArr);
  };

  return (
    <div className="space-y-3">
      {/* Label & Header */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-gray-700 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#005B35]" />
          <span>{label}</span>
          <span className="text-[11px] font-normal text-gray-500">
            ({values.length} รูป)
          </span>
        </label>

        {/* Upload Action Buttons */}
        <div className="flex items-center gap-1.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFilesSelected}
            multiple
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#005B35] border border-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>เลือกรูปภาพจากเครื่อง</span>
          </button>

          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="px-2.5 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-medium flex items-center gap-1 transition-colors"
            title="เพิ่มผ่านลิงก์รูปภาพ URL"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ใส่ URL</span>
          </button>
        </div>
      </div>

      {helpText && (
        <p className="text-[11px] text-gray-500 font-light">
          {helpText}
        </p>
      )}

      {/* Manual URL Input Bar */}
      {showUrlInput && (
        <div className="p-3 bg-slate-50 border border-gray-200 rounded-xl space-y-2 animate-in fade-in duration-150">
          <span className="text-xs font-semibold text-gray-700">วางลิงก์รูปภาพ (Image URL):</span>
          <div className="flex gap-2">
            <input
              type="text"
              value={newUrlInput}
              onChange={(e) => setNewUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex-1 px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#005B35]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddUrl();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddUrl}
              className="px-3 py-1.5 bg-[#005B35] text-white text-xs font-semibold rounded-lg hover:bg-[#004527]"
            >
              เพิ่มรูป
            </button>
          </div>
        </div>
      )}

      {/* Loading state bar */}
      {isUploading && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-[#005B35] flex items-center gap-2 animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin text-[#005B35]" />
          <span className="font-semibold">{uploadStage || 'กำลังอัปโหลดรูปภาพ...'}</span>
        </div>
      )}

      {/* Error Message */}
      {uploadError && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span>{uploadError}</span>
            <button
              type="button"
              onClick={() => setUploadError(null)}
              className="ml-2 text-red-800 underline hover:no-underline font-semibold"
            >
              ปิด
            </button>
          </div>
        </div>
      )}

      {/* Image Preview Grid */}
      {values.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-3 bg-gray-50/70 border border-gray-200 rounded-2xl">
          {values.map((url, idx) => {
            const isCover = idx === 0;
            return (
              <div
                key={idx}
                className={`relative rounded-xl overflow-hidden border bg-white shadow-2xs group flex flex-col ${
                  isCover ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-gray-200'
                }`}
              >
                {/* Image Container */}
                <div className="relative aspect-4/3 overflow-hidden bg-slate-900">
                  <img
                    src={url}
                    alt={`ภาพที่ ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=400&q=80';
                    }}
                  />

                  {/* Cover Badge */}
                  {isCover ? (
                    <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-stone-950 shadow-sm flex items-center gap-1">
                      <Star className="w-3 h-3 fill-stone-950 text-stone-950" />
                      <span>รูปหน้าปก</span>
                    </span>
                  ) : (
                    <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/60 text-white backdrop-blur-xs">
                      #{idx + 1}
                    </span>
                  )}

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(idx)}
                    className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-red-600/90 hover:bg-red-700 text-white shadow-md transition-colors"
                    title="ลบรูปภาพนี้"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Card Controls Footer */}
                <div className="p-1.5 bg-white border-t border-gray-100 flex items-center justify-between text-[11px]">
                  {!isCover ? (
                    <button
                      type="button"
                      onClick={() => handleSetCover(idx)}
                      className="text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1 hover:underline"
                      title="ตั้งเป็นภาพหน้าปกหลัก"
                    >
                      <Star className="w-3 h-3" />
                      <span>ตั้งเป็นหน้าปก</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-amber-700 font-bold">
                      ภาพปกหลัก
                    </span>
                  )}

                  {/* Move Left / Right Buttons */}
                  <div className="flex items-center gap-0.5 ml-auto">
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => handleMove(idx, 'left')}
                        className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded"
                        title="ย้ายไปข้างหน้า"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                    )}
                    {idx < values.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleMove(idx, 'right')}
                        className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded"
                        title="ย้ายไปข้างหลัง"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add more button slot in grid */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 hover:border-[#005B35] rounded-xl aspect-4/3 flex flex-col items-center justify-center p-3 text-gray-400 hover:text-[#005B35] hover:bg-emerald-50/40 transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-100/60 group-hover:bg-[#005B35] group-hover:text-white text-[#005B35] flex items-center justify-center mb-1.5 transition-colors">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold">เพิ่มรูปภาพ</span>
          </button>
        </div>
      ) : (
        /* Empty State */
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 hover:border-[#005B35] rounded-2xl p-6 text-center cursor-pointer hover:bg-emerald-50/20 transition-all flex flex-col items-center justify-center"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#005B35] flex items-center justify-center mb-2">
            <ImageIcon className="w-6 h-6" />
          </div>
          <p className="text-xs sm:text-sm font-semibold text-gray-700">
            ยังไม่มีรูปภาพในข่าวสารนี้
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            คลิกเพื่อเลือกไฟล์รูปภาพจากเครื่องหรือมือถือ (เพิ่มได้หลายรูป)
          </p>
          <span className="mt-3 px-3 py-1 rounded-xl bg-emerald-600 text-white text-xs font-bold inline-flex items-center gap-1 shadow-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>เลือกรูปภาพ</span>
          </span>
        </div>
      )}
    </div>
  );
};
