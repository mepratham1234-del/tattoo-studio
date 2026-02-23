'use client';

import { useRouter } from 'next/navigation';
import { ScanLine, CalendarDays } from 'lucide-react';

export default function ArtistSession() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-sans flex flex-col items-center px-[24px] pt-[80px] pb-[40px]">
      
      {/* 1. HEADER */}
      <div className="text-center mb-[60px]">
        <h1 className="text-[32px] font-extrabold text-[#16161B] uppercase tracking-wide leading-none" style={{ fontFamily: 'var(--font-abhaya), serif' }}>
          WELCOME
        </h1>
        <p className="font-inter text-[14px] text-[#333333] font-medium uppercase tracking-wide mt-[8px]">
          LOGGED IN AS RAHUL
        </p>
      </div>

      {/* 2. ACTION BUTTONS */}
      <div className="w-full max-w-[340px] flex flex-col gap-[24px]">
        
        {/* START SCANNING (Primary Action) */}
        <div style={{ 
          background: 'linear-gradient(-45deg, #F74B33, #FFB6AB)', 
          padding: '2px', // 2px Gradient Border
          borderRadius: '16px', 
          boxShadow: '4px 4px 10px rgba(247, 75, 51, 0.15)' // Soft Red Glow
        }}>
          <button 
            onClick={() => router.push('/studio/scanner')}
            className="w-full bg-[#FFFFFF] rounded-[14px] flex flex-col items-center justify-center gap-[8px] py-[24px] active:scale-[0.98] transition-transform"
          >
            <ScanLine size={32} color="#16161B" strokeWidth={2} />
            <span className="font-inter text-[16px] font-bold text-[#16161B] uppercase tracking-wide">
              START SCANNING
            </span>
          </button>
        </div>

        {/* VIEW DASHBOARD (Secondary Action) */}
        <div style={{ 
          background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', 
          padding: '1px', // 1px Gradient Border
          borderRadius: '16px', 
          boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.08)' // Soft Neutral Shadow
        }}>
          <button 
            onClick={() => router.push('/studio/dashboard/artist')}
            className="w-full bg-[#FFFFFF] rounded-[15px] flex flex-col items-center justify-center gap-[8px] py-[24px] active:scale-[0.98] transition-transform"
          >
            <CalendarDays size={32} color="#16161B" strokeWidth={1.5} />
            <span className="font-inter text-[16px] font-normal text-[#16161B] uppercase tracking-wide">
              VIEW DASHBOARD
            </span>
          </button>
        </div>

      </div>

      {/* 3. FOOTER ACTION */}
      <button 
        onClick={() => router.push('/studio/login')}
        className="mt-auto font-inter text-[16px] font-medium text-[#16161B] uppercase tracking-wide active:opacity-50 transition-opacity"
      >
        LOG OUT
      </button>

    </div>
  );
}