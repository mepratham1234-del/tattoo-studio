'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Check, UserCircle } from 'lucide-react';

// Mock database for artists and their assigned tiers
const INITIAL_ARTISTS = [
  { id: '1', name: 'Rahul', role: 'Senior Artist', category: 1 },
  { id: '2', name: 'Sneha', role: 'Junior Artist', category: 2 },
  { id: '3', name: 'Vikram', role: 'Senior Artist', category: 1 },
];

export default function ManageArtists() {
  const router = useRouter();
  const [artists, setArtists] = useState(INITIAL_ARTISTS);

  // Function to toggle between Category 1 and Category 2
  const updateCategory = (id: string, newCategory: number) => {
    setArtists(artists.map(artist => 
      artist.id === id ? { ...artist, category: newCategory } : artist
    ));
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-sans pb-[80px]">
      
      {/* 1. TOP NAVIGATION HEADER */}
      <header className="pt-[40px] px-[24px] flex items-center gap-[12px] mb-[32px]">
        <button onClick={() => router.back()} className="p-1 -ml-1">
          <ChevronLeft size={24} color="#16161B" strokeWidth={2.5} />
        </button>
        <div className="flex flex-col">
          <h1 className="text-[24px] font-extrabold text-[#16161B] uppercase leading-none" style={{ fontFamily: 'var(--font-abhaya), serif' }}>
            MANAGE ARTISTS
          </h1>
          <p className="font-inter text-[10px] text-[#666666] font-medium uppercase mt-[4px] tracking-widest">
            Pricing Profile Assignment
          </p>
        </div>
      </header>

      {/* 2. PRICE PROFILE EXPLANATION */}
      <div className="px-[24px] mb-[24px]">
        <div className="bg-[#FAFAFA] border border-[#EAEAEA] rounded-[12px] p-[16px]">
          <h3 className="font-inter text-[12px] font-bold text-[#16161B] uppercase mb-[8px]">Price Categories</h3>
          <div className="flex flex-col gap-[4px]">
            <p className="font-inter text-[12px] text-[#666666]"><strong className="text-[#16161B]">Category 1:</strong> Premium Pricing (Senior Artists)</p>
            <p className="font-inter text-[12px] text-[#666666]"><strong className="text-[#16161B]">Category 2:</strong> Standard Pricing (Junior Artists)</p>
          </div>
        </div>
      </div>

      {/* 3. ARTIST LIST */}
      <div className="px-[24px] flex flex-col gap-[16px]">
        {artists.map((artist) => (
          <div key={artist.id} style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '16px', boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.05)' }}>
            <div className="bg-[#FFFFFF] rounded-[15px] p-[20px] w-full flex flex-col gap-[16px]">
              
              {/* Artist Info */}
              <div className="flex items-center gap-[12px] border-b border-[#EAEAEA] pb-[16px]">
                <UserCircle size={32} color="#16161B" strokeWidth={1.5} />
                <div>
                  <h2 className="font-inter text-[16px] font-bold text-[#16161B]">{artist.name}</h2>
                  <p className="font-inter text-[12px] text-[#666666] uppercase">{artist.role}</p>
                </div>
              </div>

              {/* Category Toggles */}
              <div>
                <p className="font-inter text-[10px] font-medium text-[#16161B] uppercase mb-[8px] tracking-wide">Assign Pricing Tier</p>
                <div className="flex gap-[8px]">
                  
                  {/* Category 1 Button */}
                  <button 
                    onClick={() => updateCategory(artist.id, 1)}
                    className={`flex-1 h-[40px] rounded-[8px] flex items-center justify-center gap-[6px] transition-all border ${
                      artist.category === 1 
                        ? 'border-[#F74B33] bg-[#F74B33]/10 text-[#F74B33]' 
                        : 'border-[#EAEAEA] bg-[#FAFAFA] text-[#666666]'
                    }`}
                  >
                    {artist.category === 1 && <Check size={14} strokeWidth={3} />}
                    <span className="font-inter text-[12px] font-bold uppercase">Category 1</span>
                  </button>

                  {/* Category 2 Button */}
                  <button 
                    onClick={() => updateCategory(artist.id, 2)}
                    className={`flex-1 h-[40px] rounded-[8px] flex items-center justify-center gap-[6px] transition-all border ${
                      artist.category === 2 
                        ? 'border-[#F74B33] bg-[#F74B33]/10 text-[#F74B33]' 
                        : 'border-[#EAEAEA] bg-[#FAFAFA] text-[#666666]'
                    }`}
                  >
                    {artist.category === 2 && <Check size={14} strokeWidth={3} />}
                    <span className="font-inter text-[12px] font-bold uppercase">Category 2</span>
                  </button>

                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

    </div>
  );
}