import React from 'react';
import { SiteSettings, NewsItem } from '../types';
import {
  Users,
  ShieldCheck,
  TrendingUp,
  Award,
  ChevronRight,
  MessageCircle,
  ShoppingBag,
  CheckCircle2,
} from 'lucide-react';
import { NewsSlider } from './NewsSlider';

interface HeroProps {
  settings: SiteSettings;
  news?: NewsItem[];
  onNavigate: (sectionId: string) => void;
  onSelectNews?: (item: NewsItem) => void;
}

export const Hero: React.FC<HeroProps> = ({ settings, news = [], onNavigate, onSelectNews }) => {
  const messengerUrl = `https://m.me/${settings.facebookMessengerId || 'chiangyuencoop'}`;

  return (
    <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-[#004527] to-[#005B35] text-white">
      {/* Decorative Golden Ambient Glows */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

      {/* Pattern background */}
      <div
        className="absolute inset-0 opacity-5 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text / Vision Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-600/50 text-amber-300 text-xs sm:text-sm font-medium backdrop-blur-sm">
              <Award className="w-4 h-4 text-amber-400" />
              <span>สหกรณ์การเกษตรคุณภาพ อำเภอเชียงยืน จังหวัดมหาสารคาม</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              <span className="block text-white">สหกรณ์การเกษตรเชียงยืน</span>
              <span className="block mt-2 bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
                "{settings.slogan}"
              </span>
            </h1>

            <p className="text-emerald-100 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
              ศูนย์รวมพลังความร่วมมือของพี่น้องเกษตรกร ให้บริการสินเชื่อ รับซื้อรวบรวมผลผลิต 
              สินค้าสหกรณ์ และจัดหาปัจจัยการเกษตรราคาเป็นธรรม เพื่อความมั่นคง มั่งคั่ง และยั่งยืนของชุมชน
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
              <button
                onClick={() => onNavigate('products')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm sm:text-base shadow-lg shadow-amber-900/30 transition-all hover:scale-105"
              >
                <ShoppingBag className="w-5 h-5 text-stone-900" />
                <span>เลือกชมสินค้าเกษตร</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <a
                href={messengerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-sm sm:text-base backdrop-blur-sm transition-all hover:scale-105"
              >
                <MessageCircle className="w-5 h-5 text-amber-300" />
                <span>ติดต่อแชท Facebook</span>
              </a>

              <button
                onClick={() => onNavigate('services')}
                className="inline-flex items-center gap-1.5 px-4 py-3.5 rounded-xl text-emerald-200 hover:text-white text-sm font-medium transition-colors"
              >
                <span>ดูบริการทั้งหมด</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Trust Checks */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs sm:text-sm text-emerald-200">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>ดำเนินงานตามหลักสหกรณ์สากล 7 ประการ</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>รับซื้อผลผลิตราคายุติธรรม เที่ยงตรง</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>ตรวจสอบได้ โปร่งใส สมาชิกเป็นเจ้าของ</span>
              </div>
            </div>
          </div>

          {/* Right Column: News & Announcements Carousel / Slider */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <NewsSlider news={news} onNavigate={onNavigate} onSelectNews={onSelectNews} />
            </div>
          </div>
        </div>

        {/* 4 Core Quick Numbers Banner */}
        <div className="mt-16 pt-8 border-t border-emerald-800/60 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-emerald-900/40 border border-emerald-800/50 rounded-xl p-4 text-center hover:bg-emerald-900/60 transition-colors">
            <TrendingUp className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <div className="text-2xl sm:text-3xl font-bold text-white">4 ด้าน</div>
            <div className="text-xs text-emerald-200 mt-1">บริการหลักครบวงจรเพื่อเกษตรกร</div>
          </div>
          <div className="bg-emerald-900/40 border border-emerald-800/50 rounded-xl p-4 text-center hover:bg-emerald-900/60 transition-colors">
            <Users className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <div className="text-2xl sm:text-3xl font-bold text-white">35+ ท่าน</div>
            <div className="text-xs text-emerald-200 mt-1">ทีมงานผู้บริหารและเจ้าหน้าที่พร้อมบริการ</div>
          </div>
          <div className="bg-emerald-900/40 border border-emerald-800/50 rounded-xl p-4 text-center hover:bg-emerald-900/60 transition-colors">
            <Award className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <div className="text-2xl sm:text-3xl font-bold text-white">7 ประการ</div>
            <div className="text-xs text-emerald-200 mt-1">หลักการสหกรณ์สากลยึดมั่น</div>
          </div>
          <div className="bg-emerald-900/40 border border-emerald-800/50 rounded-xl p-4 text-center hover:bg-emerald-900/60 transition-colors">
            <ShieldCheck className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <div className="text-2xl sm:text-3xl font-bold text-white">100%</div>
            <div className="text-xs text-emerald-200 mt-1">โปร่งใส ตรวจสอบได้โดยสมาชิก</div>
          </div>
        </div>
      </div>
    </section>
  );
};
