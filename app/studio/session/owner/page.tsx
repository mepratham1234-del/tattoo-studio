'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ScanLine, CalendarDays, FileEdit, LogOut, UserPlus, CreditCard } from 'lucide-react';

export default function OwnerSession() {
  const router = useRouter();
  const [name, setName] = useState('Owner');

  // 1. Get Dynamic Name
  useEffect(() => {
    const storedName = localStorage.getItem('studio_user_name');
    if (storedName) setName(storedName);
  }, []);

  // 2. Clean Logout
  const handleLogout = () => {
      localStorage.removeItem('studio_user_name');
      localStorage.removeItem('studio_user_role');
      localStorage.removeItem('shift_start_time');
      router.push('/studio');
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-sans flex flex-col items-center px-[24px] pt-[80px] pb-[40px]">
      
      {/* 1. HEADER */}
      <div className="text-center mb-[40px]">
        <h1 className="text-[32px] font-extrabold text-[#16161B] uppercase tracking-wide leading-none" style={{ fontFamily: 'var(--font-abhaya), serif' }}>
          WELCOME
        </h1>
        <p className="font-inter text-[14px] text-[#333333] font-medium uppercase tracking-wide mt-[8px]">
          LOGGED IN AS {name}
        </p>
      </div>

      {/* 2. ACTION BUTTONS */}
      <div className="w-full max-w-[340px] flex flex-col items-center gap-[16px]">
        
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

        {/* DASHBOARD (Full Width) */}
        <div className="w-full" style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '16px', boxShadow: '4px 4px 15px rgba(0, 0, 0, 0.08)' }}>
            <button 
                onClick={() => router.push('/studio/dashboard/owner')}
                className="w-full bg-[#FFFFFF] rounded-[15px] flex items-center justify-center gap-[12px] py-[16px] active:scale-[0.98] transition-transform"
            >
                <CalendarDays size={24} color="#16161B" strokeWidth={1.5} />
                <span className="font-inter text-[14px] font-bold text-[#16161B] uppercase tracking-wide">
                VIEW DASHBOARD
                </span>
            </button>
        </div>

        {/* 2x2 GRID FOR MANAGEMENT TOOLS */}
        <div className="w-full grid grid-cols-2 gap-[16px]">
          
          {/* INVENTORY */}
          <div style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '16px', boxShadow: '4px 4px 15px rgba(0, 0, 0, 0.08)' }}>
            <button 
              onClick={() => router.push('/studio/inventory')}
              className="w-full h-full bg-[#FFFFFF] rounded-[15px] flex flex-col items-center justify-center gap-[8px] py-[20px] active:scale-[0.98] transition-transform"
            >
              <FileEdit size={24} color="#16161B" strokeWidth={1.5} />
              <span className="font-inter text-[11px] font-bold text-[#16161B] uppercase tracking-wide text-center">
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
              <UserPlus size={24} color="#16161B" strokeWidth={1.5} />
              <span className="font-inter text-[11px] font-bold text-[#16161B] uppercase tracking-wide text-center px-[4px]">
                ADD ARTIST
              </span>
            </button>
          </div>

          {/* ASSIGN PRICE PROFILE */}
          <div style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '16px', boxShadow: '4px 4px 15px rgba(0, 0, 0, 0.08)' }}>
            <button 
              /* FIXED LINK HERE: Points to assign-profile, NOT assign-price */
              onClick={() => router.push('/studio/assign-profile')}
              className="w-full h-full bg-[#FFFFFF] rounded-[15px] flex flex-col items-center justify-center gap-[8px] py-[20px] px-[8px] active:scale-[0.98] transition-transform"
            >
              <FileEdit size={24} color="#16161B" strokeWidth={1.5} />
              <span className="font-inter text-[11px] font-bold text-[#16161B] uppercase tracking-wide text-center leading-tight">
                ASSIGN<br/>PROFILE
              </span>
            </button>
          </div>

          {/* BANK DETAILS (New button to reach the Bank page) */}
          <div style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '16px', boxShadow: '4px 4px 15px rgba(0, 0, 0, 0.08)' }}>
            <button 
              onClick={() => router.push('/studio/bank-details')}
              className="w-full h-full bg-[#FFFFFF] rounded-[15px] flex flex-col items-center justify-center gap-[8px] py-[20px] px-[8px] active:scale-[0.98] transition-transform"
            >
              <CreditCard size={24} color="#16161B" strokeWidth={1.5} />
              <span className="font-inter text-[11px] font-bold text-[#16161B] uppercase tracking-wide text-center leading-tight">
                BANK<br/>DETAILS
              </span>
            </button>
          </div>

        </div>

      </div>

      {/* 3. FOOTER ACTION */}
      <button 
        onClick={handleLogout}
        className="mt-auto flex items-center gap-2 font-inter text-[14px] font-medium text-[#666666] uppercase tracking-wide active:opacity-50 transition-opacity hover:text-[#F74B33]"
      >
        <LogOut size={16} /> LOG OUT
      </button>

    </div>
  );
}