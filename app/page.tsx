'use client';

import { useRouter } from 'next/navigation';

export default function CustomerLanding() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center px-[24px] pb-[80px]">
      
      {/* 1. CUSTOM PNG LOGO SECTION */}
      <div className="w-[160px] h-[180px] relative mb-[8px] flex flex-col items-center justify-center">
        <img 
          src="/logo.png" 
          alt="Tattoo Tattva Logo" 
          className="w-full h-full object-contain" 
        />
      </div>

      {/* 2. TEXT SECTION */}
      <div className="text-center mb-[60px]">
        <h1 
          className="text-[48px] font-extrabold text-[#16161B] leading-[0.95] tracking-tight mb-[16px] uppercase"
          style={{ fontFamily: 'var(--font-abhaya), serif' }}
        >
          TATTOO<br/>TATTVA
        </h1>
        <p className="font-inter text-[13px] text-[#16161B] font-medium uppercase tracking-[0.2em]">
          Pick Your Poison
        </p>
      </div>

      {/* 3. ACTION BUTTON */}
      <button 
        /* FIX: Changed from '/browse' to '/gallery' to match your feed component */
        onClick={() => router.push('/gallery')} 
        className="w-full max-w-[280px] h-[52px] bg-[#F74B33] rounded-[10px] flex items-center justify-center active:scale-[0.98] transition-transform shadow-[0_8px_20px_rgba(247,75,51,0.25)]"
      >
        <span className="font-inter text-[14px] font-bold text-[#FFFFFF] uppercase tracking-wider">
          BROWSE DESIGN
        </span>
      </button>

    </div>
  );
}