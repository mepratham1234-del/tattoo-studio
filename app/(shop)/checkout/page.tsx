'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react'; 
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Checkout() {
  const router = useRouter();
  const [cart, setCart] = useState<any[]>([]);
  const [step, setStep] = useState<'review' | 'ticket'>('review');
  const [ticketId, setTicketId] = useState('');
  const [showDesigns, setShowDesigns] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('tattoo_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
    else router.push('/gallery');
  }, [router]);

  // CRASH-PROOF MATH
  const totalAmount = cart.reduce((sum, item) => {
      const priceVal = parseInt(String(item.price), 10);
      return sum + (isNaN(priceVal) ? 0 : priceVal);
  }, 0);

  const handlePayment = () => {
    setTicketId(`TKT-${Math.floor(1000 + Math.random() * 9000)}`);
    localStorage.removeItem('tattoo_cart');
    setStep('ticket');
  };

  // --- REVIEW / PAYMENT SCREEN (PIXEL PERFECT TO MOCKUP) ---
  if (step === 'review') {
    return (
      <div className="min-h-screen bg-[#FFFFFF] font-sans relative pb-[80px]">
        
        {/* Hidden Back Button for easy navigation */}
        <button onClick={() => router.back()} className="absolute top-[24px] left-[24px] text-[#16161B] opacity-50 hover:opacity-100">
            <ArrowLeft size={24} />
        </button>

        {/* 1. HEADER SECTION */}
        <div className="pt-[60px] pl-[24px] mb-[40px]">
            <h1 className="text-[40px] font-extrabold text-[#16161B] tracking-tight uppercase" style={{ fontFamily: 'var(--font-abhaya), serif', lineHeight: '1' }}>
                TATTOO<br/>TATTVA
            </h1>
        </div>

        {/* 2. ORDER SUMMARY CARD */}
        <div className="mx-[24px] mb-[40px] rounded-[9px]" style={{
            background: 'linear-gradient(-45deg, #4F4F4F, #BDBDBD)',
            padding: '1px', // Creates the 1px gradient border
            filter: 'drop-shadow(4px 4px 10px rgba(0, 0, 0, 0.1))' // Elevated shadow
        }}>
            <div className="bg-[#FFFFFF] rounded-[8px] p-[16px] w-full flex flex-col">
                
                {/* Row 1: Cart Info */}
                <div className="flex items-center gap-[8px] mb-[8px]">
                    {/* Solid Shopping Cart Icon */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#16161B" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 18C5.9 18 5.01 18.9 5.01 20C5.01 21.1 5.9 22 7 22C8.1 22 9 21.1 9 20C9 18.9 8.1 18 7 18ZM1 2V4H3L6.6 11.59L5.24 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.28 15 7.17 14.89 7.17 14.75L7.2 14.63L8.1 13H15.55C16.3 13 16.96 12.59 17.3 11.97L20.88 5.51C20.96 5.34 21 5.17 21 5C21 4.45 20.55 4 20 4H5.21L4.27 2H1ZM17 18C15.9 18 15.01 18.9 15.01 20C15.01 21.1 15.9 22 17 22C18.1 22 19 21.1 19 20C19 18.9 18.1 18 17 18Z" />
                    </svg>
                    <span className="font-inter text-[16px] font-normal text-[#16161B]">Items in Cart-{cart.length}</span>
                </div>

                {/* Row 2: Code */}
                <div className="mb-[8px]">
                    <span className="font-inter text-[14px] font-normal text-[#16161B]">Code-{cart.map(c => c.code).join(', ')}</span>
                </div>

                {/* Row 3: Total Cost */}
                <div className="mb-[8px]">
                    <span className="font-inter text-[20px] font-bold text-[#F74B33]">Total Cost- {totalAmount}/-</span>
                </div>

                {/* Row 4: Check Design Toggle */}
                <div className="flex items-center gap-[6px] cursor-pointer w-fit" onClick={() => setShowDesigns(!showDesigns)}>
                    <span className="font-inter text-[14px] font-normal text-[#16161B]">Check you Design</span>
                    {/* Small Red Downward Triangle */}
                    <motion.svg animate={{ rotate: showDesigns ? 180 : 0 }} width="10" height="10" viewBox="0 0 24 24" fill="#F74B33">
                        <path d="M4 8L12 16L20 8H4Z"/>
                    </motion.svg>
                </div>

                {/* Hidden Designs Drawer */}
                <AnimatePresence>
                    {showDesigns && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="mt-[16px] pt-[16px] border-t border-gray-100 flex gap-[12px] overflow-x-auto no-scrollbar">
                                {cart.map((item, index) => (
                                    <div key={index} className="w-[64px] h-[64px] shrink-0 border border-gray-200 rounded-[8px] p-[4px] bg-white flex items-center justify-center">
                                        <img src={item.img} alt={item.code} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>

        {/* 3. PAYMENT OPTION BUTTONS */}
        <div className="px-[24px] flex flex-col gap-[16px]">
            
            {/* Option 1: Phone Pe/UPI (Active Red Gradient Border) */}
            <div onClick={handlePayment} className="rounded-[10px] cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform" style={{
                background: 'linear-gradient(-45deg, #F74B33, #FFB6AB)',
                padding: '2px', // 2px Border
            }}>
                <div className="bg-[#FFFFFF] rounded-[8px] py-[20px] px-[20px] flex justify-between items-center w-full h-full">
                    <div className="flex flex-col gap-[4px]">
                         <span className="font-inter text-[18px] font-bold text-[#16161B]">Phone Pe/UPI</span>
                         <span className="font-inter text-[13px] font-normal text-[#16161B]">Choose your preferred app</span>
                    </div>
                    {/* Solid Black Play Icon / Triangle */}
                    <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 2L12 9L2 16V2Z" fill="#16161B"/>
                    </svg>
                </div>
            </div>

            {/* Option 2: Pay Via Cash (Inactive Grey Gradient Border) */}
            <div onClick={handlePayment} className="rounded-[10px] cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform" style={{
                background: 'linear-gradient(-45deg, #4F4F4F, #BDBDBD)',
                padding: '2px', // 2px Border
            }}>
                <div className="bg-[#FFFFFF] rounded-[8px] py-[20px] px-[20px] flex justify-between items-center w-full h-full">
                    <div className="flex flex-col gap-[4px]">
                         <span className="font-inter text-[18px] font-bold text-[#16161B]">Pay Via Cash</span>
                         <span className="font-inter text-[13px] font-normal text-[#16161B]">Pay at the studio counter</span>
                    </div>
                    {/* Solid Black Play Icon / Triangle */}
                    <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 2L12 9L2 16V2Z" fill="#16161B"/>
                    </svg>
                </div>
            </div>

        </div>
      </div>
    );
  }

  // --- TICKET SCREEN (QR CODE PAGE - PIXEL PERFECT) ---
  return (
    <div className="min-h-screen bg-[#FFFFFF] p-[24px] flex flex-col items-center justify-center relative font-inter">
        
        {/* Optional Navigation */}
        <button onClick={() => router.push('/gallery')} className="absolute top-[24px] left-[24px] text-[#16161B] opacity-50 hover:opacity-100">
            <ArrowLeft size={24} />
        </button>

        {/* TICKET WRAPPER (Handles the 1px gradient border, shadow, and cutouts) */}
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-[360px] relative mt-[20px]" style={{ 
            filter: 'drop-shadow(4px 4px 10px rgba(0,0,0,0.15))' 
        }}>
            {/* Outer gradient background and cutout mask */}
            <div style={{
                background: 'linear-gradient(-45deg, #4F4F4F, #BDBDBD)',
                padding: '1px',
                borderRadius: '12px',
                // Webkit mask handles the two side semi-circle cutouts (12px radius) positioned at 130px from bottom
                WebkitMaskImage: 'radial-gradient(circle at 0 calc(100% - 130px), transparent 12px, black 12.5px), radial-gradient(circle at 100% calc(100% - 130px), transparent 12px, black 12.5px)',
                WebkitMaskComposite: 'source-in',
                maskImage: 'radial-gradient(circle at 0 calc(100% - 130px), transparent 12px, black 12.5px), radial-gradient(circle at 100% calc(100% - 130px), transparent 12px, black 12.5px)',
                maskComposite: 'intersect',
            }}>
                {/* Inner White Ticket Container */}
                <div className="bg-[#FFFFFF] rounded-[11px] flex flex-col">
                    
                    {/* Top Section */}
                    <div className="pt-[40px] px-[32px] pb-[32px] flex flex-col items-center">
                        <h2 className="font-inter font-extrabold text-[22px] text-[#16161B] mb-[32px] text-center">Ticket for your tattoo</h2>
                        
                        {/* QR Code Container (Fills width, aspect square) */}
                        <div className="w-[280px] h-[280px] max-w-full aspect-square bg-[#FFFFFF] flex items-center justify-center p-[8px]">
                            {/* We embed the actual dynamic QR Code here */}
                            <QRCodeSVG value={`TKT:${ticketId}|AMT:${totalAmount}`} size={280} width="100%" height="100%" bgColor="#FFFFFF" fgColor="#16161B" />
                        </div>
                    </div>

                    {/* Perforated Divider Line */}
                    <div className="w-full h-[4px]" style={{
                        // 4px thick, widely spaced (8px dash, 2px gap as requested)
                        backgroundImage: 'repeating-linear-gradient(to right, #16161B 0, #16161B 8px, transparent 8px, transparent 10px)',
                        backgroundPosition: 'center',
                        backgroundSize: '100% 4px',
                        backgroundRepeat: 'no-repeat'
                    }} />

                    {/* Bottom Section (Height ~130px to align perfectly with the mask cutouts) */}
                    <div className="px-[24px] py-[32px] flex justify-between items-start h-[130px]">
                        
                        {/* Design Details Block */}
                        <div className="flex flex-col">
                            <h3 className="font-inter font-extrabold text-[18px] text-[#16161B] mb-[8px]">Design details</h3>
                            <div className="font-inter font-normal text-[12px] text-[#16161B] leading-[20px]">
                                <p>Code - {cart.map(c => c.code).join(', ')}</p>
                                <p>Amount - {totalAmount}/-</p>
                            </div>
                        </div>
                        
                        {/* PAID Badge */}
                        <div className="bg-[#F74B33] rounded-[8px] px-[24px] py-[12px] mt-[4px]">
                            <span className="font-inter font-extrabold text-[26px] text-[#FFFFFF] tracking-[1px]">PAID</span>
                        </div>

                    </div>
                </div>
            </div>
        </motion.div>
        
    </div>
  );
}