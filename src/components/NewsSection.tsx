import React, { useState, useMemo } from 'react';
import { NewsItem, SiteSettings } from '../types';
import {
  Bell,
  Calendar,
  FileText,
  Download,
  ArrowRight,
  Share2,
  Tag,
  Layers,
  Sparkles,
  Building2,
  Image as ImageIcon,
} from 'lucide-react';
import { NewsDetailModal } from './NewsDetailModal';
import { compareNewsDescending, formatThaiDate } from '../utils/dateUtils';

interface NewsSectionProps {
  news: NewsItem[];
  settings?: SiteSettings;
  externalActiveItem?: NewsItem | null;
  onClearExternalActiveItem?: () => void;
}

export const NewsSection: React.FC<NewsSectionProps> = ({
  news,
  settings,
  externalActiveItem,
  onClearExternalActiveItem,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [localActiveItem, setLocalActiveItem] = useState<NewsItem | null>(null);

  // Active item can come either from local click or external (e.g. Hero slider click)
  const activeItem = externalActiveItem || localActiveItem;

  const handleCloseModal = () => {
    setLocalActiveItem(null);
    if (onClearExternalActiveItem) {
      onClearExternalActiveItem();
    }
  };

  const categories = [
    { id: 'all', label: 'ข่าวทั้งหมด' },
    { id: 'announcement', label: 'ประกาศสหกรณ์' },
    { id: 'news', label: 'ข่าวประชาสัมพันธ์' },
    { id: 'download', label: 'เอกสารดาวน์โหลด' },
    { id: 'activity', label: 'กิจกรรมส่งเสริม' },
  ];

  // Filter and sort newest first (Descending by Date)
  const filteredAndSortedNews = useMemo(() => {
    const list = news.filter((item) => {
      if (selectedCategory === 'all') return true;
      return item.category === selectedCategory;
    });

    // Always sort descending by date (newest first)
    return list.sort(compareNewsDescending);
  }, [news, selectedCategory]);

  return (
    <section id="news" className="py-20 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-[#005B35] text-xs font-semibold uppercase tracking-wider mb-3">
            <Bell className="w-3.5 h-3.5" />
            <span>ข่าวสารและประชาสัมพันธ์</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#005B35]">
            ข่าวสาร ประกาศ และเอกสารดาวน์โหลด
          </h2>
          <div className="w-20 h-1 bg-[#D4AF37] mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-gray-600 text-sm sm:text-base leading-relaxed">
            ติดตามข้อมูลข่าวสาร ความเคลื่อนไหวกิจกรรม ผลการดำเนินงาน 
            และดาวน์โหลดแบบฟอร์มเอกสารทางราชการของสหกรณ์การเกษตรเชียงยืน จำกัด
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#005B35] text-white shadow-sm scale-102'
                  : 'bg-white text-gray-700 hover:bg-emerald-50 border border-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* News Grid */}
        {filteredAndSortedNews.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8 max-w-md mx-auto">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">ไม่พบข่าวสารในหมวดหมู่นี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedNews.map((item) => {
              const isDownload = item.category === 'download' || Boolean(item.fileName);

              // Gather images
              const imageList: string[] = [];
              if (Array.isArray(item.images)) {
                item.images.forEach((img) => {
                  if (typeof img === 'string' && img.trim().length > 0) {
                    imageList.push(img.trim());
                  }
                });
              }
              if (item.imageUrl && item.imageUrl.trim().length > 0 && !imageList.includes(item.imageUrl.trim())) {
                imageList.unshift(item.imageUrl.trim());
              }

              const coverImage = imageList[0];
              const totalImages = imageList.length;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-2xs hover:shadow-lg hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                >
                  {/* Card Media Header */}
                  <div>
                    {coverImage ? (
                      <div
                        onClick={() => setLocalActiveItem(item)}
                        className="relative aspect-[16/10] overflow-hidden bg-slate-100 cursor-pointer"
                      >
                        <img
                          src={coverImage}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.src =
                              'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=80';
                          }}
                        />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10 pointer-events-none">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#005B35]/95 text-amber-300 border border-emerald-400/50 backdrop-blur-sm shadow-xs">
                            <Tag className="w-3 h-3 text-amber-400" />
                            {item.categoryName}
                          </span>

                          {totalImages > 1 && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/70 text-white backdrop-blur-sm shadow-xs">
                              <Layers className="w-3 h-3 text-amber-300" />
                              <span>{totalImages} รูปภาพ</span>
                            </span>
                          )}
                        </div>

                        {/* Gradient tint */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ) : (
                      /* Fallback Banner for news with 0 images */
                      <div
                        onClick={() => setLocalActiveItem(item)}
                        className="p-5 bg-gradient-to-br from-emerald-950 via-[#005B35] to-emerald-900 text-white cursor-pointer relative overflow-hidden group-hover:brightness-105 transition-all"
                      >
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
                        <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-900/80 text-amber-300 border border-emerald-700/60 shadow-xs">
                            <Tag className="w-3 h-3 text-amber-400" />
                            {item.categoryName}
                          </span>

                          <span className="text-[10px] font-medium text-emerald-200/90 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-amber-300" />
                            <span>ประกาศทางการ</span>
                          </span>
                        </div>
                        <div className="text-xs text-emerald-200/80 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>สหกรณ์การเกษตรเชียงยืน จำกัด</span>
                        </div>
                      </div>
                    )}

                    {/* Card Content Area */}
                    <div className="p-5">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                        <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>{formatThaiDate(item.publishDate) || item.publishDate}</span>
                      </div>

                      <h3
                        onClick={() => setLocalActiveItem(item)}
                        className="font-bold text-base text-gray-900 group-hover:text-[#005B35] transition-colors cursor-pointer leading-snug line-clamp-2"
                      >
                        {item.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-gray-500 mt-2.5 line-clamp-3 leading-relaxed font-light">
                        {item.excerpt || item.content}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                    {isDownload ? (
                      <button
                        onClick={() => setLocalActiveItem(item)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>ดาวน์โหลดแบบฟอร์ม</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setLocalActiveItem(item)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#005B35] hover:text-emerald-800 transition-colors group/btn"
                      >
                        <span>อ่านรายละเอียด</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({ title: item.title, text: item.excerpt });
                        } else {
                          navigator.clipboard.writeText(`${item.title}\n${window.location.href}`);
                          alert('คัดลอกลิงก์ข่าวสารเรียบร้อยแล้ว');
                        }
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                      title="แชร์ข่าวนี้"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Rich News Detail Modal with Multi-Image Gallery, Lightbox & Fallback */}
        <NewsDetailModal
          item={activeItem}
          onClose={handleCloseModal}
          settings={settings}
        />
      </div>
    </section>
  );
};
