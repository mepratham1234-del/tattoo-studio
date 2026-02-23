'use client';

import { useRouter } from 'next/navigation';
import { ScanLine, CalendarDays, FileEdit } from 'lucide-react';

export default function OwnerSession() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-sans flex flex-col items-center px-[24px] pt-[80px] pb-[40px]">
      
      {/* 1. HEADER */}
      <div className="text-center mb-[60px]">
        <h1 className="text-[32px] font-extrabold text-[#16161B] uppercase tracking-wide leading-none" style={{ fontFamily: 'var(--font-abhaya), serif' }}>
          WELCOME
        </h1>
        <p className="font-inter text-[14px] text-[#333333] font-medium uppercase tracking-wide mt-[8px]">
          LOGGED IN AS OWNER
        </p>
      </div>

      {/* 2. ACTION BUTTONS */}
      <div className="w-full max-w-[340px] flex flex-col items-center gap-[24px]">
        
        {/* START SCANNING (Primary Full-Width) */}
        <div className="w-full" style={{ 
          background: 'linear-gradient(-45deg, #FFB6AB, #F74B33)', 
          padding: '2px', 
          borderRadius: '16px', 
          boxShadow: '4px 4px 10px rgba(247, 75, 51, 0.15)' 
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

        {/* 2x2 GRID FOR MANAGEMENT TOOLS */}
        <div className="w-full grid grid-cols-2 gap-[16px]">
          
          {/* DASHBOARD */}
          <div style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '16px', boxShadow: '4px 4px 15px rgba(0, 0, 0, 0.08)' }}>
            <button 
              onClick={() => router.push('/studio/dashboard/owner')}
              className="w-full h-full bg-[#FFFFFF] rounded-[15px] flex flex-col items-center justify-center gap-[8px] py-[20px] active:scale-[0.98] transition-transform"
            >
              <CalendarDays size={24} color="#16161B" strokeWidth={1.5} />
              <span className="font-inter text-[12px] font-normal text-[#16161B] uppercase tracking-wide text-center">
                DASHBOARD
              </span>
            </button>
          </div>

          {/* INVENTORY */}
          <div style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '16px', boxShadow: '4px 4px 15px rgba(0, 0, 0, 0.08)' }}>
            <button 
              onClick={() => router.push('/studio/inventory')}
              className="w-full h-full bg-[#FFFFFF] rounded-[15px] flex flex-col items-center justify-center gap-[8px] py-[20px] active:scale-[0.98] transition-transform"
            >
              <FileEdit size={24} color="#16161B" strokeWidth={1.5} />
              <span className="font-inter text-[12px] font-normal text-[#16161B] uppercase tracking-wide text-center">
                INVENTORY
              </span>
            </button>
          </div>

          {/* ADD ARTIST */}
          <div style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '16px', boxShadow: '4px 4px 15px rgba(0, 0, 0, 0.08)' }}>
            <button 
              onClick={() => router.push('/studio/add-artist')}
              className="w-full h-full bg-[#FFFFFF] rounded-[15px] flex flex-col items-center justify-center gap-[8px] py-[20px] active:scale-[0.98] transition-transform"
            >
              <FileEdit size={24} color="#16161B" strokeWidth={1.5} />
              <span className="font-inter text-[12px] font-normal text-[#16161B] uppercase tracking-wide text-center px-[4px]">
                ADD ARTIST
              </span>
            </button>
          </div>

          {/* ASSIGN PRICE PROFILE */}
          <div style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '16px', boxShadow: '4px 4px 15px rgba(0, 0, 0, 0.08)' }}>
            <button 
              onClick={() => router.push('/studio/assign-price')}
              className="w-full h-full bg-[#FFFFFF] rounded-[15px] flex flex-col items-center justify-center gap-[8px] py-[20px] px-[8px] active:scale-[0.98] transition-transform"
            >
              <FileEdit size={24} color="#16161B" strokeWidth={1.5} />
              <span className="font-inter text-[12px] font-normal text-[#16161B] uppercase tracking-wide text-center leading-tight">
                ASSIGN PRICE<br/>PROFILE
              </span>
            </button>
          </div>

        </div>

      </div>

      {/* 3. FOOTER ACTION */}
      <button 
        onClick={() => router.push('/studio')}
        className="mt-auto font-inter text-[16px] font-medium text-[#16161B] uppercase tracking-wide active:opacity-50 transition-opacity"
      >
        LOG OUT
      </button>

    </div>
  );
}