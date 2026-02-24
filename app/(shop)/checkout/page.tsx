'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, setDoc, getDoc } from "firebase/firestore"; 
import { db } from "@/lib/firebase";

export default function Checkout() {
  const router = useRouter();
  
  // --- STATES ---
  const [cart, setCart] = useState<any[]>([]);
  const [step, setStep] = useState<'review' | 'upi_gateway'>('review');
  const [showDesigns, setShowDesigns] = useState(false);
  
  // Payment Logic States
  const [studioUpiId, setStudioUpiId] = useState("tattootattva@ybl"); 
  const [studioName, setStudioName] = useState("Tattoo Tattva");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // STRICT VERIFICATION STATES
  const [selectedUpiApp, setSelectedUpiApp] = useState<string | null>(null);
  const [utrNumber, setUtrNumber] = useState('');
  const [utrError, setUtrError] = useState('');

  // 1. Load Cart & Validate
  useEffect(() => {
    const savedCart = localStorage.getItem('tattoo_cart');
    if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (parsed.length === 0) router.push('/gallery');
        setCart(parsed);
    } else {
        router.push('/gallery');
    }
  }, [router]);

  // 2. Fetch Active UPI ID from Firebase
  useEffect(() => {
    const fetchPaymentDestination = async () => {
        try {
            const bankSnap = await getDoc(doc(db, 'studio_settings', 'payout_banks'));
            if (bankSnap.exists() && bankSnap.data().accounts) {
                const defaultBank = bankSnap.data().accounts.find((b: any) => b.isDefault);
                if (defaultBank && defaultBank.upiId) {
                    setStudioUpiId(defaultBank.upiId);
                    setStudioName(defaultBank.accountName);
                }
            }
        } catch (error) {
            console.error("Error fetching UPI details:", error);
        }
    };
    fetchPaymentDestination();
  }, []);

  // Safe Math Calculation
  const totalAmount = cart.reduce((sum, item) => {
      const priceVal = parseInt(String(item.price), 10);
      return sum + (isNaN(priceVal) ? 0 : priceVal);
  }, 0);

  const codes = cart.map(c => c.code);
  const titles = cart.map(c => c.title || c.code);

  // --- SPECIFIC APP INTENT GENERATOR ---
  const getUpiLink = (appName: string) => {
      const baseParams = `pa=${studioUpiId}&pn=${encodeURIComponent(studioName)}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent(`Codes: ${codes.join(', ')}`)}`;
      
      switch(appName) {
          case 'GPay': return `tez://upi/pay?${baseParams}`;
          case 'PhonePe': return `phonepe://pay?${baseParams}`;
          case 'Paytm': return `paytmmp://pay?${baseParams}`;
          case 'BHIM': return `upi://pay?${baseParams}`; 
          case 'RazorPay': return `upi://pay?${baseParams}`; 
          default: return `upi://pay?${baseParams}`;
      }
  };

  const handleUpiClick = (appName: string) => {
    setSelectedUpiApp(appName);
    setUtrError(''); 
    const link = document.createElement('a');
    link.href = getUpiLink(appName);
    link.target = "_top"; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePaymentSelect = (method: 'UPI' | 'CASH') => {
    if (method === 'UPI') {
        setStep('upi_gateway'); 
    } else {
        generateFinalTicket('PAY_AT_COUNTER'); 
    }
  };

  // --- STRICT VERIFICATION & TICKET GENERATION ---
  const verifyAndGenerateTicket = async () => {
    if (utrNumber.length < 12) {
        setUtrError('Please enter a valid 12-digit UTR/Reference ID.');
        return;
    }

    setIsGenerating(true);
    const ticketId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    
    try {
        await setDoc(doc(db, "tickets", ticketId), {
            items: cart.map((item) => ({
                id: item.id,
                code: item.code,
                title: item.title || 'Unknown'
            })),
            totalPrice: totalAmount.toString(),
            paymentMode: 'UPI',
            utrNumber: utrNumber, 
            paymentApp: selectedUpiApp,
            status: 'PAID',
            createdAt: new Date().toISOString(),
            valid: true
        });

        router.push(`/checkout/success?token_id=${ticketId}&status=PAID&title=${titles.join(', ')}&codes=${codes.join('-')}&price=${totalAmount}`);
    } catch (error) {
        console.error("Error:", error);
        setIsGenerating(false);
        alert("Failed to create ticket. Check connection.");
    }
  };

  const generateFinalTicket = async (status: 'PAY_AT_COUNTER') => {
    setIsGenerating(true);
    const ticketId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    
    try {
        await setDoc(doc(db, "tickets", ticketId), {
            items: cart.map((item) => ({
                id: item.id,
                code: item.code,
                title: item.title || 'Unknown'
            })),
            totalPrice: totalAmount.toString(),
            paymentMode: 'CASH',
            status: status,
            createdAt: new Date().toISOString(),
            valid: true
        });

        router.push(`/checkout/success?token_id=${ticketId}&status=${status}&title=${titles.join(', ')}&codes=${codes.join('-')}&price=${totalAmount}`);
    } catch (error) {
        console.error("Error:", error);
        setIsGenerating(false);
    }
  };

  // ANIMATION VARIANTS
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  return (
    <motion.div 
      initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={{ duration: 0.4 }}
      className="min-h-screen bg-[#FFFFFF] font-sans relative pb-[80px]"
    >
      
      {/* UNIFIED BRAND BACK BUTTON */}
      <div className="absolute top-[24px] left-[24px] z-50">
        <motion.button 
            whileTap={{ scale: 0.8, x: -5 }}
            onClick={() => {
                if(step === 'upi_gateway') setStep('review');
                else router.back();
            }} 
            className="p-2 -ml-2"
        >
            <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 1.5L2.5 9L13 16.5V1.5Z" fill="#16161B" stroke="#16161B" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
        </motion.button>
      </div>

      {/* 1. HEADER SECTION */}
      <div className="pt-[60px] pl-[24px] mb-[40px]">
          <h1 className="text-[40px] font-extrabold text-[#16161B] tracking-tight uppercase" style={{ fontFamily: 'var(--font-abhaya), serif', lineHeight: '1' }}>
              TATTOO<br/>TATTVA
          </h1>
      </div>

      <AnimatePresence mode="wait" custom={step === 'upi_gateway' ? 1 : -1}>
        
        {/* =========================================
            VIEW 1: REVIEW CART
            ========================================= */}
        {step === 'review' && (
            <motion.div 
                key="review" 
                custom={-1}
                variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                {/* ORDER SUMMARY CARD */}
                <motion.div 
                    layout
                    className="mx-[24px] mb-[40px] rounded-[9px]" 
                    style={{ background: 'linear-gradient(-45deg, #4F4F4F, #BDBDBD)', padding: '1px', filter: 'drop-shadow(4px 4px 10px rgba(0, 0, 0, 0.1))' }}
                >
                    <motion.div layout className="bg-[#FFFFFF] rounded-[8px] p-[16px] w-full flex flex-col">
                        
                        <div className="flex items-center gap-[8px] mb-[8px]">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#16161B" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7 18C5.9 18 5.01 18.9 5.01 20C5.01 21.1 5.9 22 7 22C8.1 22 9 21.1 9 20C9 18.9 8.1 18 7 18ZM1 2V4H3L6.6 11.59L5.24 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.28 15 7.17 14.89 7.17 14.75L7.2 14.63L8.1 13H15.55C16.3 13 16.96 12.59 17.3 11.97L20.88 5.51C20.96 5.34 21 5.17 21 5C21 4.45 20.55 4 20 4H5.21L4.27 2H1ZM17 18C15.9 18 15.01 18.9 15.01 20C15.01 21.1 15.9 22 17 22C18.1 22 19 21.1 19 20C19 18.9 18.1 18 17 18Z" />
                            </svg>
                            <span className="font-inter text-[16px] font-normal text-[#16161B]">Items in Cart-{cart.length}</span>
                        </div>

                        <div className="mb-[8px]">
                            <span className="font-inter text-[14px] font-normal text-[#16161B]">Code-{codes.join(', ')}</span>
                        </div>

                        <div className="mb-[8px]">
                            <span className="font-inter text-[20px] font-bold text-[#F74B33]">Total Cost- {totalAmount}/-</span>
                        </div>

                        <div className="flex items-center gap-[6px] cursor-pointer w-fit" onClick={() => setShowDesigns(!showDesigns)}>
                            <span className="font-inter text-[14px] font-normal text-[#16161B]">Check your Design</span>
                            <motion.div animate={{ rotate: showDesigns ? 180 : 0 }}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="#F74B33"><path d="M4 8L12 16L20 8H4Z"/></svg>
                            </motion.div>
                        </div>

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
                    </motion.div>
                </motion.div>

                {/* PAYMENT OPTION BUTTONS */}
                <div className="px-[24px] flex flex-col gap-[16px]">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handlePaymentSelect('UPI')} className="rounded-[10px] cursor-pointer transition-transform" style={{ background: 'linear-gradient(-45deg, #F74B33, #FFB6AB)', padding: '2px' }}>
                        <div className="bg-[#FFFFFF] rounded-[8px] py-[20px] px-[20px] flex justify-between items-center w-full h-full">
                            <div className="flex flex-col gap-[4px]">
                                 <span className="font-inter text-[18px] font-bold text-[#16161B]">Online Payment (UPI)</span>
                                 <span className="font-inter text-[13px] font-normal text-[#16161B]">GPay, PhonePe, Paytm, etc.</span>
                            </div>
                            <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 2L12 9L2 16V2Z" fill="#16161B"/>
                            </svg>
                        </div>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handlePaymentSelect('CASH')} className="rounded-[10px] cursor-pointer transition-transform" style={{ background: 'linear-gradient(-45deg, #4F4F4F, #BDBDBD)', padding: '2px' }}>
                        <div className="bg-[#FFFFFF] rounded-[8px] py-[20px] px-[20px] flex justify-between items-center w-full h-full">
                            <div className="flex flex-col gap-[4px]">
                                 <span className="font-inter text-[18px] font-bold text-[#16161B]">Pay Via Cash</span>
                                 <span className="font-inter text-[13px] font-normal text-[#16161B]">Pay at the studio counter</span>
                            </div>
                            {isGenerating ? <Loader2 className="animate-spin text-[#16161B]" size={18} /> : (
                                <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2 2L12 9L2 16V2Z" fill="#16161B"/>
                                </svg>
                            )}
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        )}

        {/* =========================================
            VIEW 2: SPECIFIC UPI APP SELECTION 
            ========================================= */}
        {step === 'upi_gateway' && (
            <motion.div 
                key="gateway" 
                custom={1}
                variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="px-[24px] flex flex-col"
            >
                <h2 className="text-[22px] font-bold text-[#16161B] font-inter leading-tight mb-6">Choose Payment App</h2>

                {/* Amount Display */}
                <div className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded-[12px] p-5 mb-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                        <span className="text-[14px] text-[#666666] font-inter">Paying To</span>
                        <span className="text-[15px] font-bold text-[#16161B] font-inter">{studioName}</span>
                    </div>
                    <div className="flex justify-between items-end">
                        <span className="text-[12px] text-[#666666] font-inter uppercase tracking-wide">Amount</span>
                        <span className="text-[32px] font-extrabold text-[#F74B33] font-inter leading-none">₹{totalAmount}</span>
                    </div>
                </div>

                {/* 1. APP SELECTION GRID */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    {['GPay', 'PhonePe', 'Paytm', 'RazorPay', 'BHIM'].map((app) => (
                        <motion.button 
                            key={app}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleUpiClick(app)}
                            className={`h-[56px] rounded-[12px] border font-bold text-[14px] flex items-center justify-center transition-all ${
                                selectedUpiApp === app 
                                ? 'bg-[#16161B] text-white border-[#16161B] shadow-lg' 
                                : 'bg-white text-[#16161B] border-[#EAEAEA] hover:border-[#F74B33]'
                            }`}
                        >
                            {app}
                        </motion.button>
                    ))}
                </div>

                {/* 2. STRICT VERIFICATION INPUT */}
                <div className="mb-6">
                    <label className="block text-[12px] font-bold text-[#16161B] uppercase mb-2">
                        Enter UPI Reference ID (UTR)
                    </label>
                    <input 
                        type="text" 
                        placeholder="e.g. 304512348901 (12 Digits)" 
                        value={utrNumber}
                        onChange={(e) => {
                            setUtrNumber(e.target.value.replace(/[^0-9]/g, ''));
                            setUtrError('');
                        }}
                        className="w-full h-[56px] bg-[#FAFAFA] border border-[#EAEAEA] rounded-[12px] px-4 text-[16px] font-inter focus:border-[#F74B33] outline-none tracking-widest font-bold"
                        maxLength={12}
                    />
                    {utrError && (
                        <div className="flex items-center gap-2 mt-2 text-red-500">
                            <AlertCircle size={14} />
                            <span className="text-[11px] font-bold">{utrError}</span>
                        </div>
                    )}
                    <p className="text-[10px] text-[#666666] mt-2 leading-snug">
                        *Strictly verify: You must enter the 12-digit transaction ID found in your payment app after paying.
                    </p>
                </div>

                {/* 3. VERIFY & GENERATE BUTTON */}
                <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={verifyAndGenerateTicket}
                    disabled={isGenerating || !selectedUpiApp}
                    className={`w-full h-[60px] rounded-[12px] font-bold text-[16px] flex items-center justify-center gap-2 transition-all uppercase tracking-wide border-2 ${
                        utrNumber.length >= 12
                          ? 'bg-[#F74B33] border-[#F74B33] text-white active:scale-95 shadow-[0_4px_15px_rgba(247,75,51,0.3)]' 
                          : 'bg-transparent border-[#EAEAEA] text-gray-400 opacity-60 cursor-not-allowed'
                    }`}
                >
                    {isGenerating ? <Loader2 className="animate-spin" /> : (
                        <>
                            <CheckCircle2 size={20} />
                            I HAVE PAID - GET TICKET
                        </>
                    )}
                </motion.button>

                <button onClick={() => setStep('review')} className="mt-6 text-center text-[13px] text-[#666666] underline font-inter w-full">
                    Cancel & Go Back
                </button>
            </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
}