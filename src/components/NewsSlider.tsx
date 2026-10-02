import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NewsItem } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Tag,
  ArrowRight,
  BellRing,
} from 'lucide-react';
import { compareNewsDescending, formatThaiDate } from '../utils/dateUtils';

interface NewsSliderProps {
  news: NewsItem[];
  onNavigate?: (sectionId: string) => void;
  onSelectNews?: (item: NewsItem) => void;
  className?: string;
}

// Fallback high-res agricultural/cooperative photography if news has no image
const DEFAULT_NEWS_IMAGES = [
  'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1200&q=80', // Rice harvest
  'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=80', // Meeting/assembly
  'https://images.unsplash.com/photo-1592417817098-8f3d69102a56?auto=format&fit=crop&w=1200&q=80', // Organic agriculture
  'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80', // Golden fields
  'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80', // Finance/documents
];

export const NewsSlider: React.FC<NewsSliderProps> = ({
  news,
  onNavigate,
  onSelectNews,
  className = '',
}) => {
  // Sort slides: newest news first (Descending by Date)
  const slides = useMemo(() => {
    if (!news || news.length === 0) return [];
    return [...news].sort(compareNewsDescending);
  }, [news]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = slides.length;

  // Auto-play timer: slides change every 5 seconds (5000ms)
  useEffect(() => {
    if (totalSlides <= 1 || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [totalSlides, isPaused]);

  // Reset index if slides shrink
  useEffect(() => {
    if (currentIndex >= totalSlides && totalSlides > 0) {
      setCurrentIndex(0);
    }
  }, [currentIndex, totalSlides]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const handleDotClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(index);
  };

  const handleClickSlide = (item: NewsItem) => {
    if (onSelectNews) {
      onSelectNews(item);
    } else if (onNavigate) {
      onNavigate('news');
    }
  };

  if (totalSlides === 0) {
    return null;
  }

  return (
    <div
      className={`relative rounded-2xl bg-white/10 p-2 sm:p-3 backdrop-blur-md border border-white/20 shadow-2xl overflow-hidden group/container ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="สไลด์ข่าวสารและประกาศประชาสัมพันธ์"
    >
      {/* Top Header Badge */}
      <div className="flex items-center justify-between px-3 py-1.5 mb-2 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-xs">
        <div className="flex items-center gap-2 text-amber-300 font-bold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <BellRing className="w-3.5 h-3.5 text-amber-400" />
          <span className="tracking-wide">ข่าวสาร & ประกาศล่าสุด</span>
        </div>

        {/* Counter indicator */}
        <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-200 bg-emerald-900/90 px-2 py-0.5 rounded-full border border-emerald-700/50">
          <span className="font-bold text-amber-300">{currentIndex + 1}</span>
          <span className="text-gray-400">/</span>
          <span>{totalSlides}</span>
        </div>
      </div>

      {/* Slider Viewport Container */}
      <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-[4/3] sm:aspect-[16/11] md:aspect-[4/3] select-none shadow-inner">
        {/* Slides Track */}
        <div
          className="flex h-full w-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((item, index) => {
            const fallbackImg = DEFAULT_NEWS_IMAGES[index % DEFAULT_NEWS_IMAGES.length];
            // Cover image from images array or imageUrl
            const itemCover =
              (Array.isArray(item.images) && item.images.length > 0 && item.images[0]) ||
              item.imageUrl;
            const imgSrc =
              itemCover && typeof itemCover === 'string' && itemCover.trim().length > 0
                ? itemCover.trim()
                : fallbackImg;

            return (
              <div
                key={item.id || index}
                className="w-full h-full shrink-0 relative cursor-pointer group"
                onClick={() => handleClickSlide(item)}
              >
                {/* Slide Image */}
                <img
                  src={imgSrc}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (target.src !== fallbackImg) {
                      target.src = fallbackImg;
                    }
                  }}
                />

                {/* Dark Gradient Overlay for optimal text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/20" />

                {/* Top Overlay: Category Tag & Featured Badge */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10 pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#005B35]/95 text-amber-300 border border-emerald-400/60 backdrop-blur-md shadow-md">
                    <Tag className="w-3 h-3 text-amber-400" />
                    <span>{item.categoryName || 'ข่าวประชาสัมพันธ์'}</span>
                  </span>

                  {item.featured && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-stone-950 shadow-sm border border-amber-300">
                      ข่าวเด่น
                    </span>
                  )}
                </div>

                {/* Bottom Overlay: Date, Headline & Details */}
                <div className="absolute bottom-0 left-0 right-0 p-3.5 sm:p-5 text-left z-10 space-y-1.5 sm:space-y-2">
                  {/* Announcement Date */}
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-medium">
                    <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>ประกาศ: {formatThaiDate(item.publishDate) || 'ล่าสุด'}</span>
                  </div>

                  {/* Headline Title */}
                  <h3 className="text-white font-bold text-sm sm:text-base md:text-lg leading-snug line-clamp-2 drop-shadow-md group-hover:text-amber-200 transition-colors">
                    {item.title}
                  </h3>

                  {/* Excerpt / Summary */}
                  {item.excerpt && (
                    <p className="text-emerald-100/90 text-xs sm:text-sm line-clamp-1 sm:line-clamp-2 font-light leading-relaxed drop-shadow-xs hidden xs:block">
                      {item.excerpt}
                    </p>
                  )}

                  {/* Read More Link */}
                  <div className="pt-1 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300 hover:text-amber-200 group-hover:translate-x-1 transition-all">
                      <span>อ่านรายละเอียดประกาศ</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Previous Button (Left) */}
        {totalSlides > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            aria-label="ข่าวก่อนหน้า"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-[#005B35] text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg group-hover/container:opacity-100 opacity-90 sm:opacity-80"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        )}

        {/* Next Button (Right) */}
        {totalSlides > 1 && (
          <button
            type="button"
            onClick={handleNext}
            aria-label="ข่าวถัดไป"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-[#005B35] text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg group-hover/container:opacity-100 opacity-90 sm:opacity-80"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      {/* Bottom Bar: Dots Indicators & Quick Action */}
      <div className="mt-3 px-2 flex items-center justify-between text-xs text-emerald-100">
        {/* Dots Indicators */}
        <div className="flex items-center gap-1.5 py-1">
          {slides.map((_, dotIdx) => {
            const isActive = dotIdx === currentIndex;
            return (
              <button
                key={dotIdx}
                type="button"
                onClick={(e) => handleDotClick(dotIdx, e)}
                aria-label={`ไปยังข่าวที่ ${dotIdx + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  isActive
                    ? 'w-6 sm:w-7 h-2 bg-gradient-to-r from-amber-400 to-amber-500 shadow-sm'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            );
          })}
        </div>

        {/* View All News Button */}
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('news')}
          className="text-amber-300 hover:text-amber-200 font-semibold text-xs flex items-center gap-1 hover:underline transition-colors"
        >
          <span>ศูนย์ข่าวสารทั้งหมด</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
