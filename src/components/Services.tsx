import React, { useState } from 'react';
import {
  Banknote,
  PackagePlus,
  Wheat,
  Factory,
  HeartHandshake,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
} from 'lucide-react';
import { SiteSettings } from '../types';

interface ServicesProps {
  settings: SiteSettings;
  onNavigate: (sectionId: string) => void;
}

export const Services: React.FC<ServicesProps> = ({ settings, onNavigate }) => {
  const [activeService, setActiveService] = useState<number>(0);
  const messengerUrl = `https://m.me/${settings.facebookMessengerId || 'chiangyuencoop'}`;

  const services = [
    {
      id: 'credit-savings',
      title: 'บริการสินเชื่อและเงินฝากออมทรัพย์',
      shortDesc: 'แหล่งเงินทุนดอกเบี้ยเป็นธรรมเพื่อการเกษตร พร้อมบัญชีเงินฝากผลตอบแทนสูง มั่นคง ปลอดภัย',
      icon: Banknote,
      details: [
        'สินเชื่อเพื่อการเพาะปลูกและจัดหาปัจจัยการผลิต (ปุ๋ย เมล็ดพันธุ์ ยาปราบศัตรูพืช)',
        'สินเชื่อระยะปานกลางเพื่อการจัดซื้อเครื่องจักรกลการเกษตรและปรับปรุงฟาร์ม',
        'เงินฝากออมทรัพย์ดอกเบี้ยสูงสำหรับสมาชิก ได้รับการยกเว้นภาษีดอกเบี้ย',
        'เงินฝากประจำเพื่อสร้างความมั่นคงในอนาคตของครอบครัวเกษตรกร',
        'ระบบสวัสดิการคุ้มครองสินเชื่อและเงินปันผลตามส่วนธุรกิจประจำปี',
      ],
      stats: 'ดอกเบี้ยเงินกู้เป็นธรรม • เงินฝากผลตอบแทนสูง',
      contactDept: 'ฝ่ายสินเชื่อและการเงิน โทร 043-781-125',
    },
    {
      id: 'supplies',
      title: 'ธุรกิจจัดหาสินค้ามาจำหน่าย',
      shortDesc: 'จำหน่ายปุ๋ยเคมี ปุ๋ยอินทรีย์ เมล็ดพันธุ์ข้าวคุณภาพ และวัสดุอุปกรณ์การเกษตรในราคาสวัสดิการ',
      icon: PackagePlus,
      details: [
        'ปุ๋ยเคมีสูตรเฉพาะนาข้าวและพืชไร่ คุณภาพได้มาตรฐาน กรมวิชาการเกษตร',
        'ปุ๋ยอินทรีย์คุณภาพสูง ช่วยปรับปรุงบำรุงดินให้ร่วนซุย เพิ่มผลผลิตอย่างยั่งยืน',
        'เมล็ดพันธุ์ข้าวหอมมะลิ 105 และ กข6 รับรองความงอกสูงกว่า 85%',
        'เครื่องมือและอุปกรณ์การเกษตร สารชีวภัณฑ์ และฮอร์โมนพืช',
        'บริการสั่งจองล่วงหน้า พร้อมระบบเครดิตตามฤดูกาลสำหรับสมาชิกชั้นดี',
      ],
      stats: 'ราคาเป็นธรรม • คุณภาพแท้ 100% • ปลอดภัย',
      contactDept: 'ฝ่ายการตลาดและจัดหาสินค้า',
    },
    {
      id: 'produce',
      title: 'ธุรกิจรวบรวมผลผลิตการเกษตร',
      shortDesc: 'จุดรับซื้อข้าวเปลือกและผลผลิตหลักของสมาชิก ให้ราคายุติธรรม ตาชั่งเที่ยงตรง ตรวจสอบได้',
      icon: Wheat,
      details: [
        'ลานรับซื้อข้าวเปลือกหอมมะลิและข้าวเหนียว กข6 ในเขตอำเภอเชียงยืน',
        'เครื่องชั่งน้ำหนักรถบรรทุกระบบดิจิทัลมาตรฐาน ผ่านการรับรองจากกองชั่งตวงวัด',
        'เครื่องตรวจวัดความชื้นและสิ่งเจือปนที่เที่ยงธรรม โปร่งใสต่อหน้าสมาชิก',
                'จ่ายเงินสดรวดเร็ว หรือโอนเข้าบัญชีเงินฝากสหกรณ์ได้ทันที',
      ],
      stats: 'ตาชั่งมาตรฐาน • ชำระเงินรวดเร็ว • ซื่อตรง',
      contactDept: 'ฝ่ายการตลาดและรวบรวมผลผลิต',
    },
    {
      id: 'processing',
      title: 'สินค้าสหกรณ์',
      shortDesc: 'สินค้าสหกรณ์และผลิตภัณฑ์ชุมชนส่งตรงสู่ผู้บริโภค',
      icon: Factory,
      details: [
        'สินค้าสหกรณ์',
        'ผลิตภัณฑ์ของชุมชนผลิตส่งตรงสู่ผู้บริโภค',
               'สร้างตราสินค้าท้องถิ่น เพิ่มมูลค่าผลผลิตให้แก่พี่น้องสมาชิกเกษตรกรในพื้นที่',
        'จำหน่ายทั้งแบบปลีกและส่งแก่องค์กร โรงพยาบาล โรงเรียน และประชาชนทั่วไป',
      ],
      stats: 'สินค้ามาตรฐาน. • คัดพิเศษ',
      contactDept: 'ฝ่ายการตลาดและจัดหาสินค้ามาจำหน่าย',
    },
    {
      id: 'welfare',
      title: 'งานส่งเสริมอาชีพ',
      shortDesc: 'ดูแลสมาชิกตลอดช่วงชีวิต ส่งเสริมอาชีพและการฝึกอบรม',
      icon: HeartHandshake,
      details: [
        
        'จัดฝึกอบรมเชิงปฏิบัติการพัฒนาทักษะการทำเกษตรอินทรีย์และการลดต้นทุน',
        'เงินปันผลตามหุ้นและเงินเฉลี่ยคืนตามส่วนธุรกิจทุกสิ้นปีบัญชี',
        'ทุนการศึกษาสำหรับบุตรหลานสมาชิกผู้มีผลการเรียนดี',
      ],
      stats: 'เคียงข้างทุกช่วงชีวิต • มั่นคง • อบอุ่น',
      contactDept: 'ฝ่ายบริหารงานทั่วไปและสวัสดิการ',
    },
  ];

  return (
    <section id="services" className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-[#005B35] text-xs font-semibold uppercase tracking-wider mb-3">
            <Factory className="w-3.5 h-3.5" />
            <span>บริการเพื่อมวลสมาชิกและเกษตรกร</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#005B35]">
            บริการหลักของสหกรณ์การเกษตรเชียงยืน
          </h2>
          <div className="w-20 h-1 bg-[#D4AF37] mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-gray-600 text-sm sm:text-base leading-relaxed">
            ครอบคลุมทุกมิติการผลิตและการดำรงชีพของเกษตรกร ตั้งแต่เงินทุน ปัจจัยการผลิต 
            การรวบรวม การแปรรูป จนถึงการดูแลสวัสดิการสมาชิก
          </p>
        </div>

        {/* Desktop / Tablet Layout: Interactive Sidebar + Detail View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Service Selector Column */}
          <div className="lg:col-span-5 space-y-3">
            {services.map((srv, idx) => {
              const Icon = srv.icon;
              const isSelected = activeService === idx;
              return (
                <button
                  key={srv.id}
                  onClick={() => setActiveService(idx)}
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl transition-all border flex items-start gap-4 ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-emerald-300 shadow-sm'
                      : 'bg-white hover:bg-gray-50 border-gray-100'
                  }`}
                >
                  <div
                    className={`p-3 rounded-xl shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-[#005B35] text-white shadow-sm'
                        : 'bg-emerald-50 text-[#005B35]'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3
                        className={`text-base font-bold truncate ${
                          isSelected ? 'text-[#005B35]' : 'text-gray-800'
                        }`}
                      >
                        {srv.title}
                      </h3>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-[#D4AF37] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {srv.shortDesc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Service Showcase Card */}
          <div className="lg:col-span-7">
            {services[activeService] && (
              <div className="bg-slate-50 border border-emerald-100/80 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm relative overflow-hidden">
                {/* Decorative emblem watermarking */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

                <div className="relative">
                  {/* Badge & Title */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-2xl bg-[#005B35] text-white">
                      {React.createElement(services[activeService].icon, {
                        className: 'w-7 h-7',
                      })}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                        {services[activeService].stats}
                      </span>
                      <h3 className="text-2xl font-extrabold text-[#005B35]">
                        {services[activeService].title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-6 font-medium">
                    {services[activeService].shortDesc}
                  </p>

                  {/* Bullet Points */}
                  <div className="space-y-3.5 mb-8">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      จุดเด่นและบริการที่ครอบคลุม
                    </h4>
                    {services[activeService].details.map((detail, dIdx) => (
                      <div key={dIdx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#005B35] shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 leading-snug">
                          {detail}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Contact department footer */}
                  <div className="pt-6 border-t border-emerald-200/60 flex flex-wrap items-center justify-between gap-4">
                    <div className="text-xs text-gray-500">
                      <span>หน่วยงานรับผิดชอบ: </span>
                      <strong className="text-emerald-900 font-semibold">
                        {services[activeService].contactDept}
                      </strong>
                    </div>

                    <div className="flex items-center gap-3">
                      <a
                        href={messengerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#005B35] hover:bg-[#004527] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all"
                      >
                        <MessageCircle className="w-4 h-4 text-[#D4AF37]" />
                        <span>สอบถามผ่านแชท</span>
                      </a>

                      <button
                        onClick={() => onNavigate('contact')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs sm:text-sm font-medium transition-colors"
                      >
                        <span>ติดต่อสหกรณ์</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
