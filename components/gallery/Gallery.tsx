'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Search, Check, X } from 'lucide-react';

interface Design {
  id: string;
  title: string;
  style: string;
  price: number;
  imageUrl: string;
}

export default function Gallery({ initialDesigns }: { initialDesigns: Design[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState('All');
  
  // MULTI-SELECT STATE: We store the entire design object of selected items
  const [cart, setCart] = useState<Design[]>([]);

  // Filter Logic
  const filteredDesigns = filter === 'All' 
    ? initialDesigns 
    : initialDesigns.filter(d => d.style === filter);

  const styles = ['All', 'Fine-line', 'Blackwork', 'Traditional', 'Abstract'];

  // TOGGLE SELECTION LOGIC
  const toggleSelection = (design: Design) => {
    if (cart.find(item => item.id === design.id)) {
      // Remove if already in cart
      setCart(cart.filter(item => item.id !== design.id));
    } else {
      // Add to cart
      setCart([...cart, design]);
    }
  };

  // CALCULATE TOTALS
  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);
  const totalItems = cart.length;

  // CHECKOUT ROUTING
  const handleCheckout = () => {
    if (totalItems === 0) return;

    // We create a "Bundle" title and sum the price
    const title = totalItems === 1 ? cart[0].title : `Bundle: ${totalItems} Designs`;
    const designIds = cart.map(d => d.id).join(',');

    router.push(`/checkout/payment?id=${designIds}&title=${encodeURIComponent(title)}&price=${totalPrice}`);
  };

  return (
    <div className="min-h-screen bg-brand-black text-white pb-32">
      
      {/* 1. Artistic Header */}
      <div className="sticky top-0 z-20 bg-brand-black/90 backdrop-blur-md pt-6 pb-4 px-4 border-b border-white/5">
        <div className="flex justify-between items-end mb-6">
            <div>
              <p className="text-brand-muted text-xs tracking-[0.2em] uppercase mb-1">Studio Collection</p>
              <h1 className="text-3xl font-serif text-white tracking-tighter">INK & AURA</h1>
            </div>
            <div className="bg-brand-surface/50 p-3 rounded-full border border-white/10 hover:bg-brand-surface transition-colors">
                <Search size={18} className="text-white" />
            </div>
        </div>

        {/* Scrollable Filters */}
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {styles.map((style) => (
            <button
              key={style}
              onClick={() => setFilter(style)}
              className={`text-sm tracking-wide transition-all ${
                filter === style 
                  ? 'text-brand-yellow font-bold border-b-2 border-brand-yellow pb-1' 
                  : 'text-brand-muted hover:text-white'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Masonry Layout (Pinterest Style) */}
      <div className="p-4 columns-2 md:columns-3 gap-4 space-y-4">
        {filteredDesigns.map((design) => {
          const isSelected = cart.find(item => item.id === design.id);

          return (
            <div 
              key={design.id} 
              onClick={() => toggleSelection(design)}
              className={`relative break-inside-avoid rounded-none overflow-hidden cursor-pointer group transition-all duration-300 ease-out ${
                isSelected ? 'ring-2 ring-brand-yellow ring-offset-2 ring-offset-black scale-[0.98]' : 'hover:opacity-90'
              }`}
            >
              {/* Image: Grayscale by default, Color when selected/hovered */}
              <div className="relative">
                 <img 
                   src={design.imageUrl} 
                   alt={design.title}
                   className={`w-full h-auto object-cover transition-all duration-500 ${
                     isSelected ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'
                   }`}
                 />
                 
                 {/* Selection Overlay */}
                 <div className={`absolute inset-0 bg-brand-yellow/20 transition-opacity duration-300 ${
                    isSelected ? 'opacity-100' : 'opacity-0'
                 }`} />
              </div>

              {/* Info Overlay (Minimalist) */}
              <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/90 to-transparent pt-10">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className={`text-sm font-bold leading-tight ${isSelected ? 'text-brand-yellow' : 'text-white'}`}>
                      {design.title}
                    </h3>
                    <p className="text-[10px] text-brand-muted uppercase tracking-wider">{design.style}</p>
                  </div>
                  {isSelected && (
                    <div className="bg-brand-yellow text-black p-1 rounded-full">
                      <Check size={12} strokeWidth={4} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Floating "Ink Cart" Dock - FORCED VISIBILITY */}
<div className={`fixed bottom-6 inset-x-4 z-50 transition-transform duration-500 ${
  totalItems > 0 ? 'translate-y-0' : 'translate-y-24'
}`}>
  <div className="bg-[#1E1E1E] border border-gray-600 p-4 rounded-2xl shadow-2xl flex items-center justify-between relative z-50">
      <div className="flex flex-col">
          <span className="text-xs text-gray-400 uppercase tracking-wider">Total ({totalItems} items)</span>
          <span className="text-xl font-bold text-white font-mono">₹{totalPrice.toLocaleString()}</span>
      </div>

      <button 
          onClick={handleCheckout}
          className="bg-[#FFC107] text-black px-6 py-3 rounded-xl font-bold text-sm tracking-wide shadow-lg hover:bg-yellow-400 active:scale-95 flex items-center gap-2 border-2 border-yellow-600"
      >
          CHECKOUT <ShoppingBag size={18} />
      </button>
  </div>
</div>

    </div>
  );
}