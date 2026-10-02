import React, { useState, useMemo } from 'react';
import { Product, SiteSettings } from '../types';
import {
  ShoppingBag,
  MessageCircle,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  ExternalLink,
  Tag,
  Eye,
  X,
} from 'lucide-react';

interface ProductsShowcaseProps {
  products: Product[];
  settings: SiteSettings;
}

export const ProductsShowcase: React.FC<ProductsShowcaseProps> = ({
  products,
  settings,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const categories = [
    { id: 'all', label: 'สินค้าทั้งหมด' },
    { id: 'rice', label: 'เมล็ดพันธุ์ข้าวปลุก' },
    { id: 'fertilizer', label: 'ปุ๋ยและยาเกษตร' },
    { id: 'processed', label: 'ผลิตภัณฑ์สหกรณ์' },
    
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchSearch =
        searchQuery.trim() === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const defaultMessenger = `https://m.me/${settings.facebookMessengerId || 'chiangyuencoop'}`;

  const getOrderLink = (product: Product) => {
    if (product.facebookUrl && product.facebookUrl.trim() !== '') {
      return product.facebookUrl;
    }
    return defaultMessenger;
  };

  return (
    <section id="products" className="py-20 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-[#005B35] text-xs font-semibold uppercase tracking-wider mb-3">
            <ShoppingBag className="w-3.5 h-3.5 text-[#005B35]" />
            <span>สินค้าเกษตรและแปรรูปมาตรฐาน</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#005B35]">
            สินค้าสหกรณ์การเกษตรเชียงยืน
          </h2>
          <div className="w-20 h-1 bg-[#D4AF37] mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-gray-600 text-sm sm:text-base leading-relaxed">
            เลือกสรรผลผลิตคุณภาพจากแปลงใหญ่สมาชิกและปัจจัยการผลิตมาตรฐาน 
            สั่งซื้อง่าย ทักแชทสอบถามและสั่งซื้อตรงผ่าน Facebook Messenger ได้ทันที
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-200/80 mb-10 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
          {/* Categories Pill List */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#005B35] text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px] max-w-sm w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อสินค้า ข้าว ปุ๋ย..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005B35] focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-base font-medium">ไม่พบสินค้าในหมวดหมู่นี้</p>
            <p className="text-gray-400 text-xs mt-1">ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่น</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const orderLink = getOrderLink(product);
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-200/90 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col group"
                >
                  {/* Product Image */}
                  <div className="relative aspect-4/3 overflow-hidden bg-gray-100">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Stock Status Tag */}
                    <div className="absolute top-2.5 left-2.5">
                      {product.inStock ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-600/90 text-white backdrop-blur-sm shadow-sm">
                          <CheckCircle className="w-3 h-3" /> มีสินค้าพร้อมจำหน่าย
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-600/90 text-white backdrop-blur-sm shadow-sm">
                          <XCircle className="w-3 h-3" /> สินค้าหมดชั่วคราว
                        </span>
                      )}
                    </div>

                    {/* Quick Preview Button */}
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="absolute bottom-2.5 right-2.5 p-2 rounded-xl bg-white/90 text-gray-700 hover:text-[#005B35] hover:bg-white shadow-sm transition-all opacity-0 group-hover:opacity-100"
                      title="ดูรายละเอียดสินค้า"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold mb-1.5">
                        <Tag className="w-3 h-3 text-[#D4AF37]" />
                        <span>{product.categoryName}</span>
                      </div>

                      <h3
                        onClick={() => setSelectedProduct(product)}
                        className="font-bold text-base text-gray-900 group-hover:text-[#005B35] transition-colors cursor-pointer line-clamp-2"
                      >
                        {product.name}
                      </h3>

                      <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-gray-100">
                      {/* Price & Unit */}
                      <div className="flex items-baseline justify-between mb-3">
                        <div className="text-xs text-gray-500 font-medium">ราคาจำหน่าย</div>
                        <div className="text-right">
                          <span className="text-xl font-extrabold text-[#005B35]">
                            ฿{product.price.toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-500 ml-1">/ {product.unit}</span>
                        </div>
                      </div>

                      {/* CTA Facebook Order Button */}
                      <a
                        href={orderLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#005B35] hover:bg-[#004527] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all hover:shadow group/btn"
                      >
                        <MessageCircle className="w-4 h-4 text-[#D4AF37]" />
                        <span>สั่งซื้อผ่าน Facebook</span>
                        <ExternalLink className="w-3.5 h-3.5 text-emerald-200 group-hover/btn:translate-x-0.5 transition-transform" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Product Detail Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-200 relative animate-in zoom-in-95 duration-200">
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2">
                <div className="aspect-square bg-gray-100 relative">
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#005B35] text-white">
                      {selectedProduct.categoryName}
                    </span>
                  </div>
                </div>

                <div className="p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-extrabold text-[#005B35] mb-2 leading-snug">
                      {selectedProduct.name}
                    </h3>

                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl font-black text-amber-700">
                        ฿{selectedProduct.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">/ {selectedProduct.unit}</span>
                      <span className="ml-auto text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                        {selectedProduct.inStock ? 'พร้อมส่ง' : 'ติดต่อสอบถาม'}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 leading-relaxed mb-6">
                      {selectedProduct.description}
                    </p>

                    <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/60 text-xs text-amber-900 space-y-1 mb-6">
                      <div className="font-semibold">ข้อมูลการสั่งซื้อ:</div>
                      <div>• ส่งข้อความแจ้งจำนวนที่ต้องการทาง Facebook Messenger</div>
                      <div>• เจ้าหน้าที่จะสรุปยอดและแจ้งหมายเลขบัญชีสหกรณ์</div>
                      <div>• บริการจัดส่งทั่วประเทศ หรือรับสินค้าที่สำนักงานสหกรณ์</div>
                    </div>
                  </div>

                  <a
                    href={getOrderLink(selectedProduct)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#005B35] hover:bg-[#004527] text-white text-sm font-bold shadow-md transition-all"
                  >
                    <MessageCircle className="w-5 h-5 text-[#D4AF37]" />
                    <span>ทักแชทสั่งซื้อสินค้านี้ทันที</span>
                    <ExternalLink className="w-4 h-4 text-emerald-200" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
