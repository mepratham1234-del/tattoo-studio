'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import QRCode from 'react-qr-code';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MessageCircle, Send, Home } from 'lucide-react';

// --- FIXED: Explicitly typed as Variants to satisfy TypeScript compiler ---
const cardVariants: Variants = {
  hidden: { scale: 0.8, opacity: 0, y: 50 },
  visible: { 
      scale: 1, 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 200, damping: 20 }
  },
  exit: { scale: 0.9, opacity: 0, transition: { duration: 0.2 } }
};

function TicketContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Robust Parameter Parsing
  const titleParam = searchParams.get('title');
  const titles = titleParam ? titleParam.split(', ') : ['Custom Design'];
  
  const codeParam = searchParams.get('codes');
  const codes = codeParam ? codeParam.split('-') : ['0000'];
  
  const price = searchParams.get('price') || '0';
  const qrValue = searchParams.get('token_id') || searchParams.get('id') || '';
  
  // Initial Status
  const urlStatus = searchParams.get('status') || 'PAID';
  const [ticketStatus, setTicketStatus] = useState(urlStatus);

  const isCash = ticketStatus === 'PAY_AT_COUNTER' || ticketStatus === 'CASH';
  
  // View State
  const [viewState, setViewState] = useState<'TICKET' | 'PROMPT' | 'PHONE_INPUT'>('TICKET');
  const [phoneNumber, setPhoneNumber] = useState('');

  // 1. Live Listen
  useEffect(() => {
    if (!qrValue) return;

    // Try/Catch for audio to prevent browser policy errors
    try {
        const audio = new Audio('/sounds/ticket.mp3');
        audio.volume = 0.6;
        audio.play().catch((err) => console.log("Audio play prevented", err));
    } catch (e) {
        console.log("Audio not supported");
    }

    const unsub = onSnapshot(doc(db, "tickets", qrValue), (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        if (data.status) setTicketStatus(data.status);
        if (data.status === 'REDEEMED' && viewState === 'TICKET') {
            setViewState('PROMPT');
            localStorage.removeItem('tattoo_cart'); 
        }
      }
    });
    return () => unsub(); 
  }, [qrValue, viewState]);

  // 2. WhatsApp Logic
  const handleSendReceipt = () => {
      if(phoneNumber.length >= 10) {
          const message = encodeURIComponent(`Thank you for choosing Tattoo Tattva! 🖤\n\nDesign: ${titles.join(', ')}\nCode: ${codes.join(', ')}\nAmount Paid: ₹${price}`);
          window.open(`https://wa.me/91${phoneNumber}?text=${message}`, '_blank');
      }
      router.push('/');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans overflow-hidden relative">
      
      {/* Home Button */}
      {viewState === 'TICKET' && (
          <motion.button 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={() => router.push('/')} 
            className="absolute top-6 left-6 text-white/50 hover:text-white transition-colors z-50 flex items-center gap-2"
          >
            <Home size={24} />
            <span className="text-xs uppercase tracking-widest font-bold">Home</span>
          </motion.button>
      )}

      <AnimatePresence mode='wait'>
            
            {/* VIEW 1: THE TICKET */}
            {viewState === 'TICKET' && (
                <motion.div 
                    key="ticket-card"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    style={{ width: '350px', minHeight: '574px', backgroundColor: '#FFFFFF', position: 'relative', boxShadow: '0px 10px 40px rgba(255,255,255,0.1)' }}
                    className="flex flex-col items-center pb-8 rounded-[12px] overflow-hidden" 
                >
                    {/* Cutouts */}
                    <div className="absolute -top-[28px] -left-[28px] w-[56px] h-[56px] bg-black rounded-full z-20" />
                    <div className="absolute -top-[28px] -right-[28px] w-[56px] h-[56px] bg-black rounded-full z-20" />
                    <div className="absolute -bottom-[28px] -left-[28px] w-[56px] h-[56px] bg-black rounded-full z-20" />
                    <div className="absolute -bottom-[28px] -right-[28px] w-[56px] h-[56px] bg-black rounded-full z-20" />

                    <div className="w-full flex flex-col items-center pt-10">
                        <h1 style={{ fontFamily: 'var(--font-inter)', fontSize: '20px', fontWeight: 700, color: '#000000' }} className="mb-1">Ticket for your tattoo</h1>
                        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', fontWeight: 400, color: '#000000' }} className="mb-6">Show this at the counter</p>
                        <div style={{ width: '260px', height: '260px' }} className="bg-black flex items-center justify-center mb-8 relative">
                            <div className="bg-white p-2">
                                <QRCode value={qrValue} size={240} />
                            </div>
                        </div>
                    </div>

                    <div className="w-full relative flex items-center justify-center my-4 shrink-0">
                        <div className="absolute -left-[28px] w-[56px] h-[56px] bg-black rounded-full z-20" />
                        <div className="w-full" style={{ borderTop: '5px dashed #000000', margin: '0 30px' }} />
                        <div className="absolute -right-[28px] w-[56px] h-[56px] bg-black rounded-full z-20" />
                    </div>

                    <div className="w-full flex-1 flex flex-row justify-between items-start px-8 pt-2">
                        <div className="flex flex-col justify-center max-w-[140px]">
                            <h2 style={{ fontFamily: 'var(--font-inter)', fontSize: '17px', fontWeight: 700, color: '#000000' }} className="mb-3">Design details</h2>
                            <div className="flex flex-col gap-3">
                                {titles.map((title, i) => (
                                    <div key={i} className="leading-tight">
                                        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '10px', color: '#000000' }}>{i + 1}. Name - {title}</p>
                                        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '10px', color: '#000000' }}>&nbsp;&nbsp;&nbsp;&nbsp;Code - {codes[i] || '0000'}</p>
                                        {i === 0 && <p style={{ fontFamily: 'var(--font-inter)', fontSize: '10px', color: '#000000' }}>&nbsp;&nbsp;&nbsp;&nbsp;Amount - {price}/-</p>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Status Badge */}
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            style={{ 
                                width: '130px', 
                                height: '60px', 
                                borderRadius: '8px', 
                                marginTop: '25px', 
                                backgroundColor: isCash ? '#EAB308' : '#F74B33' 
                            }} 
                            className="flex items-center justify-center shrink-0 shadow-sm"
                        >
                            <span style={{ fontFamily: 'var(--font-inter)', fontSize: isCash ? '15px' : '25px', fontWeight: 700, color: '#FFFFFF', textAlign: 'center', lineHeight: '1.1' }} className="uppercase tracking-wide">
                                {isCash ? 'COLLECT CASH' : 'PAID'}
                            </span>
                        </motion.div>
                    </div>
                </motion.div>
            )}

            {/* VIEW 2: WHATSAPP PROMPT */}
            {viewState === 'PROMPT' && (
                <motion.div 
                    key="prompt-card"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-[90%] max-w-[350px] bg-white rounded-[24px] p-8 flex flex-col items-center text-center shadow-2xl"
                >
                    <div className="w-[60px] h-[60px] bg-[#25D366]/10 rounded-full flex items-center justify-center mb-4">
                        <MessageCircle size={32} color="#25D366" />
                    </div>
                    <h2 className="text-[22px] font-bold text-[#16161B] font-inter leading-tight mb-2">QR Verified!</h2>
                    <p className="text-[14px] text-[#666666] font-inter mb-8">Would you like a digital receipt sent directly to your WhatsApp?</p>
                    
                    <div className="w-full flex flex-col gap-3">
                        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setViewState('PHONE_INPUT')} className="w-full h-[52px] bg-[#25D366] text-white rounded-[12px] font-bold text-[15px] font-inter shadow-[0_4px_14px_rgba(37,211,102,0.3)]">
                            Yes, send receipt
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.97 }} onClick={() => router.push('/')} className="w-full h-[52px] bg-gray-100 text-[#666666] rounded-[12px] font-bold text-[15px] font-inter hover:bg-gray-200">
                            No, thanks
                        </motion.button>
                    </div>
                </motion.div>
            )}

            {/* VIEW 3: NUMBER INPUT */}
            {viewState === 'PHONE_INPUT' && (
                <motion.div 
                    key="phone-card"
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="w-[90%] max-w-[350px] bg-white rounded-[24px] p-8 flex flex-col items-center shadow-2xl"
                >
                    <h2 className="text-[18px] font-bold text-[#16161B] font-inter self-start mb-6">Enter WhatsApp Number</h2>
                    
                    <div className="w-full flex items-center h-[56px] border-2 border-gray-200 rounded-[12px] px-4 focus-within:border-[#25D366] transition-colors mb-6">
                        <span className="text-[#666666] font-bold text-[16px] mr-2">+91</span>
                        <input 
                            type="tel" 
                            maxLength={10}
                            placeholder="Enter 10 digit number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                            className="flex-1 bg-transparent outline-none text-[#16161B] text-[16px] font-bold tracking-wider"
                        />
                    </div>

                    <motion.button 
                        whileTap={{ scale: 0.97 }}
                        onClick={handleSendReceipt}
                        disabled={phoneNumber.length < 10}
                        className="w-full h-[52px] bg-[#25D366] text-white rounded-[12px] font-bold text-[15px] font-inter flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Send size={18} /> Send & Finish
                    </motion.button>
                </motion.div>
            )}

      </AnimatePresence>
    </div>
  );
}

export default function TicketPage() {
  return (<Suspense fallback={<div></div>}><TicketContent /></Suspense>);
}