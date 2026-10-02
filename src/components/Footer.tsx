import React from 'react';
import { SiteSettings } from '../types';
import { CoopLogo } from './common/CoopLogo';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  ExternalLink,
  Shield,
  Heart,
  Lock,
} from 'lucide-react';

interface FooterProps {
  settings: SiteSettings;
  onNavigate: (sectionId: string) => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onNavigate,
  onOpenAdmin,
  isAdminLoggedIn,
}) => {
  const currentYear = 2567; // Buddhist Era display or standard
  const messengerUrl = `https://m.me/${settings.facebookMessengerId || 'chiangyuencoop'}`;

  return (
    <footer className="bg-[#002B19] text-gray-300 relative border-t-4 border-[#D4AF37]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-emerald-900/80">
          {/* Org Identity & Vision */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <CoopLogo size="md" />
              <div>
                <h3 className="font-bold text-lg text-white">
                  {settings.coopName}
                </h3>
                <p className="text-xs text-amber-400 font-medium">
                  {settings.coopNameEn}
                </p>
              </div>
            </div>

            <p className="text-sm text-emerald-100/80 leading-relaxed font-light">
              "{settings.slogan}" มุ่งมั่นดำเนินธุรกิจเพื่อพัฒนาคุณภาพชีวิตของสมาชิกเกษตรกร 
              และสร้างสรรค์ระบบเศรษฐกิจชุมชนที่ยั่งยืนบนพื้นฐานคุณค่าสหกรณ์สากล
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href={messengerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#D4AF37]" />
                <span>แชท Facebook</span>
                <ExternalLink className="w-3 h-3 text-emerald-300" />
              </a>

              {settings.facebookPageUrl && (
                <a
                  href={settings.facebookPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
                >
                  <span>หน้าเพจ Facebook</span>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider border-l-2 border-[#D4AF37] pl-2.5">
              เมนูลัด
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => onNavigate('hero')}
                  className="hover:text-amber-300 transition-colors"
                >
                  หน้าแรก (Home)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-amber-300 transition-colors"
                >
                  เกี่ยวกับเรา & หลักการสหกรณ์ 7 ข้อ
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services')}
                  className="hover:text-amber-300 transition-colors"
                >
                  บริการสินเชื่อ รวบรวม แปรรูป จัดหาปัจจัย
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('products')}
                  className="hover:text-amber-300 transition-colors"
                >
                  สินค้าเกษตรและข้าวสารแปรรูป
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('personnel')}
                  className="hover:text-amber-300 transition-colors"
                >
                  คณะกรรมการชุดที่ 55 และบุคลากร
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('news')}
                  className="hover:text-amber-300 transition-colors"
                >
                  ข่าวสาร ประกาศ และเอกสารดาวน์โหลด
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details Column */}
          <div className="lg:col-span-4 space-y-3 text-xs sm:text-sm">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider border-l-2 border-[#D4AF37] pl-2.5">
              ข้อมูลการติดต่อ
            </h4>
            <div className="space-y-2.5 text-emerald-100/80">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>
                  {settings.address} {settings.subdistrict} {settings.district} {settings.province} {settings.postalCode}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>{settings.phone} {settings.phoneAlt ? `| ${settings.phoneAlt}` : ''}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>{settings.email}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>{settings.workingHours}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 text-xs text-amber-300 hover:text-white transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isAdminLoggedIn ? 'ไปที่แดชบอร์ดจัดการระบบ' : 'ระบบจัดการข้อมูลเจ้าหน้าที่ (Admin Login)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-200/60 text-center sm:text-left">
          <div>
            © {currentYear} {settings.coopName} สงวนลิขสิทธิ์ตามกฎหมาย
          </div>
          <div className="flex items-center gap-2">
            <span>ส่งเสริมและกำกับดูแลโดย กรมส่งเสริมสหกรณ์ และ กรมตรวจบัญชีสหกรณ์</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
