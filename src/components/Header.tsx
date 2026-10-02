import React, { useState } from 'react';
import { CoopLogo } from './common/CoopLogo';
import { SiteSettings } from '../types';
import {
  Phone,
  Clock,
  MapPin,
  Menu,
  X,
  Lock,
  MessageCircle,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';

interface HeaderProps {
  settings: SiteSettings;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  activeSection,
  onNavigate,
  onOpenAdmin,
  isAdminLoggedIn,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'hero', label: 'หน้าแรก' },
    { id: 'about', label: 'เกี่ยวกับเรา & หลักการ' },
    { id: 'services', label: 'บริการสหกรณ์' },
    { id: 'products', label: 'สินค้าเกษตร' },
    { id: 'personnel', label: 'คณะกรรมการและบุคลากร' },
    { id: 'news', label: 'ข่าวสาร & ประกาศ' },
    { id: 'contact', label: 'ติดต่อเรา' },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  const messengerUrl = `https://m.me/${settings.facebookMessengerId || 'chiangyuencoop'}`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
      {/* Top Bar for institutional credibility */}
      <div className="bg-[#004527] text-white text-xs py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-emerald-100">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
              {settings.district} {settings.province}
            </span>
            <span className="flex items-center gap-1.5 text-emerald-100">
              <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
              ติดต่อ: {settings.phone} {settings.phoneAlt ? `| ${settings.phoneAlt}` : ''}
            </span>
            <span className="flex items-center gap-1.5 text-emerald-100">
              <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
              เวลาทำการ: {settings.workingHours}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={messengerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-amber-200 hover:text-white transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>แชทสอบถามทาง Facebook</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={onOpenAdmin}
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs transition-colors ${
                isAdminLoggedIn
                  ? 'bg-amber-400 text-stone-900 font-bold hover:bg-amber-300'
                  : 'bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 hover:text-white'
              }`}
            >
              <Lock className="w-3 h-3" />
              <span>{isAdminLoggedIn ? 'แดชบอร์ดแอดมิน (เข้าสู่ระบบแล้ว)' : 'เข้าสู่ระบบแอดมิน'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Org Title */}
          <div
            onClick={() => handleNavClick('hero')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <CoopLogo size="md" />
            <div>
              <div className="font-bold text-lg sm:text-xl text-[#005B35] leading-snug group-hover:text-emerald-700 transition-colors">
                {settings.coopName}
              </div>
              <div className="text-xs text-amber-700 font-medium">
                {settings.coopNameEn}
              </div>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? 'text-[#005B35] bg-emerald-50 font-semibold border-b-2 border-[#005B35]'
                      : 'text-gray-600 hover:text-[#005B35] hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Quick CTA Actions */}
          <div className="hidden sm:flex items-center gap-2">
            <a
              href={messengerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#005B35] hover:bg-[#004527] text-white text-xs sm:text-sm font-medium shadow-sm transition-all hover:shadow"
            >
              <MessageCircle className="w-4 h-4 text-[#D4AF37]" />
              <span>แชท Facebook</span>
            </a>

            <button
              onClick={() => handleNavClick('products')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs sm:text-sm font-medium transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-[#005B35]" />
              <span>สั่งซื้อสินค้า</span>
            </button>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={onOpenAdmin}
              className="p-2 rounded-md text-gray-600 hover:text-emerald-700 hover:bg-gray-100"
              title="ระบบแอดมิน"
            >
              <Lock className="w-5 h-5" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:text-[#005B35] hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white px-4 pt-2 pb-6 space-y-1 shadow-lg animate-in slide-in-from-top duration-200">
          <div className="py-2 mb-2 border-b border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>{settings.workingHours}</span>
            <span className="font-semibold text-[#005B35]">{settings.phone}</span>
          </div>

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium ${
                activeSection === item.id
                  ? 'bg-emerald-50 text-[#005B35] font-semibold border-l-4 border-[#005B35]'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {item.label}
            </button>
          ))}

          <div className="pt-4 border-t border-gray-100 space-y-2">
            <a
              href={messengerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-[#005B35] text-white text-sm font-medium shadow-sm"
            >
              <MessageCircle className="w-4 h-4 text-[#D4AF37]" />
              <span>สั่งซื้อ / สอบถามทาง Facebook Messenger</span>
            </a>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 text-sm font-medium"
            >
              <Lock className="w-4 h-4" />
              <span>{isAdminLoggedIn ? 'เข้าสู่แดชบอร์ดแอดมิน' : 'เข้าสู่ระบบแอดมิน'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
