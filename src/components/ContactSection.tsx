import React, { useState } from 'react';
import { SiteSettings } from '../types';
import { submitInquiry } from '../services/db';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageCircle,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface ContactSectionProps {
  settings: SiteSettings;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ settings }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    memberId: '',
    subject: '',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messengerUrl = `https://m.me/${settings.facebookMessengerId || 'chiangyuencoop'}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      setError('กรุณากรอกชื่อ หมายเลขโทรศัพท์ และข้อความให้ครบถ้วน');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await submitInquiry({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        memberId: formData.memberId.trim() || undefined,
        subject: formData.subject.trim() || 'ติดต่อสอบถามทั่วไป',
        message: formData.message.trim(),
      });
      setSuccess(true);
      setFormData({
        name: '',
        phone: '',
        email: '',
        memberId: '',
        subject: '',
        message: '',
      });
      setTimeout(() => setSuccess(false), 8000);
    } catch (err) {
      console.error('Error submitting inquiry:', err);
      setError('เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่อีกครั้ง หรือติดต่อทางโทรศัพท์');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-[#005B35] text-xs font-semibold uppercase tracking-wider mb-3">
            <MapPin className="w-3.5 h-3.5" />
            <span>ช่องทางการติดต่อและที่ตั้ง</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#005B35]">
            ติดต่อสหกรณ์การเกษตรเชียงยืน จำกัด
          </h2>
          <div className="w-20 h-1 bg-[#D4AF37] mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-gray-600 text-sm sm:text-base leading-relaxed">
            ยินดีต้อนรับสมาชิกและประชาชนทุกท่าน สามารถติดต่อสอบถามข้อมูลสินเชื่อ สินค้าเกษตร 
            หรือส่งข้อความผ่านแบบฟอร์มด้านล่าง เจ้าหน้าที่จะติดต่อกลับโดยเร็วที่สุด
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Contact Cards & Social */}
          <div className="lg:col-span-5 space-y-6">
            {/* Primary Address Box */}
            <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-2xs overflow-hidden">
              {/* Photo of headquarters building */}
              <div className="rounded-2xl overflow-hidden mb-6 border border-emerald-200/80 shadow-xs relative aspect-16/9 group bg-slate-900">
                <img
                  src={`${import.meta.env.BASE_URL}office.jpg`}
                  alt="อาคารสำนักงานใหญ่ สหกรณ์การเกษตรเชียงยืน จำกัด"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-2.5 left-3 right-3 text-white text-xs font-medium flex items-center justify-between">
                  <span>อาคารสำนักงานใหญ่ สหกรณ์การเกษตรเชียงยืน จำกัด</span>
                  <span className="text-[10px] bg-emerald-700/80 px-2 py-0.5 rounded-full border border-emerald-500/50">
                    3 ชั้น
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-[#005B35] mb-5">
                ที่ตั้งสำนักงานใหญ่
              </h3>

              <div className="space-y-4 text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-[#005B35] shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{settings.coopName}</div>
                    <div className="text-gray-600 mt-0.5">
                      {settings.address} {settings.subdistrict} {settings.district} {settings.province} {settings.postalCode}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-[#005B35] shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">โทรศัพท์สำนักงาน</div>
                    <div className="font-semibold text-gray-900">
                      {settings.phone} {settings.phoneAlt ? ` / ${settings.phoneAlt}` : ''}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-[#005B35] shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">อีเมลทางการ</div>
                    <div className="font-semibold text-gray-900">{settings.email}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-[#005B35] shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">เวลาให้บริการ</div>
                    <div className="font-semibold text-gray-900">{settings.workingHours}</div>
                  </div>
                </div>
              </div>

              {/* Fast Social Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200/80 space-y-3">
                <a
                  href={messengerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#005B35] text-white hover:bg-[#004527] transition-colors shadow-sm group"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-[#D4AF37]" />
                    <span className="font-semibold text-sm">แชท Facebook Messenger</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-emerald-200 group-hover:translate-x-0.5 transition-transform" />
                </a>

                {settings.facebookPageUrl && (
                  <a
                    href={settings.facebookPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50 text-blue-900 hover:bg-blue-100 transition-colors border border-blue-200 group text-sm font-semibold"
                  >
                    <span>ติดตามเพจ Facebook ทางการ</span>
                    <ExternalLink className="w-4 h-4 text-blue-700" />
                  </a>
                )}
              </div>
            </div>

            {/* Map / Directions guidance card */}
            <div className="bg-amber-50/60 rounded-3xl p-6 border border-amber-200/70 text-amber-950 text-xs sm:text-sm space-y-2">
              <div className="font-bold text-base text-amber-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-700" />
                <span>การเดินทางมายังสหกรณ์</span>
              </div>
              <p className="text-stone-700 leading-relaxed">
                ตั้งอยู่บนทางหลวงสายขอนแก่น - ยางตลาด (สาย 209) อำเภอเชียงยืน จังหวัดมหาสารคาม 
                มีลานจอดรถกว้างขวาง ลานตากข้าวเปลือก และอาคารบริการสินเชื่อครบวงจร
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Feedback / Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-slate-50 rounded-3xl p-6 sm:p-10 border border-emerald-100 shadow-2xs">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-[#005B35]">
                  ส่งข้อความติดต่อ / สอบถามเจ้าหน้าที่
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  กรอกข้อมูลด้านล่าง ข้อความจะถูกส่งตรงเข้าสู่ระบบจัดการของเจ้าหน้าที่ทันที
                </p>
              </div>

              {success && (
                <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 flex items-start gap-3.5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="p-2 rounded-xl bg-emerald-100 text-[#005B35] shrink-0 mt-0.5 shadow-2xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-extrabold text-base text-[#005B35]">ส่งข้อมูลสำเร็จ!</div>
                    <div className="text-xs sm:text-sm text-emerald-800 mt-1 leading-relaxed">
                      เจ้าหน้าที่ได้รับข้อความของท่านแล้ว และจะติดต่อกลับโดยเร็วที่สุด
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm font-medium">{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      ชื่อ - นามสกุล <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      disabled={submitting}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="นายสมชาย ใจดี"
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#005B35] disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      หมายเลขโทรศัพท์ติดต่อ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      disabled={submitting}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="081-234-5678"
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#005B35] disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      อีเมล (ถ้ามี)
                    </label>
                    <input
                      type="email"
                      disabled={submitting}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="example@mail.com"
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#005B35] disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      เลขทะเบียนสมาชิก (กรณีเป็นสมาชิก)
                    </label>
                    <input
                      type="text"
                      disabled={submitting}
                      value={formData.memberId}
                      onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                      placeholder="เช่น 04567 (ถ้ามี)"
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#005B35] disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    เรื่องที่ต้องการติดต่อ / บริการที่สนใจ
                  </label>
                  <select
                    disabled={submitting}
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#005B35] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="ติดต่อสอบถามทั่วไป">ติดต่อสอบถามทั่วไป</option>
                    <option value="บริการสินเชื่อและเงินฝาก">บริการสินเชื่อและเงินฝาก</option>
                    <option value="สั่งซื้อปุ๋ย/ยา/เมล็ดพันธุ์">สั่งซื้อปุ๋ย/ยา/เมล็ดพันธุ์</option>
                    <option value="จำหน่ายข้าวเปลือก/ผลผลิต">จำหน่ายข้าวเปลือก/ผลผลิต</option>
                    <option value="สั่งซื้อข้าวสารแปรรูป">สั่งซื้อข้าวสารแปรรูป</option>
                    <option value="งานสวัสดิการสมาชิก/ฌาปนกิจ">งานสวัสดิการสมาชิก/ฌาปนกิจ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    ข้อความรายละเอียด <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    disabled={submitting}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="พิมพ์รายละเอียดที่ต้องการสอบถามหรือเสนอแนะ..."
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#005B35] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#005B35] hover:bg-[#004527] text-white font-bold text-sm shadow-md transition-all hover:scale-105 active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100 disabled:opacity-75"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>กำลังส่งข้อมูล...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-[#D4AF37]" />
                      <span>ส่งข้อความถึงสหกรณ์</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
