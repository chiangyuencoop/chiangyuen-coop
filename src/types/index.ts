export type PersonnelCategory = 'committee' | 'executive' | 'staff';

export interface Personnel {
  id: string;
  name: string;
  position: string;
  category: PersonnelCategory;
  department?: string;
  imageUrl?: string;
  order: number;
  statusNote?: string; // e.g. "ลาออก" or "ผู้ตรวจสอบกิจการ"
  phone?: string;
  email?: string;
  createdAt?: string;
}

export type ProductCategory = 'rice' | 'fertilizer' | 'processed' | 'seeds' | 'machinery' | 'general';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  categoryName: string;
  price: number;
  unit: string;
  description: string;
  imageUrl: string;
  inStock: boolean;
  featured?: boolean;
  facebookUrl?: string; // e.g. https://m.me/chiangyuencoop
  createdAt?: string;
}

export type NewsCategory = 'news' | 'announcement' | 'download' | 'activity';

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: NewsCategory;
  categoryName: string;
  imageUrl?: string;
  images?: string[]; // Multiple images; images[0] is the primary cover image
  fileUrl?: string;
  fileName?: string;
  publishDate: string;
  featured?: boolean;
  createdAt?: string;
}

export interface SiteSettings {
  coopName: string;
  coopNameEn: string;
  slogan: string;
  address: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  phone: string;
  phoneAlt?: string;
  email: string;
  facebookPageUrl: string;
  facebookMessengerId: string; // page username or ID for m.me/
  lineId?: string;
  workingHours: string;
  updatedAt?: string;
}

export interface ContactInquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  memberId?: string;
  status: 'new' | 'read' | 'resolved';
  createdAt: string;
}
