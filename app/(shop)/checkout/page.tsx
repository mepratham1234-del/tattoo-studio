'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, setDoc, getDoc } from "firebase/firestore"; 
import { db } from "@/lib/firebase";

export default function Checkout() {
  const router = useRouter();
  
  // States
  const [cart, setCart] = useState<any[]>([]);
  const [step, setStep] = useState<'review' | 'upi_gateway'>('review');
  const [showDesigns, setShowDesigns] = useState(false);
  
  // Database & Logic States
  const [studioUpiId, setStudioUpiId] = useState("tattootattva@ybl"); 
  const [studioName, setStudioName] = useState("Tattoo Tattva");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasClickedPay, setHasClickedPay] = useState(false);

  // 1. Load Cart
  useEffect(() => {
    const savedCart = localStorage.getItem('tattoo_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
    else router.push('/gallery');
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

  // Dynamic Deep Link
  const upiIntentLink = `upi://pay?pa=${studioUpiId}&pn=${encodeURIComponent(studioName)}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent(`Codes: ${codes.join(', ')}`)}`;

  // THE NUCLEAR DEEP LINK CLICKER (Bypasses Safari/Chrome Blocks)
  const handleUpiClick = () => {
    setHasClickedPay(true);
    const link = document.createElement('a');
    link.href = upiIntentLink;
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

  // Connects securely to database and formats the success URL perfectly
  const generateFinalTicket = async (status: 'PAID' | 'PAY_AT_COUNTER') => {
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
            paymentMode: status === 'PAID' ? 'UPI' : 'CASH',
            status: status,
            createdAt: new Date().toISOString(),
            valid: true
        });

        // Exact routing to Success Page with all needed data
        router.push(`/checkout/success?token_id=${ticketId}&status=${status}&title=${titles.join(', ')}&codes=${codes.join('-')}&price=${totalAmount}`);
    } catch (error) {
        console.error("Error:", error);
        setIsGenerating(false);
        alert("Failed to create ticket. Check connection.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-sans relative pb-[80px]">
      
      {/* UNIFIED BRAND BACK BUTTON (Fixes Issue 10) */}
      <div className="absolute top-[24px] left-[24px] z-50">
        <button onClick={() => router.back()} className="p-2 -ml-2 active:scale-90 transition-transform">
            <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 1.5L2.5 9L13 16.5V1.5Z" fill="#16161B" stroke="#16161B" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
        </button>
      </div>

      {/* 1. HEADER SECTION */}
      <div className="pt-[60px] pl-[24px] mb-[40px]">
          <h1 className="text-[40px] font-extrabold text-[#16161B] tracking-tight uppercase" style={{ fontFamily: 'var(--font-abhaya), serif', lineHeight: '1' }}>
              TATTOO<br/>TATTVA
          </h1>
      </div>

      <AnimatePresence mode="wait">
        
        {/* =========================================
            VIEW 1: REVIEW CART
            ========================================= */}
        {step === 'review' && (
            <motion.div key="review" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {/* ORDER SUMMARY CARD */}
                <div className="mx-[24px] mb-[40px] rounded-[9px]" style={{ background: 'linear-gradient(-45deg, #4F4F4F, #BDBDBD)', padding: '1px', filter: 'drop-shadow(4px 4px 10px rgba(0, 0, 0, 0.1))' }}>
                    <div className="bg-[#FFFFFF] rounded-[8px] p-[16px] w-full flex flex-col">
                        
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
                            <span className="font-inter text-[14px] font-normal text-[#16161B]">Check you Design</span>
                            <motion.svg animate={{ rotate: showDesigns ? 180 : 0 }} width="10" height="10" viewBox="0 0 24 24" fill="#F74B33">
                                <path d="M4 8L12 16L20 8H4Z"/>
                            </motion.svg>
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
                    </div>
                </div>

                {/* PAYMENT OPTION BUTTONS */}
                <div className="px-[24px] flex flex-col gap-[16px]">
                    {/* Option 1: Phone Pe/UPI */}
                    <div onClick={() => handlePaymentSelect('UPI')} className="rounded-[10px] cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform" style={{ background: 'linear-gradient(-45deg, #F74B33, #FFB6AB)', padding: '2px' }}>
                        <div className="bg-[#FFFFFF] rounded-[8px] py-[20px] px-[20px] flex justify-between items-center w-full h-full">
                            <div className="flex flex-col gap-[4px]">
                                 <span className="font-inter text-[18px] font-bold text-[#16161B]">Phone Pe/UPI</span>
                                 <span className="font-inter text-[13px] font-normal text-[#16161B]">Choose your preferred app</span>
                            </div>
                            <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 2L12 9L2 16V2Z" fill="#16161B"/>
                            </svg>
                        </div>
                    </div>

                    {/* Option 2: Pay Via Cash */}
                    <div onClick={() => handlePaymentSelect('CASH')} className="rounded-[10px] cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform" style={{ background: 'linear-gradient(-45deg, #4F4F4F, #BDBDBD)', padding: '2px' }}>
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
                    </div>
                </div>
            </motion.div>
        )}

        {/* =========================================
            VIEW 2: NATIVE UPI GATEWAY 
            ========================================= */}
        {step === 'upi_gateway' && (
            <motion.div key="gateway" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="px-[24px] flex flex-col">
                <h2 className="text-[22px] font-bold text-[#16161B] font-inter leading-tight mb-6">Secure Checkout</h2>

                <div className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded-[12px] p-5 mb-8 shadow-sm">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                        <span className="text-[14px] text-[#666666] font-inter">Paying To</span>
                        <span className="text-[15px] font-bold text-[#16161B] font-inter">{studioName}</span>
                    </div>
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-[12px] text-[#666666] font-inter uppercase tracking-wide">Total Amount</span>
                            <span className="text-[32px] font-extrabold text-[#F74B33] font-inter leading-none mt-1">₹{totalAmount}</span>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handleUpiClick}
                    className="w-full h-[60px] bg-[#16161B] text-white rounded-[12px] font-bold text-[16px] flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg uppercase tracking-wide mb-4"
                >
                    1. OPEN UPI APP TO PAY
                </button>

                <button 
                    onClick={() => generateFinalTicket('PAID')}
                    disabled={!hasClickedPay || isGenerating}
                    className={`w-full h-[60px] rounded-[12px] font-bold text-[16px] flex items-center justify-center gap-2 transition-all uppercase tracking-wide border-2 ${
                        hasClickedPay 
                          ? 'bg-[#F74B33] border-[#F74B33] text-white active:scale-95 shadow-[0_4px_15px_rgba(247,75,51,0.3)]' 
                          : 'bg-transparent border-[#EAEAEA] text-gray-400 opacity-60'
                    }`}
                >
                    {isGenerating ? <Loader2 className="animate-spin" /> : '2. I HAVE PAID - GET TICKET'}
                </button>

                <button onClick={() => setStep('review')} className="mt-8 text-center text-[13px] text-[#666666] underline font-inter w-full">
                    Cancel & Go Back
                </button>
            </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}