import React, { useState, useMemo, useEffect } from 'react';
import { Personnel } from '../types';
import { Users, Search, Award, Briefcase, Shield, X, ZoomIn } from 'lucide-react';

interface PersonnelSectionProps {
  personnel: Personnel[];
}

/**
 * Component แสดงรูปโปรไฟล์บุคลากร
 */
export const PersonnelAvatar: React.FC<{
  imageUrl?: string;
  name: string;
  sizeClassName?: string;
  category?: 'committee' | 'executive' | 'staff';
}> = ({
  imageUrl,
  name,
  sizeClassName = 'w-18 h-18 sm:w-20 sm:h-20',
  category = 'staff',
}) => {
  const [imgError, setImgError] = useState(false);

  const hasValidImage = Boolean(imageUrl && !imgError && imageUrl.trim().length > 0);

  const ringGradient =
    category === 'committee'
      ? 'from-amber-500 via-amber-400 to-[#D4AF37]'
      : category === 'executive'
      ? 'from-emerald-700 via-emerald-500 to-[#D4AF37]'
      : 'from-emerald-600 via-teal-500 to-[#D4AF37]';

  return (
    <div
      className={`${sizeClassName} rounded-full mx-auto p-1 bg-gradient-to-tr ${ringGradient} shadow-xs group-hover:scale-105 transition-transform duration-300 shrink-0`}
    >
      <div className="w-full h-full rounded-full bg-slate-50 overflow-hidden flex items-center justify-center relative shadow-inner">
        {hasValidImage ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover rounded-full"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50/40 to-amber-50/60 text-[#005B35]">
            <svg
              className="w-8 h-8 sm:w-9 sm:h-9 text-[#005B35]/70"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            <span className="text-[9px] font-semibold text-emerald-800 -mt-0.5 tracking-tight truncate max-w-[85%] px-0.5">
              {(name || '').split(' ')[0] || 'บุคลากร'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export const PersonnelSection: React.FC<PersonnelSectionProps> = ({ personnel = [] }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<Personnel | null>(null);

  // ปิด Modal ด้วยปุ่ม Escape และจัดการ scroll ของ body
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedMember(null);
      }
    };
    if (selectedMember) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedMember]);

  // กรองข้อมูลด้วยคำค้นหา
  const searchedPersonnel = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return personnel;
    return personnel.filter((p) => {
      const nameMatch = (p.name || '').toLowerCase().includes(q);
      const posMatch = (p.position || '').toLowerCase().includes(q);
      const deptMatch = (p.department || '').toLowerCase().includes(q);
      return nameMatch || posMatch || deptMatch;
    });
  }, [personnel, searchQuery]);

  // คณะกรรมการ
  const committeeMembers = useMemo(
    () => searchedPersonnel.filter((p) => p.category === 'committee'),
    [searchedPersonnel]
  );

  // ผู้บริหารระดับสูง
  const executiveMembers = useMemo(() => {
    const list = searchedPersonnel.filter((p) => p.category === 'executive');
    return list.sort((a, b) => {
      const isManagerA =
        (a.position || '').includes('ผู้จัดการ') &&
        !(a.position || '').includes('ผู้ช่วย') &&
        !(a.position || '').includes('รอง');
      const isManagerB =
        (b.position || '').includes('ผู้จัดการ') &&
        !(b.position || '').includes('ผู้ช่วย') &&
        !(b.position || '').includes('รอง');
      if (isManagerA && !isManagerB) return -1;
      if (!isManagerA && isManagerB) return 1;
      return (a.order || 0) - (b.order || 0);
    });
  }, [searchedPersonnel]);

  // เจ้าหน้าที่ทั้งหมด
  const staffMembers = useMemo(
    () => searchedPersonnel.filter((p) => p.category === 'staff'),
    [searchedPersonnel]
  );

  // รายชื่อแผนก/ฝ่ายงาน
  const departments = useMemo(() => {
    const set = new Set<string>();
    personnel.filter(p => p.category === 'staff').forEach((s) => {
      if (s.department) set.add(s.department);
    });
    return Array.from(set);
  }, [personnel]);

  // จัดกลุ่มเจ้าหน้าที่แยกตามฝ่ายงาน (รวมหัวหน้าและลูกจ้างเข้าด้วยกันอย่างเป็นระบบ)
  const staffByDepartment = useMemo(() => {
    const filteredStaff = staffMembers.filter(
      (p) => departmentFilter === 'all' || p.department === departmentFilter
    );

    const grouped: { [key: string]: { heads: Personnel[]; members: Personnel[] } } = {};

    filteredStaff.forEach((p) => {
      const dept = p.department || 'ฝ่ายปฏิบัติการทั่วไป';
      if (!grouped[dept]) {
        grouped[dept] = { heads: [], members: [] };
      }

      const isHead = (p.position || '').includes('หัวหน้า') || (p.position || '').includes('สมุห์');
      if (isHead) {
        grouped[dept].heads.push(p);
      } else {
        grouped[dept].members.push(p);
      }
    });

    return grouped;
  }, [staffMembers, departmentFilter]);

  return (
    <section id="personnel" className="py-20 bg-slate-50/50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-[#005B35] text-xs font-semibold uppercase tracking-wider mb-3">
            <Users className="w-3.5 h-3.5" />
            <span>โครงสร้างและผังองค์กร</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#005B35]">
            คณะกรรมการและผังบุคลากรสหกรณ์
          </h2>
          <div className="w-20 h-1 bg-[#D4AF37] mx-auto mt-4 rounded-full" />
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-10 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อ-นามสกุล, ตำแหน่ง หรือฝ่ายงาน..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005B35] focus:bg-white"
            />
          </div>

          {departments.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">กรองเฉพาะฝ่าย:</span>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="text-xs py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005B35]"
              >
                <option value="all">แสดงทุกฝ่ายงาน</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* HIERARCHY TREE VIEW */}
        <div className="space-y-12">
          
          {/* LEVEL 1: BOARD OF DIRECTORS */}
          <div className="bg-white border border-amber-200 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-amber-400" />
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-amber-500 text-stone-950 font-bold text-base sm:text-lg shadow-xs">
                <Award className="w-5 h-5 text-stone-900" />
                <span>1. คณะกรรมการดำเนินการ ชุดที่ 56</span>
              </div>
            </div>

            {committeeMembers.length === 0 ? (
              <p className="text-center text-gray-400 text-xs py-4">ไม่พบข้อมูลคณะกรรมการ</p>
            ) : (
              <div className="space-y-8">
                {/* ประธานกรรมการ */}
                <div className="flex justify-center">
                  {committeeMembers
                    .filter((p) => (p.position || '').includes('ประธานกรรมการ') && !(p.position || '').includes('รอง'))
                    .map((p) => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedMember(p)}
                        className="bg-amber-50/40 rounded-2xl p-5 border-2 border-amber-400 text-center w-full max-w-xs shadow-xs cursor-pointer hover:shadow-lg hover:scale-105 hover:border-amber-500 transition-all duration-300 group"
                        title="คลิกเพื่อดูรูปภาพขนาดใหญ่"
                        role="button"
                        tabIndex={0}
                      >
                        <PersonnelAvatar
                          imageUrl={p.imageUrl}
                          name={p.name}
                          category="committee"
                          sizeClassName="w-20 h-20 mb-3"
                        />
                        <h4 className="font-bold text-base text-[#005B35] group-hover:text-emerald-800 transition-colors">{p.name}</h4>
                        <p className="text-xs font-bold text-amber-800 mt-1">{p.position}</p>
                      </div>
                    ))}
                </div>

                {/* รองประธาน & เลขานุการ */}
                <div className="flex justify-center gap-4 sm:gap-8 flex-wrap">
                  {committeeMembers
                    .filter((p) => (p.position || '').includes('รองประธาน') || (p.position || '').includes('เลขานุการ'))
                    .map((p) => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedMember(p)}
                        className="bg-white rounded-2xl p-4 border border-amber-200 text-center w-48 sm:w-56 shadow-2xs cursor-pointer hover:shadow-lg hover:scale-105 hover:border-amber-400 transition-all duration-300 group"
                        title="คลิกเพื่อดูรูปภาพขนาดใหญ่"
                        role="button"
                        tabIndex={0}
                      >
                        <PersonnelAvatar
                          imageUrl={p.imageUrl}
                          name={p.name}
                          category="committee"
                          sizeClassName="w-16 h-16 sm:w-18 sm:h-18 mb-2"
                        />
                        <h4 className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-[#005B35] transition-colors">{p.name}</h4>
                        <p className="text-xs text-amber-700 font-medium mt-0.5">{p.position}</p>
                      </div>
                    ))}
                </div>

                {/* กรรมการดำเนินการ */}
                <div>
                  <h5 className="text-xs font-bold text-stone-400 uppercase tracking-wider text-center mb-4">
                    กรรมการดำเนินการ
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {committeeMembers
                      .filter((p) => p.position === 'กรรมการ')
                      .map((p) => (
                        <div
                          key={p.id}
                          onClick={() => setSelectedMember(p)}
                          className="bg-gray-50/80 rounded-xl p-3 border border-gray-200 text-center cursor-pointer hover:shadow-md hover:scale-105 hover:bg-amber-50/30 hover:border-amber-300 transition-all duration-300 group"
                          title="คลิกเพื่อดูรูปภาพขนาดใหญ่"
                          role="button"
                          tabIndex={0}
                        >
                          <PersonnelAvatar
                            imageUrl={p.imageUrl}
                            name={p.name}
                            category="committee"
                            sizeClassName="w-14 h-14 mb-2"
                          />
                          <h4 className="font-semibold text-xs text-gray-800 group-hover:text-[#005B35] transition-colors">{p.name}</h4>
                          <p className="text-[11px] text-gray-500 mt-0.5">{p.position}</p>
                        </div>
                      ))}
                  </div>
                </div>

                {/* ผู้ตรวจสอบกิจการ */}
                <div className="pt-6 border-t border-amber-100">
                  <h5 className="text-xs font-bold text-amber-800 uppercase tracking-wider text-center mb-4">
                    ผู้ตรวจสอบกิจการ
                  </h5>
                  <div className="flex justify-center gap-4 flex-wrap">
                    {committeeMembers
                      .filter((p) => (p.position || '').includes('ผู้ตรวจสอบกิจการ'))
                      .map((p) => (
                        <div
                          key={p.id}
                          onClick={() => setSelectedMember(p)}
                          className="bg-amber-50/30 rounded-xl p-3.5 border border-amber-200 text-center w-48 cursor-pointer hover:shadow-lg hover:scale-105 hover:border-amber-400 transition-all duration-300 group"
                          title="คลิกเพื่อดูรูปภาพขนาดใหญ่"
                          role="button"
                          tabIndex={0}
                        >
                          <PersonnelAvatar
                            imageUrl={p.imageUrl}
                            name={p.name}
                            category="committee"
                            sizeClassName="w-16 h-16 mb-2"
                          />
                          <h4 className="font-bold text-xs text-[#005B35] group-hover:text-emerald-800 transition-colors">{p.name}</h4>
                          <p className="text-[11px] text-amber-700 font-medium mt-0.5">{p.position}</p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* LEVEL 2: EXECUTIVE MANAGEMENT */}
          <div className="bg-white border border-emerald-200 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-emerald-600" />
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-[#005B35] text-white font-bold text-base shadow-xs">
                <Shield className="w-5 h-5 text-emerald-300" />
                <span>2. ฝ่ายบริหารจัดการระดับสูง</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              {executiveMembers.map((exec) => (
                <div
                  key={exec.id}
                  onClick={() => setSelectedMember(exec)}
                  className="bg-emerald-50/30 rounded-2xl p-5 border-2 border-emerald-500 text-center w-full max-w-sm shadow-xs cursor-pointer hover:shadow-lg hover:scale-105 hover:border-emerald-600 transition-all duration-300 group"
                  title="คลิกเพื่อดูรูปภาพขนาดใหญ่"
                  role="button"
                  tabIndex={0}
                >
                  <PersonnelAvatar
                    imageUrl={exec.imageUrl}
                    name={exec.name}
                    category="executive"
                    sizeClassName="w-20 h-20 mb-3"
                  />
                  <h4 className="font-bold text-base text-[#005B35] group-hover:text-emerald-900 transition-colors">{exec.name}</h4>
                  <p className="text-xs font-bold text-amber-700 mt-1">{exec.position}</p>
                </div>
              ))}
            </div>
          </div>

          {/* LEVEL 3 & 4: DEPARTMENTS (HEADS & STAFF) */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-teal-600" />
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-teal-700 text-white font-bold text-base shadow-xs">
                <Briefcase className="w-5 h-5 text-teal-300" />
                <span>3. ฝ่ายปฏิบัติการและเจ้าหน้าที่แยกตามฝ่ายงาน</span>
              </div>
            </div>

            <div className="space-y-10">
              {Object.keys(staffByDepartment).length === 0 ? (
                <p className="text-center text-gray-400 text-xs py-4">ไม่พบข้อมูลเจ้าหน้าที่</p>
              ) : (
                Object.entries(staffByDepartment).map(([deptName, group]) => (
                  <div key={deptName} className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200">
                    {/* ชื่อฝ่ายงาน */}
                    <div className="border-b border-slate-200 pb-3 mb-5">
                      <h4 className="text-sm sm:text-base font-bold text-[#005B35] flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        {deptName}
                      </h4>
                    </div>

                    {/* หัวหน้าฝ่าย (Level 3) */}
                    {group.heads.length > 0 && (
                      <div className="mb-6">
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full mb-3 inline-block">
                          หัวหน้าฝ่าย / ผู้ควบคุมงาน
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {group.heads.map((p) => (
                            <div
                              key={p.id}
                              onClick={() => setSelectedMember(p)}
                              className="bg-white rounded-xl p-4 border border-emerald-300 shadow-2xs flex items-center gap-3 cursor-pointer hover:shadow-lg hover:scale-105 hover:border-emerald-500 transition-all duration-300 group"
                              title="คลิกเพื่อดูรูปภาพขนาดใหญ่"
                              role="button"
                              tabIndex={0}
                            >
                              <PersonnelAvatar
                                imageUrl={p.imageUrl}
                                name={p.name}
                                category="staff"
                                sizeClassName="w-14 h-14"
                              />
                              <div className="text-left">
                                <h5 className="font-bold text-xs text-gray-900 group-hover:text-[#005B35] transition-colors">{p.name}</h5>
                                <p className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                                  {p.position}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* เจ้าหน้าที่และลูกจ้าง (Level 4) */}
                    {group.members.length > 0 && (
                      <div>
                        <span className="text-[11px] font-medium text-gray-600 bg-gray-200/70 px-2.5 py-0.5 rounded-full mb-3 inline-block">
                          เจ้าหน้าที่ / ลูกจ้างประจำ
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          {group.members.map((p) => (
                            <div
                              key={p.id}
                              onClick={() => setSelectedMember(p)}
                              className="bg-white rounded-xl p-3 border border-gray-200 text-center cursor-pointer hover:shadow-md hover:scale-105 hover:border-emerald-400 hover:bg-emerald-50/20 transition-all duration-300 group"
                              title="คลิกเพื่อดูรูปภาพขนาดใหญ่"
                              role="button"
                              tabIndex={0}
                            >
                              <PersonnelAvatar
                                imageUrl={p.imageUrl}
                                name={p.name}
                                category="staff"
                                sizeClassName="w-14 h-14 mb-2"
                              />
                              <h5 className="font-medium text-xs text-gray-800 leading-tight group-hover:text-[#005B35] transition-colors">
                                {p.name}
                              </h5>
                              <p className="text-[10px] text-gray-500 mt-1">{p.position}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* LIGHTBOX / MODAL ขยายดูรูปภาพขนาดใหญ่ */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedMember(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative bg-white rounded-3xl max-w-sm sm:max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col items-center p-6 sm:p-8 animate-in zoom-in-95 duration-200 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ปุ่มปิด (X) ที่มุมขวาบน */}
            <button
              type="button"
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-black transition-colors shadow-xs z-10 cursor-pointer"
              title="ปิดหน้าต่าง (Esc)"
              aria-label="ปิด"
            >
              <X className="w-5 h-5" />
            </button>

            {/* รูปภาพขนาดใหญ่ตรงกลาง */}
            <div className="relative w-60 h-60 sm:w-72 sm:h-72 rounded-2xl overflow-hidden shadow-md border-4 border-emerald-600/20 mb-6 bg-slate-100 shrink-0 flex items-center justify-center">
              {selectedMember.imageUrl ? (
                <img
                  src={selectedMember.imageUrl}
                  alt={selectedMember.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-amber-50 text-[#005B35]">
                  <Users className="w-20 h-20 text-[#005B35]/50 mb-2" />
                  <span className="text-xs font-semibold text-emerald-800">ไม่มีรูปภาพโปรไฟล์</span>
                </div>
              )}
            </div>

            {/* ฝ่ายงาน / กลุ่มงาน (ถ้ามี) */}
            {selectedMember.department && (
              <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#005B35] border border-emerald-200 mb-2.5">
                {selectedMember.department}
              </span>
            )}

            {/* ชื่อ-นามสกุล ด้วยตัวหนังสือขนาดใหญ่ อ่านได้ชัดเจน */}
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug">
              {selectedMember.name}
            </h3>

            {/* ตำแหน่ง ด้วยตัวหนังสือขนาดใหญ่ อ่านได้ชัดเจน */}
            <p className="text-base sm:text-lg font-bold text-amber-700 mt-1.5 leading-normal">
              {selectedMember.position}
            </p>

            {/* คำแนะนำ */}
            <p className="text-[11px] text-gray-400 mt-5">
              กดปุ่ม X หรือคลิกบริเวณสีดำรอบๆ เพื่อปิด
            </p>
          </div>
        </div>
      )}
    </section>
  );
};