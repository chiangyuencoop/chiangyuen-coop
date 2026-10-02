import React, { useState, useEffect, useCallback } from 'react';
import { NewsItem, SiteSettings } from '../types';
import {
  X,
  Calendar,
  Tag,
  Download,
  Share2,
  FileText,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Check,
  Printer,
  Sparkles,
  Layers,
} from 'lucide-react';
import { CoopLogo } from './common/CoopLogo';
import { formatThaiDate } from '../utils/dateUtils';

interface NewsDetailModalProps {
  item: NewsItem | null;
  onClose: () => void;
  settings?: SiteSettings;
}

export const NewsDetailModal: React.FC<NewsDetailModalProps> = ({
  item,
  onClose,
  settings,
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [copiedShare, setCopiedShare] = useState(false);

  // Normalize images list
  const images: string[] = React.useMemo(() => {
    if (!item) return [];
    const list: string[] = [];
    if (Array.isArray(item.images)) {
      item.images.forEach((img) => {
        if (typeof img === 'string' && img.trim().length > 0) {
          list.push(img.trim());
        }
      });
    }
    if (item.imageUrl && item.imageUrl.trim().length > 0 && !list.includes(item.imageUrl.trim())) {
      list.unshift(item.imageUrl.trim());
    }
    return list;
  }, [item]);

  // Reset active image index on item change
  useEffect(() => {
    setCurrentImageIndex(0);
    setLightboxOpen(false);
  }, [item?.id]);

  // Keyboard navigation for Lightbox & Modal
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!item) return;

      if (e.key === 'Escape') {
        if (lightboxOpen) {
          setLightboxOpen(false);
        } else {
          onClose();
        }
      } else if (lightboxOpen && images.length > 1) {
        if (e.key === 'ArrowLeft') {
          setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
        } else if (e.key === 'ArrowRight') {
          setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }
      }
    },
    [lightboxOpen, images.length, item, onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!item) return null;

  const totalImages = images.length;
  const isDownload = item.category === 'download' || Boolean(item.fileName);

  const openLightboxAt = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % totalImages);
  };

  const handleShare = async () => {
    const shareData = {
      title: item.title,
      text: item.excerpt || item.title,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(`${item.title}\n${window.location.href}`);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {
      // Ignored
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="news-detail-title"
    >
      <div
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-100 relative animate-in zoom-in-95 duration-200 my-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header with Title and Close Button */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-5 sm:px-8 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#005B35] border border-emerald-200 shadow-2xs">
              <Tag className="w-3.5 h-3.5 text-[#D4AF37]" />
              {item.categoryName}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>วันที่ประกาศ: {formatThaiDate(item.publishDate)}</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors shrink-0"
            title="ปิดหน้าต่าง (Esc)"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-8 space-y-6 flex-1">
          {/* Headline */}
          <h2
            id="news-detail-title"
            className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#005B35] leading-snug tracking-tight"
          >
            {item.title}
          </h2>

          {/* ======================================================== */}
          {/* IMAGE SECTION: MULTI-IMAGE GALLERY / 1 IMAGE / FALLBACK */}
          {/* ======================================================== */}
          {totalImages > 1 ? (
            /* Multi-Image Gallery Layout */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                <span className="flex items-center gap-1.5 font-semibold text-emerald-800">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  อัลบั้มรูปภาพประชาสัมพันธ์ ({totalImages} รูปภาพ)
                </span>
                <span className="text-[11px] text-gray-400">คลิกที่รูปเพื่อเปิดดูขนาดใหญ่เต็มจอ</span>
              </div>

              {/* Main Featured Photo Preview */}
              <div
                onClick={() => openLightboxAt(currentImageIndex)}
                className="relative rounded-2xl overflow-hidden aspect-[16/9] sm:aspect-[21/10] bg-slate-900 group cursor-pointer border border-gray-200 shadow-sm"
              >
                <img
                  src={images[currentImageIndex]}
                  alt={`${item.title} - รูปที่ ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.src =
                      'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4 text-white">
                  <span className="text-xs font-medium flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
                    คลิกเพื่อดูรูปขยายใหญ่ (รูปที่ {currentImageIndex + 1}/{totalImages})
                  </span>
                </div>

                {/* Left/Right Overlays for Quick Switching */}
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-xs transition-transform hover:scale-110"
                  title="รูปก่อนหน้า"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-xs transition-transform hover:scale-110"
                  title="รูปถัดไป"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Thumbnails Gallery Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 pt-1">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all group ${
                      idx === currentImageIndex
                        ? 'border-emerald-600 ring-2 ring-emerald-300 ring-offset-1 scale-102'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`ภาพตัวอย่าง ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.src =
                          'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                    <span className="absolute bottom-1 right-1 text-[10px] font-mono px-1 rounded bg-black/70 text-white">
                      {idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : totalImages === 1 ? (
            /* Single Image Cover View */
            <div className="space-y-1.5">
              <div
                onClick={() => openLightboxAt(0)}
                className="relative rounded-2xl overflow-hidden aspect-[16/9] sm:aspect-[21/10] bg-slate-900 group cursor-pointer border border-gray-200 shadow-sm"
              >
                <img
                  src={images[0]}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.src =
                      'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4 text-white">
                  <span className="text-xs font-medium flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
                    คลิกเพื่อดูรูปภาพขนาดเต็มจอ
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Fallback Co-op Branded Banner (No image uploaded) */
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-950 via-[#005B35] to-emerald-900 p-6 sm:p-8 text-white border border-emerald-800/50 shadow-inner">
              <div className="flex items-center gap-4">
                <div className="shrink-0 p-1 bg-white/10 rounded-2xl border border-white/20 shadow-md">
                  <CoopLogo size="md" />
                </div>
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-emerald-900/80 px-2.5 py-0.5 rounded-full border border-emerald-700">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>ข่าวสารและประกาศทางการ</span>
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-white">
                    {settings?.coopName || 'สหกรณ์การเกษตรเชียงยืน จำกัด'}
                  </h3>
                  <p className="text-xs text-emerald-200">
                    ศูนย์รวมพลังเกษตรกร มุ่งมั่นโปร่งใส พัฒนาคุณภาพชีวิตชุมชน
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Excerpt / Lead if available */}
          {item.excerpt && item.excerpt !== item.content && (
            <div className="p-4 rounded-2xl bg-emerald-50/70 border-l-4 border-[#005B35] text-stone-700 text-sm sm:text-base leading-relaxed font-medium">
              {item.excerpt}
            </div>
          )}

          {/* Main Content Body */}
          <div className="prose prose-emerald max-w-none text-gray-800 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line py-2">
            {item.content || item.excerpt}
          </div>

          {/* Download Box (If downloadable form or attachment attached) */}
          {(isDownload || item.fileName) && (
            <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-amber-100 text-amber-900 shrink-0">
                  <FileText className="w-7 h-7 text-amber-800" />
                </div>
                <div>
                  <div className="font-bold text-sm sm:text-base text-stone-900">
                    {item.fileName || 'แบบฟอร์มเอกสารทางการ_สหกรณ์การเกษตรเชียงยืน.pdf'}
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    เอกสารทางการสำหรับการติดต่อ/ยื่นเรื่อง (PDF Document)
                  </div>
                </div>
              </div>

              <a
                href={item.fileUrl || '#'}
                onClick={(e) => {
                  if (!item.fileUrl) {
                    e.preventDefault();
                    alert(
                      `กำลังเริ่มดาวน์โหลดเอกสาร:\n${
                        item.fileName || 'แบบฟอร์มเอกสาร_สหกรณ์การเกษตรเชียงยืน.pdf'
                      }\n\n(สามารถติดต่อรับเอกสารฉบับพิมพ์ได้ที่สำนักงานสหกรณ์)`
                    );
                  }
                }}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#005B35] hover:bg-[#004527] text-white text-xs sm:text-sm font-bold shadow-sm transition-all hover:scale-102 shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>ดาวน์โหลดเอกสาร</span>
              </a>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50/95 backdrop-blur-md px-5 sm:px-8 py-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 rounded-b-3xl">
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-[#005B35] hover:border-emerald-300 text-xs font-semibold shadow-2xs transition-colors"
              title="แชร์ลิงก์ข่าวสาร"
            >
              {copiedShare ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">คัดลอกลิงก์แล้ว!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>แชร์ประกาศ</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-[#005B35] text-xs font-semibold shadow-2xs transition-colors"
              title="พิมพ์หน้านี้"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-[#005B35] hover:bg-[#004527] text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* LIGHTBOX / FULLSCREEN VIEW MODAL */}
      {/* ======================================================== */}
      {lightboxOpen && totalImages > 0 && (
        <div
          className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Top Bar inside Lightbox */}
          <div
            className="w-full max-w-6xl flex items-center justify-between text-white z-10 py-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm font-bold bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                รูปที่ {currentImageIndex + 1} จาก {totalImages}
              </span>
              <span className="text-xs text-gray-300 hidden sm:inline line-clamp-1 max-w-md">
                {item.title}
              </span>
            </div>

            <button
              onClick={() => setLightboxOpen(false)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
              title="ปิดการแสดงรูปขนาดใหญ่ (Esc)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Central Image Viewport with Next / Prev */}
          <div
            className="relative w-full max-w-6xl flex-1 flex items-center justify-center select-none overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {totalImages > 1 && (
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute left-2 sm:left-4 z-10 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-sm transition-transform hover:scale-110"
                title="รูปก่อนหน้า (ลูกศรซ้าย)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <img
              src={images[currentImageIndex]}
              alt={`${item.title} - รูปขนาดใหญ่ ${currentImageIndex + 1}`}
              className="max-h-[78vh] max-w-[92vw] object-contain rounded-xl shadow-2xl transition-all duration-300"
            />

            {totalImages > 1 && (
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-2 sm:right-4 z-10 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-sm transition-transform hover:scale-110"
                title="รูปถัดไป (ลูกศรขวา)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip in Lightbox */}
          {totalImages > 1 && (
            <div
              className="w-full max-w-4xl flex items-center justify-center gap-2 overflow-x-auto py-2 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                    idx === currentImageIndex
                      ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105'
                      : 'border-white/20 opacity-50 hover:opacity-90'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`ภาพย่อ ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
