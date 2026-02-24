'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function CustomerLanding() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center px-[24px] pb-[80px]">
      
      {/* 1. ANIMATED LOGO SECTION 
          - Scales up from 0.8 to 1.0
          - Fades in smoothly over 0.8 seconds
      */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-[180px] h-[200px] relative mb-[8px] flex flex-col items-center justify-center"
      >
        <img 
          src="/logo.png" 
          alt="Tattoo Tattva Logo" 
          className="w-full h-full object-contain drop-shadow-xl" 
        />
      </motion.div>

      {/* 2. TEXT SECTION 
          - Delays by 0.3s so it appears AFTER the logo
          - Slides up from y:20 to y:0
      */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="text-center mb-[60px]"
      >
        <h1 
          className="text-[48px] font-extrabold text-[#16161B] leading-[0.95] tracking-tight mb-[16px] uppercase"
          style={{ fontFamily: 'var(--font-abhaya), serif' }}
        >
          TATTOO<br/>TATTVA
        </h1>
        <p className="font-inter text-[13px] text-[#16161B] font-medium uppercase tracking-[0.2em]">
          Pick Your Poison
        </p>
      </motion.div>

      {/* 3. ACTION BUTTON 
          - Delays by 0.6s
          - Adds Hover and Tap interactions for tactile feel
      */}
      <motion.button 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        whileHover={{ scale: 1.02, boxShadow: "0px 10px 25px rgba(247,75,51,0.4)" }}
        whileTap={{ scale: 0.96 }}
        onClick={() => router.push('/gallery')} 
        className="w-full max-w-[280px] h-[56px] bg-[#F74B33] rounded-[12px] flex items-center justify-center shadow-[0_8px_20px_rgba(247,75,51,0.3)] transition-shadow"
      >
        <span className="font-inter text-[14px] font-bold text-[#FFFFFF] uppercase tracking-wider">
          BROWSE DESIGNS
        </span>
      </motion.button>

    </div>
  );
}