import {
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  query,
  orderBy,
  Unsubscribe,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Product, Personnel, NewsItem, SiteSettings, ContactInquiry } from '../types';
import { INITIAL_PRODUCTS, INITIAL_PERSONNEL, INITIAL_NEWS, INITIAL_SETTINGS } from '../data/initialData';
import { compareNewsDescending } from '../utils/dateUtils';

const PRODUCTS_COLLECTION = 'products';
const PERSONNEL_COLLECTION = 'personnel';
const NEWS_COLLECTION = 'news';
const SETTINGS_COLLECTION = 'settings';
const INQUIRIES_COLLECTION = 'inquiries';

// Global error handler & single-flight flag so offline or initial cold start doesn't hang UI or run concurrent seeds
let hasSeeded = false;
let seedPromise: Promise<void> | null = null;

// Seed database if empty
export async function seedDatabaseIfEmpty(): Promise<void> {
  if (hasSeeded) return;
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    try {
      const productsSnap = await getDocs(collection(db, PRODUCTS_COLLECTION));
      if (productsSnap.empty) {
        console.log('Seeding initial products...');
        const batch = writeBatch(db);
        INITIAL_PRODUCTS.forEach((product) => {
          const docRef = doc(db, PRODUCTS_COLLECTION, product.id);
          batch.set(docRef, { ...product, createdAt: new Date().toISOString() });
        });
        await batch.commit();
      }

      const personnelSnap = await getDocs(collection(db, PERSONNEL_COLLECTION));
      if (personnelSnap.empty) {
        console.log('Seeding initial personnel...');
        const batch = writeBatch(db);
        INITIAL_PERSONNEL.forEach((person) => {
          const docRef = doc(db, PERSONNEL_COLLECTION, person.id);
          batch.set(docRef, { ...person, createdAt: new Date().toISOString() });
        });
        await batch.commit();
      }

      const newsSnap = await getDocs(collection(db, NEWS_COLLECTION));
      if (newsSnap.empty) {
        console.log('Seeding initial news...');
        const batch = writeBatch(db);
        INITIAL_NEWS.forEach((item) => {
          const docRef = doc(db, NEWS_COLLECTION, item.id);
          batch.set(docRef, { ...item, createdAt: new Date().toISOString() });
        });
        await batch.commit();
      }

      const settingsDoc = doc(db, SETTINGS_COLLECTION, 'general');
      const settingsSnap = await getDocs(collection(db, SETTINGS_COLLECTION));
      if (settingsSnap.empty) {
        console.log('Seeding initial settings...');
        await setDoc(settingsDoc, { ...INITIAL_SETTINGS, updatedAt: new Date().toISOString() });
      }

      hasSeeded = true;
    } catch (error) {
      console.warn('Error during database check/seed, using fallback local data:', error);
    } finally {
      seedPromise = null;
    }
  })();

  return seedPromise;
}

// ---------------- PRODUCTS ----------------
export function subscribeProducts(callback: (products: Product[]) => void): Unsubscribe {
  const colRef = collection(db, PRODUCTS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        if (!hasSeeded) {
          callback(INITIAL_PRODUCTS);
          seedDatabaseIfEmpty();
        } else {
          callback([]);
        }
      } else {
        hasSeeded = true;
        const products: Product[] = snapshot.docs.map((d) => ({
          ...(d.data() as Product),
          id: d.id,
        }));

        // Deduplicate by ID
        const seen = new Set<string>();
        const uniqueProducts = products.filter((p) => {
          if (!p.id || seen.has(p.id)) return false;
          seen.add(p.id);
          return true;
        });

        uniqueProducts.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return a.name.localeCompare(b.name, 'th');
        });
        callback(uniqueProducts);
      }
    },
    (err) => {
      console.error('Firestore products onSnapshot error:', err);
      callback(INITIAL_PRODUCTS);
    }
  );
}

export async function addProduct(product: Omit<Product, 'id'>): Promise<string> {
  const colRef = collection(db, PRODUCTS_COLLECTION);
  const docRef = await addDoc(colRef, {
    ...product,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  if (!id) throw new Error('รหัสสินค้า (Product ID) ไม่ถูกต้อง');
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  await setDoc(docRef, { ...updates, updatedAt: new Date().toISOString() }, { merge: true });
}

export async function deleteProduct(id: string): Promise<void> {
  if (!id || typeof id !== 'string') {
    throw new Error('รหัสสินค้า (ID) ไม่ถูกต้อง ไม่สามารถลบได้');
  }
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  await deleteDoc(docRef);
}

// ---------------- PERSONNEL ----------------
export function subscribePersonnel(callback: (personnel: Personnel[]) => void): Unsubscribe {
  const colRef = collection(db, PERSONNEL_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        if (!hasSeeded) {
          callback(INITIAL_PERSONNEL);
          seedDatabaseIfEmpty();
        } else {
          callback([]);
        }
      } else {
        hasSeeded = true;
        const personnel: Personnel[] = snapshot.docs.map((d) => ({
          ...(d.data() as Personnel),
          id: d.id,
        }));

        // Deduplicate by ID
        const seen = new Set<string>();
        const uniquePersonnel = personnel.filter((p) => {
          if (!p.id || seen.has(p.id)) return false;
          seen.add(p.id);
          return true;
        });

        uniquePersonnel.sort((a, b) => (a.order || 99) - (b.order || 99));
        callback(uniquePersonnel);
      }
    },
    (err) => {
      console.error('Firestore personnel onSnapshot error:', err);
      callback(INITIAL_PERSONNEL);
    }
  );
}

export async function addPersonnel(person: Omit<Personnel, 'id'>): Promise<string> {
  const colRef = collection(db, PERSONNEL_COLLECTION);
  const docRef = await addDoc(colRef, {
    ...person,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function updatePersonnel(id: string, updates: Partial<Personnel>): Promise<void> {
  if (!id) throw new Error('รหัสบุคลากร (Personnel ID) ไม่ถูกต้อง');
  const docRef = doc(db, PERSONNEL_COLLECTION, id);
  await setDoc(docRef, { ...updates, updatedAt: new Date().toISOString() }, { merge: true });
}

export async function deletePersonnel(id: string): Promise<void> {
  if (!id || typeof id !== 'string') {
    throw new Error('รหัสบุคลากร (ID) ไม่ถูกต้อง ไม่สามารถลบได้');
  }
  const docRef = doc(db, PERSONNEL_COLLECTION, id);
  await deleteDoc(docRef);
}

export async function resetPersonnelToOfficialRoster(): Promise<void> {
  const batch = writeBatch(db);
  // delete current
  const currentSnap = await getDocs(collection(db, PERSONNEL_COLLECTION));
  currentSnap.forEach((d) => batch.delete(d.ref));
  // insert authentic
  INITIAL_PERSONNEL.forEach((person) => {
    const docRef = doc(db, PERSONNEL_COLLECTION, person.id);
    batch.set(docRef, { ...person, createdAt: new Date().toISOString() });
  });
  await batch.commit();
}

// ---------------- NEWS ----------------
export function subscribeNews(callback: (news: NewsItem[]) => void): Unsubscribe {
  const colRef = collection(db, NEWS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        if (!hasSeeded) {
          const sortedInitial = [...INITIAL_NEWS].sort(compareNewsDescending);
          callback(sortedInitial);
          seedDatabaseIfEmpty();
        } else {
          callback([]);
        }
      } else {
        hasSeeded = true;
        const news: NewsItem[] = snapshot.docs.map((d) => ({
          ...(d.data() as NewsItem),
          id: d.id,
        }));

        // Deduplicate by ID
        const seen = new Set<string>();
        const uniqueNews = news.filter((item) => {
          if (!item.id || seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });

        uniqueNews.sort(compareNewsDescending);
        callback(uniqueNews);
      }
    },
    (err) => {
      console.error('Firestore news onSnapshot error:', err);
      const sortedInitial = [...INITIAL_NEWS].sort(compareNewsDescending);
      callback(sortedInitial);
    }
  );
}

export async function addNewsItem(news: Omit<NewsItem, 'id'>): Promise<string> {
  const colRef = collection(db, NEWS_COLLECTION);
  const docRef = await addDoc(colRef, {
    ...news,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function updateNewsItem(id: string, updates: Partial<NewsItem>): Promise<void> {
  if (!id) throw new Error('รหัสข่าวสาร (News ID) ไม่ถูกต้อง');
  const docRef = doc(db, NEWS_COLLECTION, id);
  await setDoc(docRef, { ...updates, updatedAt: new Date().toISOString() }, { merge: true });
}

export async function deleteNewsItem(id: string): Promise<void> {
  if (!id || typeof id !== 'string') {
    throw new Error('รหัสข่าวสาร (ID) ไม่ถูกต้อง ไม่สามารถลบได้');
  }
  const docRef = doc(db, NEWS_COLLECTION, id);
  await deleteDoc(docRef);
}

/**
 * Removes duplicate news items in Firestore (keeps the newest entry for each identical title)
 * Returns the count of deleted duplicate documents.
 */
export async function deleteDuplicateNews(): Promise<number> {
  const colRef = collection(db, NEWS_COLLECTION);
  const snapshot = await getDocs(colRef);
  if (snapshot.empty) return 0;

  const docs = snapshot.docs.map((d) => ({
    ...(d.data() as NewsItem),
    id: d.id,
  }));

  // Sort descending so the first occurrence is the newest
  docs.sort(compareNewsDescending);

  const seenTitles = new Map<string, string>(); // titleKey -> preserved ID
  const toDeleteIds: string[] = [];

  for (const item of docs) {
    const key = (item.title || '').trim().toLowerCase();
    if (!key) continue;

    if (seenTitles.has(key)) {
      toDeleteIds.push(item.id);
    } else {
      seenTitles.set(key, item.id);
    }
  }

  if (toDeleteIds.length === 0) return 0;

  // Batch delete in safe chunks of 400
  const CHUNK_SIZE = 400;
  for (let i = 0; i < toDeleteIds.length; i += CHUNK_SIZE) {
    const chunk = toDeleteIds.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);
    chunk.forEach((id) => {
      batch.delete(doc(db, NEWS_COLLECTION, id));
    });
    await batch.commit();
  }

  return toDeleteIds.length;
}

// ---------------- SETTINGS ----------------
export function subscribeSettings(callback: (settings: SiteSettings) => void): Unsubscribe {
  const docRef = doc(db, SETTINGS_COLLECTION, 'general');
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as SiteSettings);
      } else {
        callback(INITIAL_SETTINGS);
        setDoc(docRef, { ...INITIAL_SETTINGS, updatedAt: new Date().toISOString() }).catch(() => {});
      }
    },
    (err) => {
      console.error('Firestore settings onSnapshot error:', err);
      callback(INITIAL_SETTINGS);
    }
  );
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
  const docRef = doc(db, SETTINGS_COLLECTION, 'general');
  await setDoc(docRef, { ...settings, updatedAt: new Date().toISOString() }, { merge: true });
}

// ---------------- CONTACT INQUIRIES ----------------
export function subscribeInquiries(callback: (inquiries: ContactInquiry[]) => void): Unsubscribe {
  const colRef = collection(db, INQUIRIES_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: ContactInquiry[] = snapshot.docs.map((d) => ({
        ...(d.data() as ContactInquiry),
        id: d.id,
      }));

      // Deduplicate by ID
      const seen = new Set<string>();
      const uniqueItems = items.filter((item) => {
        if (!item.id || seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });

      uniqueItems.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      callback(uniqueItems);
    },
    (err) => {
      console.error('Firestore inquiries onSnapshot error:', err);
      callback([]);
    }
  );
}

export async function submitInquiry(inquiry: Omit<ContactInquiry, 'id' | 'createdAt' | 'status'>): Promise<string> {
  const colRef = collection(db, INQUIRIES_COLLECTION);
  const docRef = await addDoc(colRef, {
    ...inquiry,
    status: 'new',
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function updateInquiryStatus(id: string, status: 'new' | 'read' | 'resolved'): Promise<void> {
  if (!id) throw new Error('รหัสข้อความ (Inquiry ID) ไม่ถูกต้อง');
  const docRef = doc(db, INQUIRIES_COLLECTION, id);
  await updateDoc(docRef, { status });
}

export async function deleteInquiry(id: string): Promise<void> {
  if (!id || typeof id !== 'string') {
    throw new Error('รหัสข้อความ (ID) ไม่ถูกต้อง ไม่สามารถลบได้');
  }
  const docRef = doc(db, INQUIRIES_COLLECTION, id);
  await deleteDoc(docRef);
}
