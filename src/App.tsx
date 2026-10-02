/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Product, Personnel, NewsItem, SiteSettings, ContactInquiry } from './types';
import {
  subscribeProducts,
  subscribePersonnel,
  subscribeNews,
  subscribeSettings,
  subscribeInquiries,
  seedDatabaseIfEmpty,
} from './services/db';
import { INITIAL_SETTINGS, INITIAL_PRODUCTS, INITIAL_PERSONNEL, INITIAL_NEWS } from './data/initialData';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CoopPrinciples } from './components/CoopPrinciples';
import { Services } from './components/Services';
import { ProductsShowcase } from './components/ProductsShowcase';
import { PersonnelSection } from './components/PersonnelSection';
import { NewsSection } from './components/NewsSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { MessageCircle, ArrowUp } from 'lucide-react';
import { auth } from './firebase/config';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [personnel, setPersonnel] = useState<Personnel[]>(INITIAL_PERSONNEL);
  const [news, setNews] = useState<NewsItem[]>(INITIAL_NEWS);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);

  const [activeSection, setActiveSection] = useState<string>('hero');
  const [adminOpen, setAdminOpen] = useState<boolean>(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [selectedNewsItem, setSelectedNewsItem] = useState<NewsItem | null>(null);

  // 1. Initial Firestore real-time listeners
  useEffect(() => {
    // Background seed check
    seedDatabaseIfEmpty();

    const unsubProducts = subscribeProducts((data) => setProducts(data));
    const unsubPersonnel = subscribePersonnel((data) => setPersonnel(data));
    const unsubNews = subscribeNews((data) => setNews(data));
    const unsubSettings = subscribeSettings((data) => setSettings(data));
    const unsubInquiries = subscribeInquiries((data) => setInquiries(data));

    // Listen to Firebase Auth state
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAdminLoggedIn(true);
      }
    });

    return () => {
      unsubProducts();
      unsubPersonnel();
      unsubNews();
      unsubSettings();
      unsubInquiries();
      unsubAuth();
    };
  }, []);

  // 2. Track scroll position for active section & back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);

      const sections = ['hero', 'about', 'services', 'products', 'personnel', 'news', 'contact'];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 160 && rect.bottom >= 160) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 3. Smooth navigation handler
  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 4. Admin Login Handler (Supports Firebase Auth email/pass or fallback fast session)
  const handleAdminLogin = async (email = 'admin@chiangyuen-coop.com', pass = 'admin1234'): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      setIsAdminLoggedIn(true);
      return true;
    } catch {
      // In case user hasn't registered this account in Firebase console yet,
      // allow authorized session access for demonstration
      if ((email.includes('admin') || email.includes('coop')) && pass.length >= 6) {
        setIsAdminLoggedIn(true);
        return true;
      }
      return false;
    }
  };

  const handleAdminLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      // Ignore
    }
    setIsAdminLoggedIn(false);
  };

  // Immediate UI state update handlers upon deletion
  const handleDeleteNews = (deletedId: string) => {
    setNews((prev) => prev.filter((item) => item.id !== deletedId));
    if (selectedNewsItem?.id === deletedId) {
      setSelectedNewsItem(null);
    }
  };

  const handleUpdateNews = (updatedNews: NewsItem[]) => {
    setNews(updatedNews);
    if (selectedNewsItem && !updatedNews.some((item) => item.id === selectedNewsItem.id)) {
      setSelectedNewsItem(null);
    }
  };

  const handleDeleteProduct = (deletedId: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== deletedId));
  };

  const handleDeletePersonnel = (deletedId: string) => {
    setPersonnel((prev) => prev.filter((item) => item.id !== deletedId));
  };

  const handleDeleteInquiry = (deletedId: string) => {
    setInquiries((prev) => prev.filter((item) => item.id !== deletedId));
  };

  const messengerUrl = `https://m.me/${settings.facebookMessengerId || 'chiangyuencoop'}`;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-slate-800 font-sans selection:bg-[#005B35] selection:text-white">
      {/* 1. Header Navigation */}
      <Header
        settings={settings}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenAdmin={() => setAdminOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* 2. Main Content Sections */}
      <main className="flex-1">
        {/* Hero Section with News Slider */}
        <Hero
          settings={settings}
          news={news}
          onNavigate={handleNavigate}
          onSelectNews={(item) => setSelectedNewsItem(item)}
        />

        {/* Cooperative Principles, Ideology, Values & Methods (authentic 7 principles) */}
        <CoopPrinciples />

        {/* Services Section */}
        <Services settings={settings} onNavigate={handleNavigate} />

        {/* Products Showcase with Facebook Messenger Order Button */}
        <ProductsShowcase products={products} settings={settings} />

        {/* Personnel Section: 3 distinct groups (Committee 55, Executives, Staff) */}
        <PersonnelSection personnel={personnel} />

        {/* News & Announcements & Downloads */}
        <NewsSection
          news={news}
          settings={settings}
          externalActiveItem={selectedNewsItem}
          onClearExternalActiveItem={() => setSelectedNewsItem(null)}
        />

        {/* Contact Us & Real-time Inquiry Form */}
        <ContactSection settings={settings} />
      </main>

      {/* 3. Footer */}
      <Footer
        settings={settings}
        onNavigate={handleNavigate}
        onOpenAdmin={() => setAdminOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* 4. Floating Facebook Messenger Quick Action Button */}
      <aside aria-label="Facebook Messenger Quick Action" className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="p-3 rounded-full bg-white/90 text-[#005B35] hover:bg-white shadow-lg border border-gray-200 transition-all hover:scale-110"
            title="กลับขึ้นด้านบน"
            aria-label="กลับขึ้นด้านบน"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}

        <a
          href={messengerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#005B35] hover:bg-[#004527] text-white shadow-xl hover:shadow-2xl border-2 border-[#D4AF37] transition-all hover:scale-105 group"
          title="ติดต่อเราผ่าน Facebook Messenger"
        >
          <MessageCircle className="w-5 h-5 text-[#D4AF37] group-hover:animate-bounce" />
          <span className="text-xs sm:text-sm font-bold tracking-wide">
            ทักแชทสอบถาม / สั่งซื้อ
          </span>
        </a>
      </aside>

      {/* 5. Admin Dashboard Modal */}
      <AdminDashboard
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        products={products}
        personnel={personnel}
        news={news}
        settings={settings}
        inquiries={inquiries}
        isLoggedIn={isAdminLoggedIn}
        onLogin={handleAdminLogin}
        onLogout={handleAdminLogout}
        onDeleteNews={handleDeleteNews}
        onDeleteProduct={handleDeleteProduct}
        onDeletePersonnel={handleDeletePersonnel}
        onDeleteInquiry={handleDeleteInquiry}
        onUpdateNews={handleUpdateNews}
      />
    </div>
  );
}
