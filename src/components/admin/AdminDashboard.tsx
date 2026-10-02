import React, { useState, useEffect, useMemo } from 'react';
import { Product, Personnel, NewsItem, SiteSettings, ContactInquiry, ProductCategory, PersonnelCategory, NewsCategory } from '../../types';
import {
  addProduct,
  updateProduct,
  deleteProduct,
  addPersonnel,
  updatePersonnel,
  deletePersonnel,
  resetPersonnelToOfficialRoster,
  addNewsItem,
  updateNewsItem,
  deleteNewsItem,
  deleteDuplicateNews,
  updateSiteSettings,
  updateInquiryStatus,
  deleteInquiry,
} from '../../services/db';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Save,
  ShoppingBag,
  Users,
  Bell,
  Settings as SettingsIcon,
  MessageSquare,
  LogOut,
  CheckCircle,
  ExternalLink,
  RotateCcw,
  Eye,
  EyeOff,
  Tag,
  Phone,
  Mail,
  AlertCircle,
  AlertTriangle,
  Loader2,
  User,
  Calendar,
  Layers,
  ImageIcon,
} from 'lucide-react';
import { CoopLogo } from '../common/CoopLogo';
import { ImageUploadField } from './ImageUploadField';
import { MultiImageUploadField } from './MultiImageUploadField';
import { compareNewsDescending, formatThaiDate } from '../../utils/dateUtils';

interface DeleteConfirmTarget {
  type: 'news' | 'product' | 'personnel' | 'inquiry' | 'reset-roster' | 'clean-duplicates';
  id?: string;
  title: string;
  subtitle?: string;
}

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  personnel: Personnel[];
  news: NewsItem[];
  settings: SiteSettings;
  inquiries: ContactInquiry[];
  isLoggedIn: boolean;
  onLogin: (email?: string, pass?: string) => Promise<boolean>;
  onLogout: () => void;
  onDeleteNews?: (id: string) => void;
  onDeleteProduct?: (id: string) => void;
  onDeletePersonnel?: (id: string) => void;
  onDeleteInquiry?: (id: string) => void;
  onUpdateNews?: (updatedNews: NewsItem[]) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  products,
  personnel,
  news,
  settings,
  inquiries,
  isLoggedIn,
  onLogin,
  onLogout,
  onDeleteNews,
  onDeleteProduct,
  onDeletePersonnel,
  onDeleteInquiry,
  onUpdateNews,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'personnel' | 'news' | 'settings' | 'inquiries'>('overview');

  // Local synced states for instantaneous UI updates upon delete/save
  const [localNews, setLocalNews] = useState<NewsItem[]>(news);
  const [localProducts, setLocalProducts] = useState<Product[]>(products);
  const [localPersonnel, setLocalPersonnel] = useState<Personnel[]>(personnel);
  const [localInquiries, setLocalInquiries] = useState<ContactInquiry[]>(inquiries);

  useEffect(() => {
    setLocalNews(news);
  }, [news]);

  useEffect(() => {
    setLocalProducts(products);
  }, [products]);

  useEffect(() => {
    setLocalPersonnel(personnel);
  }, [personnel]);

  useEffect(() => {
    setLocalInquiries(inquiries);
  }, [inquiries]);

  // Login form states (ว่างไว้ ไม่ให้ติดค้าง)
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Status message & Toast Notification
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Modals for Create/Edit
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingPerson, setEditingPerson] = useState<Partial<Personnel> | null>(null);
  const [editingNews, setEditingNews] = useState<Partial<NewsItem> | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // In-app Delete Confirmation Modal State (replaces native window.confirm)
  const [deleteTarget, setDeleteTarget] = useState<DeleteConfirmTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Temporary Settings form state
  const [tempSettings, setTempSettings] = useState<SiteSettings>(settings);

  // Detect duplicate news items by title
  const duplicateNewsCount = useMemo(() => {
    const titles = new Map<string, number>();
    for (const item of localNews) {
      const key = (item.title || '').trim().toLowerCase();
      if (key) {
        titles.set(key, (titles.get(key) || 0) + 1);
      }
    }
    let dupes = 0;
    titles.forEach((count) => {
      if (count > 1) dupes += count - 1;
    });
    return dupes;
  }, [localNews]);

  if (!isOpen) return null;

  const showNotification = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 4500);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const ok = await onLogin(emailInput, passwordInput);
      if (!ok) {
        setLoginError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch {
      setLoginError('เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // ---------------- CENTRALIZED DELETE HANDLER (Async + Try/Catch + Instant Local State Update) ----------------
  const handleConfirmDelete = async () => {
    if (!deleteTarget || isDeleting) return;

    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'news' && deleteTarget.id) {
        await deleteNewsItem(deleteTarget.id);
        // Immediate local state update for instant UI feedback
        setLocalNews((prev) => prev.filter((item) => item.id !== deleteTarget.id));
        onDeleteNews?.(deleteTarget.id);
        showNotification(`ลบข่าวสาร "${deleteTarget.title}" สำเร็จแล้ว`, 'success');
      } else if (deleteTarget.type === 'clean-duplicates') {
        const deletedCount = await deleteDuplicateNews();
        // Remove duplicates from local state keeping the first occurrence (newest)
        const sorted = [...localNews].sort(compareNewsDescending);
        const seen = new Set<string>();
        const cleanList: NewsItem[] = [];
        sorted.forEach((item) => {
          const key = (item.title || '').trim().toLowerCase();
          if (!key) {
            cleanList.push(item);
            return;
          }
          if (!seen.has(key)) {
            seen.add(key);
            cleanList.push(item);
          }
        });
        setLocalNews(cleanList);
        onUpdateNews?.(cleanList);
        showNotification(
          `ล้างรายการข่าวสารที่ซ้ำกันเรียบร้อยแล้ว (${deletedCount > 0 ? `${deletedCount} รายการ` : 'ในระบบ'})`,
          'success'
        );
      } else if (deleteTarget.type === 'product' && deleteTarget.id) {
        await deleteProduct(deleteTarget.id);
        setLocalProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        onDeleteProduct?.(deleteTarget.id);
        showNotification(`ลบสินค้า "${deleteTarget.title}" สำเร็จแล้ว`, 'success');
      } else if (deleteTarget.type === 'personnel' && deleteTarget.id) {
        await deletePersonnel(deleteTarget.id);
        setLocalPersonnel((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        onDeletePersonnel?.(deleteTarget.id);
        showNotification(`ลบข้อมูลบุคลากร "${deleteTarget.title}" สำเร็จแล้ว`, 'success');
      } else if (deleteTarget.type === 'inquiry' && deleteTarget.id) {
        await deleteInquiry(deleteTarget.id);
        setLocalInquiries((prev) => prev.filter((i) => i.id !== deleteTarget.id));
        onDeleteInquiry?.(deleteTarget.id);
        showNotification('ลบข้อความติดต่อเรียบร้อยแล้ว', 'success');
      } else if (deleteTarget.type === 'reset-roster') {
        await resetPersonnelToOfficialRoster();
        showNotification('รีเซ็ตรายชื่อเป็นทำเนียบทางการเรียบร้อยแล้ว', 'success');
      }
      setDeleteTarget(null);
    } catch (err: any) {
      console.error('Delete operation error:', err);
      showNotification(`เกิดข้อผิดพลาดในการลบข้อมูล: ${err?.message || 'โปรดตรวจสอบสิทธิ์การใช้งานหรือการเชื่อมต่อ'}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // ---------------- PRODUCTS HANDLERS ----------------
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name) return;

    try {
      const categoryNames: Record<ProductCategory, string> = {
        rice: 'เมล็ดพันธุ์ข้าวปลุก',
        fertilizer: 'ปุ๋ยและยาเกษตร',
        processed: 'ผลิตภัณฑ์สหกรณ์',
        seeds: 'อุปกรณ์',
        machinery: 'เครื่องจักร',
        general: 'สินค้าทั่วไป',
      };

      const payload = {
        name: editingProduct.name,
        category: (editingProduct.category || 'rice') as ProductCategory,
        categoryName: categoryNames[(editingProduct.category || 'rice') as ProductCategory],
        price: Number(editingProduct.price) || 0,
        unit: editingProduct.unit || 'ชิ้น',
        description: editingProduct.description || '',
        imageUrl: editingProduct.imageUrl || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
        inStock: editingProduct.inStock !== false,
        featured: !!editingProduct.featured,
        facebookUrl: editingProduct.facebookUrl || `https://m.me/${settings.facebookMessengerId || 'chiangyuencoop'}`,
      };

      if (editingProduct.id) {
        await updateProduct(editingProduct.id, payload);
        setLocalProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? ({ ...p, ...payload } as Product) : p))
        );
        showNotification('อัปเดตข้อมูลสินค้าสำเร็จ');
      } else {
        const newId = await addProduct(payload);
        setLocalProducts((prev) => [{ ...payload, id: newId } as Product, ...prev]);
        showNotification('เพิ่มสินค้าใหม่สำเร็จ');
      }
      setEditingProduct(null);
    } catch (err: any) {
      console.error(err);
      showNotification(`เกิดข้อผิดพลาดในการบันทึกข้อมูล: ${err?.message || ''}`, 'error');
    }
  };

  const handleDeleteProduct = (id: string, name: string) => {
    setDeleteTarget({
      type: 'product',
      id,
      title: name,
      subtitle: 'รายการสินค้า',
    });
  };

  const handleToggleStock = async (product: Product) => {
    try {
      await updateProduct(product.id, { inStock: !product.inStock });
      setLocalProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, inStock: !p.inStock } : p))
      );
      showNotification(`เปลี่ยนสถานะสินค้าเป็น: ${!product.inStock ? 'พร้อมจำหน่าย' : 'สินค้าหมด'}`);
    } catch (err: any) {
      showNotification('ไม่สามารถเปลี่ยนสถานะสินค้าได้', 'error');
    }
  };

  // ---------------- PERSONNEL HANDLERS ----------------
  const handleSavePersonnel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPerson || !editingPerson.name) return;

    try {
      const payload = {
        name: editingPerson.name,
        position: editingPerson.position || '',
        category: (editingPerson.category || 'staff') as PersonnelCategory,
        department: editingPerson.department || '',
        imageUrl: editingPerson.imageUrl || '',
        order: Number(editingPerson.order) || 99,
        statusNote: editingPerson.statusNote || '',
        phone: editingPerson.phone || '',
        email: editingPerson.email || '',
      };

      if (editingPerson.id) {
        await updatePersonnel(editingPerson.id, payload);
        setLocalPersonnel((prev) =>
          prev.map((p) => (p.id === editingPerson.id ? ({ ...p, ...payload } as Personnel) : p))
        );
        showNotification('อัปเดตข้อมูลบุคลากรสำเร็จ');
      } else {
        const newId = await addPersonnel(payload);
        setLocalPersonnel((prev) => [...prev, { ...payload, id: newId } as Personnel]);
        showNotification('เพิ่มบุคลากรใหม่สำเร็จ');
      }
      setEditingPerson(null);
    } catch (err: any) {
      console.error(err);
      showNotification(`เกิดข้อผิดพลาดในการบันทึกข้อมูล: ${err?.message || ''}`, 'error');
    }
  };

  const handleDeletePersonnel = (id: string, name: string) => {
    setDeleteTarget({
      type: 'personnel',
      id,
      title: name,
      subtitle: 'ทำเนียบบุคลากร',
    });
  };

  const handleResetRoster = () => {
    setDeleteTarget({
      type: 'reset-roster',
      title: 'รีเซ็ตทำเนียบบุคลากรทั้งหมด (33 ท่าน)',
      subtitle: 'คืนค่าเป็นทำเนียบทางการตามเอกสารราชการชุดที่ 55',
    });
  };

  // ---------------- NEWS HANDLERS ----------------
  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNews || !editingNews.title) return;

    try {
      const catNames: Record<NewsCategory, string> = {
        news: 'ข่าวประชาสัมพันธ์',
        announcement: 'ประกาศสหกรณ์',
        download: 'เอกสารดาวน์โหลด',
        activity: 'กิจกรรมส่งเสริม',
      };

      const images = Array.isArray(editingNews.images)
        ? editingNews.images.filter((url) => typeof url === 'string' && url.trim().length > 0)
        : editingNews.imageUrl
        ? [editingNews.imageUrl]
        : [];
      const coverImage = images[0] || editingNews.imageUrl || '';

      const payload = {
        title: editingNews.title,
        excerpt: editingNews.excerpt || editingNews.content?.substring(0, 120) || '',
        content: editingNews.content || '',
        category: (editingNews.category || 'news') as NewsCategory,
        categoryName: catNames[(editingNews.category || 'news') as NewsCategory],
        publishDate: editingNews.publishDate || new Date().toISOString().split('T')[0],
        fileName: editingNews.fileName || '',
        imageUrl: coverImage,
        images: images,
        featured: !!editingNews.featured,
      };

      if (editingNews.id) {
        await updateNewsItem(editingNews.id, payload);
        setLocalNews((prev) =>
          prev.map((n) => (n.id === editingNews.id ? ({ ...n, ...payload } as NewsItem) : n))
        );
        showNotification('อัปเดตข่าวสาร/ประกาศสำเร็จ');
      } else {
        const newId = await addNewsItem(payload);
        setLocalNews((prev) => [{ ...payload, id: newId } as NewsItem, ...prev]);
        showNotification('เผยแพร่ข่าวสาร/ประกาศใหม่สำเร็จ');
      }
      setEditingNews(null);
    } catch (err: any) {
      console.error(err);
      showNotification(`เกิดข้อผิดพลาดในการบันทึกข้อมูล: ${err?.message || ''}`, 'error');
    }
  };

  const handleDeleteNews = (id: string, title: string) => {
    setDeleteTarget({
      type: 'news',
      id,
      title,
      subtitle: 'ข่าวสาร & ประกาศประชาสัมพันธ์',
    });
  };

  // ---------------- SETTINGS HANDLER ----------------
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSiteSettings(tempSettings);
      showNotification('บันทึกการตั้งค่าเว็บไซต์สำเร็จ ข้อมูลอัปเดตหน้าเว็บทันที');
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการบันทึกการตั้งค่า');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex justify-center items-start p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-6xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-[#004527] text-white px-6 py-4 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <CoopLogo size="sm" />
            <div>
              <h2 className="font-bold text-base sm:text-lg text-white">
                ระบบจัดการหลังบ้าน (Admin Control Panel)
              </h2>
              <p className="text-xs text-amber-300">
                สหกรณ์การเกษตรเชียงยืน จำกัด • เชื่อมต่อ Firebase Real-time
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isLoggedIn && (
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-xs text-emerald-200 hover:text-white transition-colors"
                title="ออกจากระบบ"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ออกจากระบบ</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-gray-300 hover:text-white transition-colors"
              title="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Toast Notification */}
        {notification && (
          <div
            className={`px-6 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-between gap-2 animate-in slide-in-from-top ${
              notification.type === 'error'
                ? 'bg-red-600 text-white'
                : notification.type === 'info'
                ? 'bg-blue-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-white shrink-0" />
              ) : (
                <CheckCircle className="w-4 h-4 text-amber-300 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="p-1 rounded-lg hover:bg-black/20 text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* CONTENT AREA: IF NOT LOGGED IN -> SHOW LOGIN SCREEN */}
        {!isLoggedIn ? (
          <div className="p-8 sm:p-12 max-w-md mx-auto w-full my-auto text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#005B35] mx-auto mb-4 flex items-center justify-center border border-emerald-200">
              <CoopLogo size="sm" />
            </div>

            <h3 className="text-xl font-bold text-[#005B35]">เข้าสู่ระบบเจ้าหน้าที่</h3>
            <p className="text-xs text-gray-500 mt-1 mb-6">
              เข้าสู่ระบบเพื่อจัดการข้อมูลสินค้า บุคลากร ข่าวสาร และการตั้งค่า
            </p>

            {loginError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  อีเมลเจ้าหน้าที่
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="กรอกอีเมลเจ้าหน้าที่"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#005B35]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  รหัสผ่าน
                </label>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="กรอกรหัสผ่าน"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#005B35]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 rounded-xl bg-[#005B35] hover:bg-[#004527] text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
              >
                {isLoggingIn ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
              </button>
            </form>
          </div>
        ) : (
          /* LOGGED IN: TABBED ADMIN INTERFACE */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-60 bg-slate-50 border-r border-gray-200 p-3 space-y-1 shrink-0 overflow-x-auto md:overflow-visible flex md:flex-col gap-1 md:gap-0">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 transition-colors shrink-0 ${
                  activeTab === 'overview'
                    ? 'bg-[#005B35] text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>ภาพรวมระบบ (Overview)</span>
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 transition-colors shrink-0 ${
                  activeTab === 'products'
                    ? 'bg-[#005B35] text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>จัดการสินค้า ({localProducts.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('personnel')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 transition-colors shrink-0 ${
                  activeTab === 'personnel'
                    ? 'bg-[#005B35] text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>จัดการบุคลากร ({localPersonnel.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('news')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 transition-colors shrink-0 ${
                  activeTab === 'news'
                    ? 'bg-[#005B35] text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span>ข่าวสาร & ประกาศ ({localNews.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('inquiries')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 transition-colors shrink-0 relative ${
                  activeTab === 'inquiries'
                    ? 'bg-[#005B35] text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>ข้อความติดต่อ ({localInquiries.length})</span>
                {localInquiries.some((i) => i.status === 'new') && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 absolute right-2.5" />
                )}
              </button>

              <button
                onClick={() => {
                  setTempSettings(settings);
                  setActiveTab('settings');
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 transition-colors shrink-0 ${
                  activeTab === 'settings'
                    ? 'bg-[#005B35] text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <SettingsIcon className="w-4 h-4" />
                <span>ข้อมูลติดต่อ & เว็บไซต์</span>
              </button>
            </div>

            {/* Main Tab Panel */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#005B35]">ยินดีต้อนรับสู่ระบบจัดการข้อมูล</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      ข้อมูลทุกส่วนเชื่อมต่อกับ Cloud Firestore แบบ Real-time แก้ไขแล้วหน้าเว็บสาธารณะอัปเดตทันที
                    </p>
                  </div>

                  {/* Summary Counters */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div
                      onClick={() => setActiveTab('products')}
                      className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 cursor-pointer hover:bg-emerald-100/60 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <ShoppingBag className="w-5 h-5 text-[#005B35]" />
                        <span className="text-xs text-emerald-800 font-semibold">สินค้า</span>
                      </div>
                      <div className="text-2xl font-black text-[#005B35]">{localProducts.length}</div>
                      <div className="text-[11px] text-gray-500 mt-1">รายการสินค้าเกษตร/แปรรูป</div>
                    </div>

                    <div
                      onClick={() => setActiveTab('personnel')}
                      className="p-4 rounded-2xl bg-amber-50 border border-amber-200 cursor-pointer hover:bg-amber-100/60 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Users className="w-5 h-5 text-amber-700" />
                        <span className="text-xs text-amber-800 font-semibold">บุคลากร</span>
                      </div>
                      <div className="text-2xl font-black text-amber-800">{localPersonnel.length}</div>
                      <div className="text-[11px] text-gray-500 mt-1">คณะกรรมการ & เจ้าหน้าที่</div>
                    </div>

                    <div
                      onClick={() => setActiveTab('news')}
                      className="p-4 rounded-2xl bg-blue-50 border border-blue-200 cursor-pointer hover:bg-blue-100/60 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Bell className="w-5 h-5 text-blue-700" />
                        <span className="text-xs text-blue-800 font-semibold">ข่าวสาร</span>
                      </div>
                      <div className="text-2xl font-black text-blue-800">{localNews.length}</div>
                      <div className="text-[11px] text-gray-500 mt-1">ประกาศและกิจกรรม</div>
                    </div>

                    <div
                      onClick={() => setActiveTab('inquiries')}
                      className="p-4 rounded-2xl bg-purple-50 border border-purple-200 cursor-pointer hover:bg-purple-100/60 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <MessageSquare className="w-5 h-5 text-purple-700" />
                        <span className="text-xs text-purple-800 font-semibold">ข้อความติดต่อ</span>
                      </div>
                      <div className="text-2xl font-black text-purple-800">{localInquiries.length}</div>
                      <div className="text-[11px] text-gray-500 mt-1">
                        {localInquiries.filter((i) => i.status === 'new').length} ข้อความใหม่
                      </div>
                    </div>
                  </div>

                  {/* System Status info */}
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-600 space-y-2">
                    <div className="font-bold text-gray-800 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>สถานะฐานข้อมูล: เชื่อมต่อสมบูรณ์ (Cloud Firestore & Auth)</span>
                    </div>
                    <div>• ฐานข้อมูล ID: <code className="bg-gray-200 px-1 py-0.5 rounded">ai-studio-b4726e9a-b57c-45f4-a19c-24315f9fa437</code></div>
                    <div>• ลิงก์ Facebook Messenger ค่าเริ่มต้น: <code className="bg-gray-200 px-1 py-0.5 rounded">https://m.me/{settings.facebookMessengerId || 'chiangyuencoop'}</code></div>
                  </div>
                </div>
              )}

              {/* TAB 2: PRODUCTS MANAGEMENT */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[#005B35]">จัดการสินค้าเกษตรและแปรรูป</h3>
                      <p className="text-xs text-gray-500">
                        เพิ่ม แก้ไข ซ่อน/แสดงสินค้า และตั้งค่าลิงก์ Facebook Messenger
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        setEditingProduct({
                          name: '',
                          category: 'rice',
                          price: 100,
                          unit: 'ถุง',
                          description: '',
                          imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
                          inStock: true,
                          featured: false,
                          facebookUrl: `https://m.me/${settings.facebookMessengerId || 'chiangyuencoop'}`,
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#005B35] hover:bg-[#004527] text-white text-xs font-semibold shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>เพิ่มสินค้าใหม่</span>
                    </button>
                  </div>

                  {/* Products Table */}
                  <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                        <tr>
                          <th className="p-3">สินค้า</th>
                          <th className="p-3">หมวดหมู่</th>
                          <th className="p-3">ราคา</th>
                          <th className="p-3 text-center">สถานะ</th>
                          <th className="p-3 text-right">การจัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {localProducts.map((prod) => (
                          <tr key={prod.id} className="hover:bg-slate-50">
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={prod.imageUrl}
                                  alt={prod.name}
                                  className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="font-bold text-gray-900 truncate max-w-xs">{prod.name}</div>
                                  <div className="text-[11px] text-gray-400 truncate max-w-xs">{prod.description}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[#005B35] text-xs font-medium">
                                {prod.categoryName}
                              </span>
                            </td>
                            <td className="p-3 font-bold text-emerald-800">
                              ฿{prod.price.toLocaleString()} / {prod.unit}
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => handleToggleStock(prod)}
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                  prod.inStock
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-stone-200 text-stone-700'
                                }`}
                              >
                                {prod.inStock ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                <span>{prod.inStock ? 'พร้อมขาย' : 'สินค้าหมด'}</span>
                              </button>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setEditingProduct(prod)}
                                  className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50"
                                  title="แก้ไข"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(prod.id, prod.name)}
                                  className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                                  title="ลบสินค้า"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: PERSONNEL MANAGEMENT */}
              {activeTab === 'personnel' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-[#005B35]">จัดการทำเนียบบุคลากร</h3>
                      <p className="text-xs text-gray-500">
                        แบ่งเป็น 3 กลุ่ม: 1) คณะกรรมการดำเนินงาน 2) ผู้บริหารระดับสูง 3) ฝ่ายเจ้าหน้าที่และปฏิบัติการ
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleResetRoster}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-medium"
                        title="คืนค่าทำเนียบทางการตามเอกสารราชการชุดที่ 55"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>รีเซ็ตเป็นทำเนียบทางการ</span>
                      </button>

                      <button
                        onClick={() =>
                          setEditingPerson({
                            name: '',
                            position: 'เจ้าหน้าที่',
                            category: 'staff',
                            department: 'ฝ่ายสินเชื่อ',
                            order: localPersonnel.length + 1,
                            statusNote: '',
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#005B35] hover:bg-[#004527] text-white text-xs font-semibold shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>เพิ่มบุคลากร</span>
                      </button>
                    </div>
                  </div>

                  {/* Personnel Table */}
                  <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                        <tr>
                          <th className="p-3">ลำดับ</th>
                          <th className="p-3">รูปถ่าย</th>
                          <th className="p-3">ชื่อ - สกุล</th>
                          <th className="p-3">ตำแหน่ง</th>
                          <th className="p-3">หมวดหมู่</th>
                          <th className="p-3">ฝ่ายงาน / หมายเหตุ</th>
                          <th className="p-3 text-right">การจัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {localPersonnel.map((p, idx) => (
                          <tr key={p.id} className="hover:bg-slate-50">
                            <td className="p-3 text-gray-400 font-mono text-xs">{idx + 1}</td>
                            <td className="p-3">
                              <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
                                {p.imageUrl ? (
                                  <img
                                    src={p.imageUrl}
                                    alt={p.name}
                                    className="w-full h-full object-cover rounded-full"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <User className="w-5 h-5 text-emerald-700/60" />
                                )}
                              </div>
                            </td>
                            <td className="p-3 font-bold text-gray-900">{p.name}</td>
                            <td className="p-3 font-semibold text-emerald-800">{p.position}</td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  p.category === 'committee'
                                    ? 'bg-amber-100 text-amber-900'
                                    : p.category === 'executive'
                                    ? 'bg-emerald-100 text-[#005B35]'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {p.category === 'committee'
                                  ? 'คณะกรรมการ'
                                  : p.category === 'executive'
                                  ? 'ผู้บริหาร'
                                  : 'เจ้าหน้าที่'}
                              </span>
                            </td>
                            <td className="p-3 text-gray-500">
                              <span>{p.department || '-'}</span>
                              {p.statusNote && (
                                <span className="ml-2 px-1.5 py-0.2 rounded text-[10px] bg-red-50 text-red-700 font-bold border border-red-200">
                                  {p.statusNote}
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setEditingPerson(p)}
                                  className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50"
                                  title="แก้ไข"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeletePersonnel(p.id, p.name)}
                                  className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                                  title="ลบบุคลากร"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: NEWS MANAGEMENT */}
              {activeTab === 'news' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[#005B35]">จัดการข่าวสารและประกาศ</h3>
                      <p className="text-xs text-gray-500">
                        ประกาศผลการประชุม เงินปันผล รับซื้อผลผลิต และเอกสารดาวน์โหลด (เรียงจากข่าวใหม่ล่าสุดขึ้นก่อนเสมอ)
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        setEditingNews({
                          title: '',
                          content: '',
                          excerpt: '',
                          category: 'news',
                          publishDate: new Date().toISOString().split('T')[0],
                          featured: false,
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#005B35] hover:bg-[#004527] text-white text-xs font-semibold shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>สร้างประกาศใหม่</span>
                    </button>
                  </div>

                  {/* Duplicate News Alert Banner if any identical titles exist */}
                  {duplicateNewsCount > 0 && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
                      <div className="flex items-center gap-2 font-medium">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          ตรวจพบรายการข่าวสารที่มีชื่อซ้ำกัน{' '}
                          <strong className="text-amber-950 font-bold">{duplicateNewsCount}</strong> รายการ
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget({
                            type: 'clean-duplicates',
                            title: `ล้างรายการข่าวสารที่ซ้ำกันทั้งหมด (${duplicateNewsCount} รายการ)`,
                            subtitle: 'ระบบจะเก็บข่าวฉบับล่าสุดไว้ 1 ฉบับ และลบฉบับที่ซ้ำออกจากฐานข้อมูล',
                          })
                        }
                        className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>ลบรายการที่ซ้ำกันออก</span>
                      </button>
                    </div>
                  )}

                  <div className="space-y-3">
                    {[...localNews].sort(compareNewsDescending).map((item, idx) => {
                      const coverImg =
                        (Array.isArray(item.images) && item.images.length > 0 && item.images[0]) ||
                        item.imageUrl;
                      const imageCount = Array.isArray(item.images)
                        ? item.images.filter((u) => typeof u === 'string' && u.trim().length > 0).length
                        : item.imageUrl
                        ? 1
                        : 0;

                      // Check if there are other items with the same title
                      const isDuplicateTitle = localNews.filter(
                        (n) => (n.title || '').trim().toLowerCase() === (item.title || '').trim().toLowerCase()
                      ).length > 1;

                      return (
                        <div
                          key={item.id || `news-${idx}`}
                          className={`p-4 rounded-2xl bg-white border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                            isDuplicateTitle
                              ? 'border-amber-300 bg-amber-50/20 shadow-xs'
                              : 'border-gray-200 shadow-2xs hover:border-emerald-200'
                          }`}
                        >
                          <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                            {/* News Thumbnail or Placeholder */}
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-gray-200 relative flex items-center justify-center">
                              {coverImg ? (
                                <img
                                  src={coverImg}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <ImageIcon className="w-6 h-6 text-gray-400" />
                              )}
                              {imageCount > 1 && (
                                <span className="absolute bottom-0.5 right-0.5 text-[9px] font-bold bg-black/75 text-white px-1 py-0.2 rounded font-mono">
                                  {imageCount} รูป
                                </span>
                              )}
                            </div>

                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-[#005B35] border border-emerald-200">
                                  {item.categoryName}
                                </span>
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-emerald-700" />
                                  <span>{formatThaiDate(item.publishDate) || item.publishDate}</span>
                                </span>
                                <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.2 rounded">
                                  ID: {item.id}
                                </span>
                                {item.featured && (
                                  <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-amber-100 text-amber-900 border border-amber-300">
                                    ข่าวเด่น
                                  </span>
                                )}
                                {isDuplicateTitle && (
                                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                                    <span>ชื่อซ้ำ ({item.id})</span>
                                  </span>
                                )}
                              </div>
                              <h4 className="font-bold text-sm sm:text-base text-gray-900 truncate">
                                {item.title}
                              </h4>
                              <p className="text-xs text-gray-500 line-clamp-1">
                                {item.excerpt || item.content}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => setEditingNews(item)}
                              className="px-2.5 py-1.5 rounded-xl text-emerald-700 hover:bg-emerald-50 border border-emerald-200 text-xs font-semibold flex items-center gap-1 transition-all"
                              title="แก้ไขเนื้อหา"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>แก้ไข</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteNews(item.id, item.title)}
                              className="px-2.5 py-1.5 rounded-xl text-red-600 hover:bg-red-50 hover:border-red-300 border border-red-200 text-xs font-semibold flex items-center gap-1 transition-all"
                              title={`ลบข่าวสาร: ${item.title}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>ลบ</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 5: INQUIRIES MANAGEMENT */}
              {activeTab === 'inquiries' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#005B35]">กล่องข้อความติดต่อจากประชาชน/สมาชิก</h3>
                    <p className="text-xs text-gray-500">
                      รายการข้อความที่ส่งเข้ามาผ่านแบบฟอร์มหน้าเว็บ (บันทึกลง Firestore แบบเรียลไทม์)
                    </p>
                  </div>

                  {localInquiries.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200 text-gray-400 text-sm">
                      ยังไม่มีข้อความติดต่อใหม่เข้ามาในขณะนี้
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {localInquiries.map((inq) => (
                        <div
                          key={inq.id}
                          className={`p-5 rounded-2xl border transition-all ${
                            inq.status === 'new'
                              ? 'bg-amber-50/50 border-amber-300'
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-sm sm:text-base text-gray-900">
                                  {inq.name}
                                </span>
                                {inq.memberId && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                                    สมาชิก: {inq.memberId}
                                  </span>
                                )}
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                    inq.status === 'new'
                                      ? 'bg-amber-500 text-white'
                                      : inq.status === 'read'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {inq.status === 'new' ? 'ใหม่' : inq.status === 'read' ? 'อ่านแล้ว' : 'ดำเนินการแล้ว'}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-2">
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                                  <a href={`tel:${inq.phone}`} className="hover:underline font-semibold text-gray-700">
                                    {inq.phone}
                                  </a>
                                </span>
                                {inq.email && (
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                                    <span>{inq.email}</span>
                                  </span>
                                )}
                                <span>เรื่อง: <strong className="text-gray-800">{inq.subject}</strong></span>
                                <span>เวลา: {new Date(inq.createdAt).toLocaleString('th-TH')}</span>
                              </div>

                              <p className="text-xs sm:text-sm text-gray-700 bg-white p-3 rounded-xl border border-gray-100 leading-relaxed">
                                {inq.message}
                              </p>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {inq.status === 'new' ? (
                                <button
                                  onClick={() => updateInquiryStatus(inq.id, 'read')}
                                  className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold"
                                >
                                  ทำเครื่องหมายอ่านแล้ว
                                </button>
                              ) : inq.status === 'read' ? (
                                <button
                                  onClick={() => updateInquiryStatus(inq.id, 'resolved')}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold"
                                >
                                  เสร็จสิ้น
                                </button>
                              ) : null}

                              <button
                                onClick={() => {
                                  setDeleteTarget({
                                    type: 'inquiry',
                                    id: inq.id,
                                    title: inq.subject || 'ข้อความติดต่อ',
                                    subtitle: `${inq.name} (${inq.phone})`,
                                  });
                                }}
                                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                                title="ลบข้อความ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: SETTINGS MANAGEMENT */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-[#005B35]">จัดการข้อมูลติดต่อและข้อความบนเว็บ</h3>
                    <p className="text-xs text-gray-500">
                      ปรับเปลี่ยนวิสัยทัศน์ เบอร์โทรศัพท์ ลิงก์ Facebook Messenger และที่อยู่สำนักงาน
                    </p>
                  </div>

                  <form onSubmit={handleSaveSettings} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          ชื่อสหกรณ์ (ภาษาไทย)
                        </label>
                        <input
                          type="text"
                          value={tempSettings.coopName}
                          onChange={(e) => setTempSettings({ ...tempSettings, coopName: e.target.value })}
                          className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005B35]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          ชื่อสหกรณ์ (ภาษาอังกฤษ)
                        </label>
                        <input
                          type="text"
                          value={tempSettings.coopNameEn}
                          onChange={(e) => setTempSettings({ ...tempSettings, coopNameEn: e.target.value })}
                          className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005B35]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        วิสัยทัศน์ / คำขวัญ (Slogan)
                      </label>
                      <input
                        type="text"
                        value={tempSettings.slogan}
                        onChange={(e) => setTempSettings({ ...tempSettings, slogan: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005B35]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Facebook Messenger ID (สำหรับ m.me/...)
                        </label>
                        <input
                          type="text"
                          value={tempSettings.facebookMessengerId}
                          onChange={(e) => setTempSettings({ ...tempSettings, facebookMessengerId: e.target.value })}
                          placeholder="เช่น chiangyuencoop"
                          className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005B35]"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">
                          ปุ่ม "สั่งซื้อผ่าน Facebook" ทุกปุ่มจะส่งต่อไปยัง https://m.me/{tempSettings.facebookMessengerId || 'your-page-id'}
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          URL หน้า Facebook Page
                        </label>
                        <input
                          type="url"
                          value={tempSettings.facebookPageUrl}
                          onChange={(e) => setTempSettings({ ...tempSettings, facebookPageUrl: e.target.value })}
                          className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005B35]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          หมายเลขโทรศัพท์หลัก
                        </label>
                        <input
                          type="text"
                          value={tempSettings.phone}
                          onChange={(e) => setTempSettings({ ...tempSettings, phone: e.target.value })}
                          className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005B35]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          หมายเลขโทรศัพท์สำรอง / แฟกซ์
                        </label>
                        <input
                          type="text"
                          value={tempSettings.phoneAlt || ''}
                          onChange={(e) => setTempSettings({ ...tempSettings, phoneAlt: e.target.value })}
                          className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005B35]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          อีเมลทางการ
                        </label>
                        <input
                          type="email"
                          value={tempSettings.email}
                          onChange={(e) => setTempSettings({ ...tempSettings, email: e.target.value })}
                          className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005B35]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          เวลาทำการ
                        </label>
                        <input
                          type="text"
                          value={tempSettings.workingHours}
                          onChange={(e) => setTempSettings({ ...tempSettings, workingHours: e.target.value })}
                          className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005B35]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        ที่อยู่สำนักงาน
                      </label>
                      <input
                        type="text"
                        value={tempSettings.address}
                        onChange={(e) => setTempSettings({ ...tempSettings, address: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005B35]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#005B35] hover:bg-[#004527] text-white text-xs sm:text-sm font-bold shadow-sm transition-all"
                    >
                      <Save className="w-4 h-4 text-[#D4AF37]" />
                      <span>บันทึกการตั้งค่าลง Firebase</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL: EDIT PRODUCT */}
        {editingProduct && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <h4 className="font-bold text-base text-[#005B35]">
                  {editingProduct.id ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
                </h4>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    ชื่อสินค้า <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    placeholder="เช่น ข้าวหอมมะลิ 105 (5 กก.)"
                    className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#005B35] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      หมวดหมู่
                    </label>
                    <select
                      value={editingProduct.category || 'rice'}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as ProductCategory })}
                      className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#005B35] focus:outline-none"
                    >
                      <option value="rice">เมล็ดพันธุ์ข้าวปลุก</option>
                      <option value="fertilizer">ปุ๋ยและยาเกษตร</option>
                      <option value="processed">ผลิตภัณฑ์สหกรณ์</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      ราคาจำหน่าย (บาท)
                    </label>
                    <input
                      type="number"
                      required
                      value={editingProduct.price ?? ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#005B35] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    หน่วยนับ (เช่น ถุง (5 กก.), กระสอบ, ขวด)
                  </label>
                  <input
                    type="text"
                    value={editingProduct.unit || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                    placeholder="เช่น ถุง (5 กก.)"
                    className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#005B35] focus:outline-none"
                  />
                </div>

                <ImageUploadField
                  label="รูปภาพสินค้า"
                  value={editingProduct.imageUrl || ''}
                  onChange={(url) => setEditingProduct({ ...editingProduct, imageUrl: url })}
                  folder="products"
                  helpText="ถ่ายรูปสินค้าจริงจากมือถือ หรือเลือกไฟล์ภาพ (JPG, PNG) จากเครื่องเพื่ออัปโหลดอัตโนมัติ"
                  onUploadStatusChange={setIsUploadingImage}
                />

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    ลิงก์ Facebook Messenger สำหรับสั่งซื้อ (ทางเลือก)
                  </label>
                  <input
                    type="text"
                    value={editingProduct.facebookUrl || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, facebookUrl: e.target.value })}
                    placeholder="เช่น https://m.me/chiangyuencoop"
                    className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#005B35] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    รายละเอียดสินค้า
                  </label>
                  <textarea
                    rows={3}
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#005B35] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={editingProduct.inStock !== false}
                      onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.checked })}
                      className="rounded text-[#005B35] focus:ring-[#005B35]"
                    />
                    <span>มีสินค้าพร้อมจำหน่าย</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={!!editingProduct.featured}
                      onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                      className="rounded text-[#005B35] focus:ring-[#005B35]"
                    />
                    <span>สินค้าแนะนำพิเศษ</span>
                  </label>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-[11px] text-gray-500">
                    {isUploadingImage ? (
                      <span className="text-[#005B35] font-semibold flex items-center gap-1.5 animate-pulse">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        กำลังประมวลผลรูปภาพ...
                      </span>
                    ) : (
                      <span className="text-gray-400">ข้อมูลและรูปภาพพร้อมบันทึก</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduct(null);
                        setIsUploadingImage(false);
                      }}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      disabled={isUploadingImage}
                      className="px-5 py-2 rounded-xl bg-[#005B35] hover:bg-[#004527] disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
                    >
                      {isUploadingImage ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>กำลังเตรียมข้อมูล...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>บันทึกข้อมูล</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: EDIT PERSONNEL */}
        {editingPerson && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <h4 className="font-bold text-base text-[#005B35]">
                  {editingPerson.id ? 'แก้ไขข้อมูลบุคลากร' : 'เพิ่มบุคลากรใหม่'}
                </h4>
                <button
                  onClick={() => setEditingPerson(null)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSavePersonnel} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    ชื่อ - นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPerson.name || ''}
                    onChange={(e) => setEditingPerson({ ...editingPerson, name: e.target.value })}
                    placeholder="เช่น นายสายใจ เรืองมณี"
                    className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#005B35] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      หมวดหมู่บุคลากร
                    </label>
                    <select
                      value={editingPerson.category || 'staff'}
                      onChange={(e) => setEditingPerson({ ...editingPerson, category: e.target.value as PersonnelCategory })}
                      className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#005B35] focus:outline-none"
                    >
                      <option value="committee">1. คณะกรรมการดำเนินงาน</option>
                      <option value="executive">2. ผู้บริหารระดับสูง</option>
                      <option value="staff">3. ฝ่ายเจ้าหน้าที่และปฏิบัติการ</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      ตำแหน่ง
                    </label>
                    <input
                      type="text"
                      required
                      value={editingPerson.position || ''}
                      onChange={(e) => setEditingPerson({ ...editingPerson, position: e.target.value })}
                      placeholder="เช่น กรรมการ, ผู้จัดการ, เจ้าหน้าที่สินเชื่อ"
                      className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#005B35] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      ฝ่ายงาน / สังกัด
                    </label>
                    <input
                      type="text"
                      value={editingPerson.department || ''}
                      onChange={(e) => setEditingPerson({ ...editingPerson, department: e.target.value })}
                      placeholder="เช่น ฝ่ายสินเชื่อ, ฝ่ายบัญชี"
                      className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#005B35] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      สถานะ / ป้ายกำกับ (ทางเลือก)
                    </label>
                    <input
                      type="text"
                      value={editingPerson.statusNote || ''}
                      onChange={(e) => setEditingPerson({ ...editingPerson, statusNote: e.target.value })}
                      placeholder="เช่น ผู้ตรวจสอบกิจการ, ลาออก"
                      className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#005B35] focus:outline-none"
                    />
                  </div>
                </div>

                <ImageUploadField
                  label="รูปถ่ายบุคลากร (ทางเลือก)"
                  value={editingPerson.imageUrl || ''}
                  onChange={(url) => setEditingPerson({ ...editingPerson, imageUrl: url })}
                  folder="personnel"
                  helpText="อัปโหลดรูปถ่ายหน้าตรงหรือรูปติดบัตรของกรรมการ/เจ้าหน้าที่จากเครื่องหรือมือถือ"
                  onUploadStatusChange={setIsUploadingImage}
                />

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-[11px] text-gray-500">
                    {isUploadingImage ? (
                      <span className="text-[#005B35] font-semibold flex items-center gap-1.5 animate-pulse">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        กำลังประมวลผลรูปถ่าย...
                      </span>
                    ) : (
                      <span className="text-gray-400">ข้อมูลและรูปภาพพร้อมบันทึก</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPerson(null);
                        setIsUploadingImage(false);
                      }}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      disabled={isUploadingImage}
                      className="px-5 py-2 rounded-xl bg-[#005B35] hover:bg-[#004527] disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
                    >
                      {isUploadingImage ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>กำลังเตรียมข้อมูล...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>บันทึกข้อมูล</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: EDIT NEWS */}
        {editingNews && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <h4 className="font-bold text-base text-[#005B35]">
                  {editingNews.id ? 'แก้ไขข่าวสาร/ประกาศ' : 'สร้างประกาศใหม่'}
                </h4>
                <button
                  onClick={() => setEditingNews(null)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveNews} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    หัวข้อข่าว / ประกาศ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingNews.title || ''}
                    onChange={(e) => setEditingNews({ ...editingNews, title: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#005B35] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      หมวดหมู่
                    </label>
                    <select
                      value={editingNews.category || 'news'}
                      onChange={(e) => setEditingNews({ ...editingNews, category: e.target.value as NewsCategory })}
                      className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#005B35] focus:outline-none"
                    >
                      <option value="announcement">ประกาศสหกรณ์</option>
                      <option value="news">ข่าวประชาสัมพันธ์</option>
                      <option value="download">เอกสารดาวน์โหลด</option>
                      <option value="activity">กิจกรรมส่งเสริม</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      วันที่ประกาศ
                    </label>
                    <input
                      type="date"
                      value={editingNews.publishDate || ''}
                      onChange={(e) => setEditingNews({ ...editingNews, publishDate: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#005B35] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    ชื่อเอกสารแนบ (กรณีเป็นเอกสารดาวน์โหลด)
                  </label>
                  <input
                    type="text"
                    value={editingNews.fileName || ''}
                    onChange={(e) => setEditingNews({ ...editingNews, fileName: e.target.value })}
                    placeholder="เช่น แบบฟอร์มคำขอกู้เงิน_สหกรณ์เชียงยืน.pdf"
                    className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#005B35] focus:outline-none"
                  />
                </div>

                <MultiImageUploadField
                  label="รูปภาพประกอบข่าวสาร / อัลบั้มภาพ (เพิ่มได้หลายรูป)"
                  values={
                    Array.isArray(editingNews.images) && editingNews.images.length > 0
                      ? editingNews.images
                      : editingNews.imageUrl
                      ? [editingNews.imageUrl]
                      : []
                  }
                  onChange={(urls) =>
                    setEditingNews({
                      ...editingNews,
                      images: urls,
                      imageUrl: urls[0] || '',
                    })
                  }
                  folder="general"
                  helpText="สามารถเลือกไฟล์จากเครื่องได้พร้อมกันหลายรูป โดยรูปแรก (#1) จะเป็นรูปภาพหน้าปกหลัก (Cover Image) สำหรับหน้าแรกและสไลด์ข่าว"
                  onUploadStatusChange={setIsUploadingImage}
                />

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    เนื้อหาข่าวสาร / รายละเอียดประกาศ
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={editingNews.content || ''}
                    onChange={(e) => setEditingNews({ ...editingNews, content: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#005B35] focus:outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-[11px] text-gray-500">
                    {isUploadingImage ? (
                      <span className="text-[#005B35] font-semibold flex items-center gap-1.5 animate-pulse">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        กำลังประมวลผลรูปภาพ...
                      </span>
                    ) : (
                      <span className="text-gray-400">ข้อมูลและรูปภาพพร้อมบันทึก</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingNews(null);
                        setIsUploadingImage(false);
                      }}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      disabled={isUploadingImage}
                      className="px-5 py-2 rounded-xl bg-[#005B35] hover:bg-[#004527] disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
                    >
                      {isUploadingImage ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>กำลังเตรียมข้อมูล...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>บันทึกประกาศ</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: IN-APP CONFIRMATION DIALOG (Guaranteed visible, responsive, async delete with instant feedback) */}
        {deleteTarget && (
          <div
            className="fixed inset-0 z-70 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-title"
            onClick={(e) => {
              if (e.target === e.currentTarget && !isDeleting) {
                setDeleteTarget(null);
              }
            }}
          >
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-150">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 border border-red-200 shadow-2xs">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 id="confirm-delete-title" className="text-base sm:text-lg font-bold text-gray-900">
                    {deleteTarget.type === 'clean-duplicates'
                      ? 'ยืนยันการล้างข้อมูลที่ซ้ำกัน'
                      : deleteTarget.type === 'reset-roster'
                      ? 'ยืนยันการรีเซ็ตทำเนียบบุคลากร'
                      : 'ยืนยันการลบข้อมูล'}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {deleteTarget.subtitle || 'การดำเนินการนี้จะลบข้อมูลออกจากฐานข้อมูล'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => !isDeleting && setDeleteTarget(null)}
                  disabled={isDeleting}
                  className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                  title="ปิดหน้าต่าง"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 p-4 rounded-2xl bg-red-50/70 border border-red-200 text-xs sm:text-sm text-gray-800 space-y-2">
                <p className="font-semibold text-red-950 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>
                    {deleteTarget.type === 'clean-duplicates'
                      ? 'คุณต้องการล้างรายการข่าวสารที่ซ้ำกันทั้งหมดใช่หรือไม่?'
                      : deleteTarget.type === 'reset-roster'
                      ? 'คุณต้องการรีเซ็ตข้อมูลเป็นรายชื่อทางการ 33 ท่านใช่หรือไม่?'
                      : 'คุณต้องการลบข้อมูลรายการนี้ใช่หรือไม่?'}
                  </span>
                </p>

                <div className="p-2.5 rounded-xl bg-white border border-red-100 shadow-2xs">
                  <p className="font-bold text-gray-900 break-words leading-snug">
                    "{deleteTarget.title}"
                  </p>
                  {deleteTarget.id && (
                    <p className="text-[11px] font-mono text-gray-500 mt-1 flex items-center gap-1">
                      <span>รหัสอ้างอิง (ID):</span>
                      <span className="font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        {deleteTarget.id}
                      </span>
                    </p>
                  )}
                </div>

                <p className="text-[11px] text-red-700">
                  ⚠️ รายการจะถูกลบออกจากระบบและหน้าแรกของเว็บไซต์ทันทีโดยไม่ต้องรีเฟรชหน้าเว็บ
                </p>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>กำลังลบข้อมูล...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>
                        {deleteTarget.type === 'clean-duplicates'
                          ? 'ล้างข้อมูลที่ซ้ำกัน'
                          : 'ยืนยันลบข้อมูล'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};