import React, { useState } from 'react';
import { COOP_PRINCIPLES_DATA } from '../data/initialData';
import {
  BookOpen,
  Heart,
  Scale,
  Compass,
  CheckCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

export const CoopPrinciples: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'principles' | 'ideology' | 'values' | 'methods'>('principles');

  return (
    <section id="about" className="py-20 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-[#005B35] text-xs font-semibold uppercase tracking-wider mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>เกี่ยวกับสหกรณ์และหลักการดำเนินงาน</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#005B35]">
            หลักการ อุดมการณ์ คุณค่า และวิธีการสหกรณ์
          </h2>
          <div className="w-20 h-1 bg-[#D4AF37] mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-gray-600 text-sm sm:text-base leading-relaxed">
            สหกรณ์การเกษตรเชียงยืน จำกัด ดำเนินงานโดยยึดมั่นตามปรัชญาและหลักการสหกรณ์สากล 
            เพื่อเป็นพลังขับเคลื่อนเศรษฐกิจฐานรากและส่งเสริมคุณภาพชีวิตที่ดีของมวลสมาชิก
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10">
          <button
            onClick={() => setActiveTab('principles')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'principles'
                ? 'bg-[#005B35] text-white shadow-md shadow-emerald-900/20'
                : 'bg-white text-gray-700 hover:bg-emerald-50 border border-gray-200'
            }`}
          >
            <Compass className="w-4 h-4 text-[#D4AF37]" />
            <span>หลักการสหกรณ์ (7 ประการ)</span>
          </button>

          <button
            onClick={() => setActiveTab('ideology')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'ideology'
                ? 'bg-[#005B35] text-white shadow-md shadow-emerald-900/20'
                : 'bg-white text-gray-700 hover:bg-emerald-50 border border-gray-200'
            }`}
          >
            <Heart className="w-4 h-4 text-[#D4AF37]" />
            <span>อุดมการณ์สหกรณ์</span>
          </button>

          <button
            onClick={() => setActiveTab('values')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'values'
                ? 'bg-[#005B35] text-white shadow-md shadow-emerald-900/20'
                : 'bg-white text-gray-700 hover:bg-emerald-50 border border-gray-200'
            }`}
          >
            <Scale className="w-4 h-4 text-[#D4AF37]" />
            <span>คุณค่าของสหกรณ์</span>
          </button>

          <button
            onClick={() => setActiveTab('methods')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'methods'
                ? 'bg-[#005B35] text-white shadow-md shadow-emerald-900/20'
                : 'bg-white text-gray-700 hover:bg-emerald-50 border border-gray-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>วิธีการสหกรณ์</span>
          </button>
        </div>

        {/* Tab 1: 7 Principles */}
        {activeTab === 'principles' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/70 text-amber-900 text-center text-sm font-medium">
              “แนวทางในการปฏิบัติเพื่อการดำรงงานของสหกรณ์ บรรลุวัตถุประสงค์และเกิดผลเป็นรูปธรรม” ด้วยหลักการที่สำคัญ 7 ประการ ได้แก่
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {COOP_PRINCIPLES_DATA.principles7.map((item) => (
                <div
                  key={item.num}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md border border-gray-100 hover:border-emerald-200 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 text-[#005B35] font-bold text-sm flex items-center justify-center group-hover:bg-[#005B35] group-hover:text-amber-300 transition-colors">
                        0{item.num}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">หลักการที่ {item.num}</span>
                    </div>

                    <h3 className="text-base font-bold text-[#005B35] mb-2 group-hover:text-emerald-700 transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-sm text-gray-600 leading-relaxed font-light">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                    <CheckCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>สหกรณ์การเกษตรเชียงยืนยึดถือปฏิบัติ</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Ideology */}
        {activeTab === 'ideology' && (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-emerald-100 text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#005B35] mx-auto mb-6 flex items-center justify-center">
              <Heart className="w-8 h-8 text-[#D4AF37]" />
            </div>

            <h3 className="text-2xl font-bold text-[#005B35] mb-6">
              อุดมการณ์สหกรณ์ (Cooperative Ideology)
            </h3>

            <blockquote className="text-lg sm:text-xl font-normal text-gray-700 italic leading-relaxed px-4 py-6 bg-amber-50/50 rounded-2xl border border-amber-200/60 mb-6">
              {COOP_PRINCIPLES_DATA.ideology}
            </blockquote>

            <p className="text-sm text-gray-600 leading-relaxed max-w-xl mx-auto">
              สมาชิกทุกคนในอำเภอเชียงยืนร่วมมือกันสร้างความเข้มแข็งทางเศรษฐกิจ 
              ไม่เพียงเพื่อประโยชน์ของตนเอง แต่ส่งเสริมความกินดีอยู่ดีของเพื่อนสมาชิกทุกคนในชุมชน
            </p>
          </div>
        )}

        {/* Tab 3: Values */}
        {activeTab === 'values' && (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-emerald-100 text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#005B35] mx-auto mb-6 flex items-center justify-center">
              <Scale className="w-8 h-8 text-[#D4AF37]" />
            </div>

            <h3 className="text-2xl font-bold text-[#005B35] mb-6">
              คุณค่าของสหกรณ์ (Cooperative Values)
            </h3>

            <blockquote className="text-base sm:text-lg font-normal text-gray-700 leading-relaxed px-6 py-6 bg-emerald-50/50 rounded-2xl border border-emerald-100 mb-6 text-left sm:text-center">
              {COOP_PRINCIPLES_DATA.values}
            </blockquote>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs sm:text-sm font-medium text-emerald-800 pt-2">
              <div className="p-3 bg-gray-50 rounded-xl">การช่วยเหลือตนเอง</div>
              <div className="p-3 bg-gray-50 rounded-xl">ประชาธิปไตย</div>
              <div className="p-3 bg-gray-50 rounded-xl">ความเสมอภาค</div>
              <div className="p-3 bg-gray-50 rounded-xl">ความเที่ยงธรรม</div>
              <div className="p-3 bg-gray-50 rounded-xl">ความสุจริตโปร่งใส</div>
              <div className="p-3 bg-gray-50 rounded-xl">ความเอื้ออาทรต่อผู้อื่น</div>
            </div>
          </div>
        )}

        {/* Tab 4: Methods */}
        {activeTab === 'methods' && (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-emerald-100 text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#005B35] mx-auto mb-6 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-[#D4AF37]" />
            </div>

            <h3 className="text-2xl font-bold text-[#005B35] mb-6">
              วิธีการสหกรณ์ (Cooperative Methods)
            </h3>

            <blockquote className="text-lg sm:text-xl font-normal text-gray-700 italic leading-relaxed px-4 py-6 bg-amber-50/50 rounded-2xl border border-amber-200/60 mb-6">
              {COOP_PRINCIPLES_DATA.methods}
            </blockquote>

            <p className="text-sm text-gray-600 leading-relaxed max-w-xl mx-auto">
              นำหลักการทั้ง 7 ข้อมาลงมือปฏิบัติจริง ทั้งในงานสินเชื่อ การจัดหาสินค้า การรวบรวมข้าวเปลือก 
              และการแปรรูปผลผลิต เพื่อให้เกิดประโยชน์สูงสุดแก่ชาวอำเภอเชียงยืน
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
