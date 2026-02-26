'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, ChevronUp, SlidersHorizontal, Zap, ArrowDownCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// SORT OPTIONS
const PRICE_RANGES = ['Low to High', 'High to Low', '50', '75', '100', '125', '150', '175', '200', '225', '250', '300'];

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, 
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

function GalleryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 1. DATA STATES
  const [inventory, setInventory] = useState<any[]>([]);
  const [displayedItems, setDisplayedItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 2. DETECT PROFILE FROM URL (?profile=2)
  const isProfile2 = searchParams.get('profile') === '2';

  // 3. FETCH INVENTORY DYNAMICALLY
  useEffect(() => {
    const fetchInventoryData = async () => {
        setIsLoading(true);
        try {
            // Determine which JSON file to load based on the URL
            const jsonFile = isProfile2 ? '/inventory2.json' : '/inventory1.json';
            
            // Add a cache-busting query param in development
            const response = await fetch(`${jsonFile}?t=${new Date().getTime()}`);
            
            if (!response.ok) {
                throw new Error(`Failed to load ${jsonFile}`);
            }
            
            const data = await response.json();
            setInventory(data);
            setDisplayedItems(data);
        } catch (error) {
            console.error("Error loading inventory:", error);
            setInventory([]);
            setDisplayedItems([]);
        } finally {
            setIsLoading(false);
        }
    };

    fetchInventoryData();
  }, [isProfile2]);

  // States
  const [activePriceRange, setActivePriceRange] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(24); // Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTattoos, setSelectedTattoos] = useState<any[]>([]);
  const [showCartOverlay, setShowCartOverlay] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [hasRewardShown, setHasRewardShown] = useState(false); 
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Top 5 Highest Priced for New Arrivals
  const newArrivals = useMemo(() => {
    if(inventory.length === 0) return [];
    return [...inventory]
      .sort((a, b) => parseInt(String(b["Sort by"]), 10) - parseInt(String(a["Sort by"]), 10))
      .slice(0, 5);
  }, [inventory]);

  // Derived Search Suggestions
  const searchSuggestions = useMemo(() => {
      if (!searchQuery.trim() || inventory.length === 0) return [];
      const q = searchQuery.toLowerCase();
      return inventory.filter(t => 
        String(t.code || '').toLowerCase().includes(q) || 
        String(t.price || '').toLowerCase().includes(q)
      );
  }, [searchQuery, inventory]);

  // Init Cart
  useEffect(() => {
    localStorage.removeItem('tattoo_cart'); 
    setSelectedTattoos([]); 
  }, []);

  useEffect(() => {
    if (selectedTattoos.length > 0) {
        localStorage.setItem('tattoo_cart', JSON.stringify(selectedTattoos));
    }
  }, [selectedTattoos]);

  // Filter & Sort Logic
  useEffect(() => {
    if(inventory.length === 0) return;

    let result = [...inventory];
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        String(t.code || '').toLowerCase().includes(q) || 
        String(t.price || '').toLowerCase().includes(q)
      );
    }

    if (activePriceRange && activePriceRange !== 'Low to High' && activePriceRange !== 'High to Low') {
        const targetPrice = parseInt(activePriceRange, 10);
        result = result.filter(t => {
            const p = parseInt(String(t["Sort by"]), 10) || 0;
            return p === targetPrice;
        });
    }

    result.sort((a, b) => {
        const priceA = parseInt(String(a["Sort by"]), 10) || 0;
        const priceB = parseInt(String(b["Sort by"]), 10) || 0;
        
        if (activePriceRange === 'High to Low') {
            return priceB - priceA;
        }
        return priceA - priceB;
    });

    setDisplayedItems(result);
    setVisibleCount(24);
  }, [activePriceRange, searchQuery, inventory]);

  const handleSelect = (tattoo: any) => {
    if (selectedTattoos.find(t => t.id === tattoo.id)) return;
    
    if (!hasRewardShown) {
        setShowReward(true);
        setHasRewardShown(true);
        setTimeout(() => setShowReward(false), 2500);
    }
    setSelectedTattoos(prev => [...prev, { ...tattoo, addedAt: Date.now() }]);
  };

  const handleRemoveItem = (id: string) => {
    const newList = selectedTattoos.filter(t => t.id !== id);
    setSelectedTattoos(newList);
    if (newList.length === 0) setShowCartOverlay(false);
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 24);
  };

  // Loading State UI
  if (isLoading) {
      return (
          <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-[#F74B33] mb-4" size={40} />
              <p className="font-inter text-[#16161B] font-bold uppercase tracking-widest">Loading Catalog</p>
          </div>
      );
  }

  // --- FIXED: Removed the mismatched Suspense tags inside this return ---
  return (
      <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="min-h-screen bg-[#FFFFFF] font-sans relative overflow-x-hidden"
      >
        
        {/* 1. FIXED HEADER */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFFFFF] h-[74px] flex items-center justify-between px-[20px]">
           <div className="flex flex-col justify-center">
              <p className="text-[10px] text-[#16161B] font-inter tracking-widest lowercase mb-[2px]" style={{ textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                  {isProfile2 ? 'exclusive access' : 'welcome to'}
              </p>
              <h1 className="text-[24px] font-extrabold text-[#16161B] uppercase leading-[0.9]" style={{ fontFamily: 'var(--font-abhaya), serif' }}>
                TATTOO<br/>TATTVA
              </h1>
           </div>
           <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSearchOpen(!isSearchOpen)} 
              className="p-1"
           >
              <Search size={24} strokeWidth={1.5} color="#16161B" />
           </motion.button>
        </header>
        
        <div className="fixed top-[74px] left-0 right-0 z-50 h-[2px]" style={{ background: 'linear-gradient(-45deg, #F74B33, #FFB6AB)' }} />

        {/* SEARCH BAR & SUGGESTIONS */}
        <AnimatePresence>
          {isSearchOpen && (
              <motion.div 
                  initial={{ y: -20, opacity: 0 }} 
                  animate={{ y: 0, opacity: 1 }} 
                  exit={{ y: -20, opacity: 0 }} 
                  className="fixed top-[76px] left-0 right-0 z-40 bg-[#FFFFFF] px-[20px] py-[12px] shadow-sm border-b border-gray-100"
              >
                  <div className="relative w-full">
                      <div className="w-full h-[46px] bg-gray-50 rounded-full border border-gray-200 flex items-center px-[16px]">
                          <Search size={18} className="text-gray-400 mr-[8px]" />
                          <input autoFocus type="text" placeholder="Search code..." className="flex-1 bg-transparent outline-none text-[#16161B] text-[14px]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                          {searchQuery && <button onClick={() => setSearchQuery('')}><X size={16} className="text-gray-400"/></button>}
                      </div>
                      {searchQuery && searchSuggestions.length > 0 && (
                          <div className="absolute top-[100%] mt-[8px] left-0 right-0 bg-[#FFFFFF] rounded-[12px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 max-h-[240px] overflow-y-auto z-50">
                              {searchSuggestions.slice(0, 5).map(item => (
                                  <div key={`suggest-${item.id}`} onClick={() => { handleSelect(item); setSearchQuery(''); setIsSearchOpen(false); }} 
                                       className="flex items-center px-[16px] py-[10px] border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors">
                                      <img src={item.img} className="w-[36px] h-[36px] object-contain mix-blend-multiply" />
                                      <span className="ml-[12px] font-inter text-[13px] font-medium text-[#16161B]">Code-{item.code}</span>
                                      <span className="ml-auto font-inter text-[13px] font-bold text-[#F74B33]">Rs. {item.price}</span>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-[76px]">
            
            {/* NEW ARRIVALS HORIZONTAL SCROLL */}
            {newArrivals.length > 0 && (
            <section className="bg-[#FFFFFF] pt-[24px] pb-[8px]">
                <div className="px-[20px] mb-[16px]">
                    <h2 className="text-[18px] text-[#16161B] font-inter font-normal">New Arrivals</h2>
                </div>
                <div className="flex gap-[16px] overflow-x-auto px-[20px] pb-[16px] pt-[4px] no-scrollbar">
                    {newArrivals.map((item) => {
                        const isSelected = selectedTattoos.find(t => t.id === item.id);
                        return (
                          <motion.div 
                              key={`new-${item.id}`} 
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleSelect(item)} 
                              className="shrink-0 cursor-pointer" 
                              style={{ width: '260px', height: '220px' }}
                          >
                              <div style={{
                                  background: isSelected ? 'linear-gradient(-45deg, #F74B33, #FFB6AB)' : 'linear-gradient(-45deg, #4F4F4F, #BDBDBD)',
                                  padding: '1px',
                                  borderRadius: '12px',
                                  width: '100%', height: '100%',
                                  boxShadow: '4px 4px 10px rgba(0,0,0,0.15)'
                              }}>
                                  <div style={{ background: '#FFFFFF', borderRadius: '11px', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                                          <img src={item.img} alt={item.code} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                                      </div>
                                  </div>
                              </div>
                          </motion.div>
                        );
                    })}
                </div>
            </section>
            )}

            {/* STICKY "SORT BY" ROW */}
            <div className="sticky top-[76px] z-30 w-full flex flex-col">
                <div className="w-full h-[1px] bg-[#F74B33]" />
                
                <div className="bg-[#FFFFFF] px-[20px] py-[12px] flex flex-col gap-[12px]">
                    <div className="flex justify-end">
                        <div style={{ background: 'linear-gradient(-45deg, #4F4F4F, #BDBDBD)', padding: '1px', borderRadius: '999px' }}>
                            <button onClick={() => setIsSortOpen(!isSortOpen)} style={{ background: '#FFFFFF', borderRadius: '999px', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <SlidersHorizontal size={14} color="#000000" strokeWidth={2} />
                                <span className="font-inter text-[14px] text-[#000000]">Sort by</span>
                            </button>
                        </div>
                    </div>

                    <AnimatePresence>
                        {isSortOpen && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex items-center gap-[8px] overflow-x-auto no-scrollbar pb-1">
                                {PRICE_RANGES.map((range) => {
                                    const isActive = activePriceRange === range;
                                    return (
                                      <motion.button 
                                          whileTap={{ scale: 0.95 }}
                                          key={range} 
                                          onClick={() => setActivePriceRange(isActive ? null : range)} 
                                          style={{ 
                                              background: isActive ? '#F74B33' : '#FFFFFF', 
                                              border: isActive ? '1px solid #F74B33' : '1px solid #CCCCCC',
                                              color: isActive ? '#FFFFFF' : '#666666',
                                              borderRadius: '999px', padding: '6px 16px', fontSize: '14px', fontFamily: 'Inter, sans-serif', fontWeight: isActive ? 600 : 400, flexShrink: 0 
                                          }}
                                      >
                                          {range}
                                      </motion.button>
                                    );
                                })}
                                {activePriceRange && (
                                    <button onClick={() => setActivePriceRange(null)} style={{ border: '1px solid #CCCCCC', borderRadius: '8px', padding: '6px', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <X size={16} color="#666666" />
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* MAIN GRID */}
            <main className="w-full px-[20px] py-[16px] pb-[160px]">
               <motion.div 
                  layout
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', columnGap: '15px', rowGap: '15px' }}
               >
                  {displayedItems.slice(0, visibleCount).map((item) => {
                      const isSelected = selectedTattoos.find(t => t.id === item.id);
                      return (
                        <motion.div 
                          layout 
                          variants={itemVariants}
                          whileTap={{ scale: 0.97 }}
                          key={item.id} 
                          onClick={() => handleSelect(item)} 
                          className="cursor-pointer"
                        >
                          <div style={{
                              background: isSelected ? 'linear-gradient(-45deg, #F74B33, #FFB6AB)' : 'linear-gradient(-45deg, #4F4F4F, #BDBDBD)',
                              padding: '1px',
                              borderRadius: '12px',
                              boxShadow: isSelected ? '4px 4px 10px rgba(0,0,0,0.15)' : 'none'
                          }}>
                              <div style={{ background: '#FFFFFF', borderRadius: '11px', display: 'flex', flexDirection: 'column', padding: '5px' }}>
                                  <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                      <div style={{ width: '100%', aspectRatio: '1/1', maxHeight: '165px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                                          <img src={item.img} alt={item.code} style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} loading="lazy" />
                                      </div>
                                  </div>
                                  <div style={{ padding: '8px 12px 12px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 400, color: '#16161B' }}>Code-{item.code}</span>
                                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 700, color: '#F74B33' }}>Rs. {item.price}</span>
                                  </div>
                              </div>
                          </div>
                        </motion.div>
                      );
                  })}
               </motion.div>

               {/* LOAD MORE BUTTON */}
               {visibleCount < displayedItems.length && (
                  <div className="flex justify-center mt-8">
                     <motion.button
                        onClick={handleLoadMore}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-6 py-3 bg-[#F5F5F5] rounded-full text-[#16161B] font-inter text-[13px] font-bold uppercase tracking-wide hover:bg-[#EAEAEA] transition-colors"
                     >
                        <ArrowDownCircle size={18} />
                        Load More Designs
                     </motion.button>
                  </div>
               )}
            </main>
        </div>

        {/* UPGRADED REWARD CARD OVERLAY */}
        <AnimatePresence>
          {showReward && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
                  <motion.div 
                      initial={{ scale: 0.8, rotate: -5 }} 
                      animate={{ scale: 1, rotate: 0 }} 
                      exit={{ scale: 0.8, opacity: 0 }} 
                      transition={{ type: "spring", bounce: 0.5 }}
                      className="bg-[#FFFFFF] rounded-[24px] py-[40px] px-[24px] flex flex-col items-center shadow-2xl w-full max-w-[340px] text-center relative overflow-hidden"
                  >
                      <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-[#F74B33] to-[#FFB6AB]" />
                      <div className="w-[64px] h-[64px] bg-[#F74B33]/10 rounded-full flex items-center justify-center mb-6">
                          <Zap size={32} className="text-[#F74B33] fill-[#F74B33]" />
                      </div>
                      <h2 className="text-[#16161B] text-[24px] font-extrabold leading-tight font-inter mb-2">
                          Your Ink Journey<br/>Has Started
                      </h2>
                      <p className="text-[#666666] text-[13px] font-inter">Great choice! Add more designs or proceed to checkout.</p>
                  </motion.div>
              </motion.div>
          )}
        </AnimatePresence>

        {/* FLOATING CART BOTTOM BAR */}
        <AnimatePresence>
          {selectedTattoos.length > 0 && !showReward && !showCartOverlay && (
              <motion.div 
                  initial={{ y: 100, opacity: 0 }} 
                  animate={{ y: 0, opacity: 1 }} 
                  exit={{ y: 100, opacity: 0 }}
                  transition={{ type: 'spring', damping: 20 }}
                  style={{
                      position: 'fixed', bottom: '24px', left: '24px', right: '24px', zIndex: 80,
                      background: 'linear-gradient(-45deg, #4F4F4F, #BDBDBD)', padding: '1px', borderRadius: '12px',
                      boxShadow: '4px 4px 10px rgba(0,0,0,0.1)'
                  }}
              >
                  <div style={{
                      background: '#FFFFFF',
                      borderRadius: '11px', padding: '10px 16px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                      <button onClick={() => setShowCartOverlay(true)} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="#16161B" xmlns="http://www.w3.org/2000/svg">
                              <path d="M7 18C5.9 18 5.01 18.9 5.01 20C5.01 21.1 5.9 22 7 22C8.1 22 9 21.1 9 20C9 18.9 8.1 18 7 18ZM1 2V4H3L6.6 11.59L5.24 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.28 15 7.17 14.89 7.17 14.75L7.2 14.63L8.1 13H15.55C16.3 13 16.96 12.59 17.3 11.97L20.88 5.51C20.96 5.34 21 5.17 21 5C21 4.45 20.55 4 20 4H5.21L4.27 2H1ZM17 18C15.9 18 15.01 18.9 15.01 20C15.01 21.1 15.9 22 17 22C18.1 22 19 21.1 19 20C19 18.9 18.1 18 17 18Z" />
                          </svg>
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: 500, color: '#16161B' }}>Tattoo Cart</span>
                          
                          <div style={{ background: 'linear-gradient(-45deg, #F74B33, #FFB6AB)', padding: '2px', borderRadius: '4px' }}>
                              <div style={{ background: '#FFFFFF', padding: '2px 8px', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <span style={{ color: '#16161B', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>{selectedTattoos.length}</span>
                              </div>
                          </div>
                      </button>
                      
                      <motion.button 
                          whileTap={{ scale: 0.95 }}
                          onClick={() => router.push('/checkout')} 
                          style={{
                              background: '#F74B33', borderRadius: '6px', padding: '10px 16px',
                              color: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase'
                          }}
                      >
                          BOOK SESSION
                      </motion.button>
                  </div>
              </motion.div>
          )}
        </AnimatePresence>

        {/* EXPANDED CART OVERLAY */}
        <AnimatePresence>
          {showCartOverlay && (
              <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCartOverlay(false)} className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm" />
              <motion.div 
                  initial={{ y: '100%' }} 
                  animate={{ y: 0 }} 
                  exit={{ y: '100%' }} 
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="fixed bottom-0 left-0 right-0 z-[95] bg-[#FFFFFF] rounded-t-[24px] shadow-2xl p-[24px] pb-[40px] max-h-[80vh] overflow-y-auto"
              >
                  <div className="flex justify-between items-center mb-[24px]">
                      <h2 className="text-[20px] font-bold text-[#16161B]" style={{ fontFamily: 'var(--font-abhaya), serif' }}>YOUR CART</h2>
                      <button onClick={() => setShowCartOverlay(false)}><ChevronUp size={24} className="rotate-180 text-[#16161B]" /></button>
                  </div>
                  <div className="space-y-[16px] mb-[32px]">
                      {selectedTattoos.map((item) => (
                          <motion.div layout key={item.addedAt} className="flex justify-between items-center bg-gray-50 p-[12px] rounded-[12px] border border-gray-100">
                              <div className="flex items-center gap-[16px]">
                                  <img src={item.img} className="w-[48px] h-[48px] object-contain mix-blend-multiply" />
                                  <div>
                                      <p className="font-bold text-[14px] text-[#16161B] font-inter">Code-{item.code}</p>
                                      <p className="text-[12px] text-[#F74B33] font-bold font-inter">Rs. {item.price}</p>
                                  </div>
                              </div>
                              <button onClick={() => handleRemoveItem(item.id)} className="text-[#F74B33] p-[8px]"><X size={18} /></button>
                          </motion.div>
                      ))}
                  </div>
                  <motion.button 
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push('/checkout')} 
                      className="w-full h-[56px] bg-[#F74B33] text-[#FFFFFF] rounded-[12px] font-bold text-[14px] uppercase font-inter tracking-wide shadow-lg"
                  >
                      PROCEED TO BOOKING
                  </motion.button>
              </motion.div>
              </>
          )}
        </AnimatePresence>

      </motion.div>
  );
}

// 4. MAIN EXPORT WRAPPED IN SUSPENSE
export default function Gallery() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading Gallery...</div>}>
        <GalleryContent />
    </Suspense>
  )
}