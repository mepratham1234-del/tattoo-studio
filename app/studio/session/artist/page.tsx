'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ScanLine, CalendarDays, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function ArtistSession() {
  const router = useRouter();
  const [name, setName] = useState('Artist');

  // 1. Get Dynamic Name from Session
  useEffect(() => {
    const storedName = localStorage.getItem('studio_user_name');
    if (storedName) {
        setName(storedName);
    } else {
        router.push('/studio');
    }
  }, [router]);

  // 2. Clean Logout Handler
  const handleLogout = () => {
      localStorage.removeItem('studio_user_name');
      localStorage.removeItem('studio_user_role');
      localStorage.removeItem('shift_start_time');
      router.push('/studio');
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="min-h-screen bg-[#FFFFFF] font-sans flex flex-col items-center px-[24px] pt-[80px] pb-[40px]"
    >
      
      {/* 1. HEADER */}
      <motion.div variants={itemVariants} className="text-center mb-[60px]">
        <h1 className="text-[32px] font-extrabold text-[#16161B] uppercase tracking-wide leading-none" style={{ fontFamily: 'var(--font-abhaya), serif' }}>
          WELCOME
        </h1>
        <p className="font-inter text-[14px] text-[#333333] font-medium uppercase tracking-wide mt-[8px]">
          LOGGED IN AS {name}
        </p>
      </motion.div>

      {/* 2. ACTION BUTTONS */}
      <div className="w-full max-w-[340px] flex flex-col gap-[24px]">
        
        {/* START SCANNING (Primary Action) */}
        <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} style={{ 
          background: 'linear-gradient(-45deg, #F74B33, #FFB6AB)', 
          padding: '2px', 
          borderRadius: '16px', 
          boxShadow: '4px 4px 10px rgba(247, 75, 51, 0.15)' 
        }}>
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/studio/scanner')}
            className="w-full bg-[#FFFFFF] rounded-[14px] flex flex-col items-center justify-center gap-[8px] py-[24px]"
          >
            <ScanLine size={32} color="#16161B" strokeWidth={2} />
            <span className="font-inter text-[16px] font-bold text-[#16161B] uppercase tracking-wide">
              START SCANNING
            </span>
          </motion.button>
        </motion.div>

        {/* VIEW DASHBOARD (Secondary Action) */}
        <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} style={{ 
          background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', 
          padding: '1px', 
          borderRadius: '16px', 
          boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.08)' 
        }}>
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/studio/dashboard/artist')}
            className="w-full bg-[#FFFFFF] rounded-[15px] flex flex-col items-center justify-center gap-[8px] py-[24px]"
          >
            <CalendarDays size={32} color="#16161B" strokeWidth={1.5} />
            <span className="font-inter text-[16px] font-normal text-[#16161B] uppercase tracking-wide">
              VIEW DASHBOARD
            </span>
          </motion.button>
        </motion.div>

      </div>

      {/* 3. FOOTER ACTION */}
      <motion.button 
        variants={itemVariants}
        whileTap={{ scale: 0.95 }}
        onClick={handleLogout}
        className="mt-auto flex items-center gap-2 font-inter text-[14px] font-medium text-[#666666] uppercase tracking-wide transition-opacity hover:text-[#F74B33]"
      >
        <LogOut size={16} /> LOG OUT
      </motion.button>

    </motion.div>
  );
}