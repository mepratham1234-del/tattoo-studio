'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShoppingCart, ChevronDown, Play, Loader2, Landmark, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, setDoc, getDoc } from "firebase/firestore"; 
import { db } from "@/lib/firebase";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // --- DATA FROM CART ---
  const ids = searchParams.get('id')?.split('-') || [];
  const codes = searchParams.get('codes')?.split('-') || [];
  const titles = searchParams.get('title')?.split(', ') || [];
  const price = searchParams.get('price') || '0';
  
  // --- DYNAMIC STUDIO UPI DETAILS ---
  const [studioUpiId, setStudioUpiId] = useState("tattootattva@ybl"); 
  const [studioName, setStudioName] = useState("Tattoo Tattva");
  const [isFetchingUpi, setIsFetchingUpi] = useState(true);

  // --- STATE ---
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'CASH'>('UPI');
  const [isDesignExpanded, setIsDesignExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<'SELECT' | 'UPI_GATEWAY'>('SELECT');
  const [hasClickedPay, setHasClickedPay] = useState(false);

  useEffect(() => {
    const fetchPaymentDestination = async () => {
        try {
            const artistId = searchParams.get('artistId') || localStorage.getItem('selectedArtistId');
            
            if (artistId) {
                const artistSnap = await getDoc(doc(db, 'artists', artistId));
                if (artistSnap.exists() && artistSnap.data().assignedUpiId) {
                    setStudioUpiId(artistSnap.data().assignedUpiId);
                    setStudioName(`${artistSnap.data().name} (Tattoo Tattva)`);
                    setIsFetchingUpi(false);
                    return; 
                }
            }
            
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
        } finally {
            setIsFetchingUpi(false);
        }
    };

    fetchPaymentDestination();
  }, [searchParams]);

  // Dynamic Intent URI
  const upiIntentLink = `upi://pay?pa=${studioUpiId}&pn=${encodeURIComponent(studioName)}&am=${price}&cu=INR&tn=${encodeURIComponent(`Design Codes: ${codes.join(', ')}`)}`;

  // --- HANDLERS ---
  const handleInitialConfirm = () => {
    if (selectedMethod === 'UPI') {
        setStep('UPI_GATEWAY'); 
    } else {
        generateFinalTicket('CASH'); 
    }
  };

  const generateFinalTicket = async (method: 'UPI' | 'CASH') => {
    setIsGenerating(true);
    const ticketId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    const finalStatus = method === 'UPI' ? 'PAID' : 'PAY_AT_COUNTER';
    
    try {
        await setDoc(doc(db, "tickets", ticketId), {
            items: ids.map((id, index) => ({
                id,
                code: codes[index] || '0000',
                title: titles[index] || 'Unknown'
            })),
            totalPrice: price,
            paymentMode: method,
            status: finalStatus,
            createdAt: new Date().toISOString(),
            valid: true
        });

        // ✅ FIX #2: Explicitly pass the 'status' parameter to the Success page URL!
        router.push(`/checkout/success?token_id=${ticketId}&status=${finalStatus}&title=${titles.join(', ')}&codes=${codes.join('-')}&price=${price}`);
    } catch (error) {
        console.error("Error:", error);
        setIsGenerating(false);
        alert("Failed to create ticket. Check connection.");
    }
  };

  // --- UI COMPONENTS ---
  const PaymentButton = ({ method, label, subtext, isActive }: { method: 'UPI' | 'CASH', label: string, subtext: string, isActive: boolean }) => (
    <button onClick={() => setSelectedMethod(method)} className="relative w-full h-[80px] rounded-[6px] transition-all duration-300 group">
        <div className="absolute inset-0 rounded-[6px]" style={{ background: isActive ? 'linear-gradient(225deg, #F74B33, #FFB6AB)' : 'linear-gradient(225deg, #A5A5A5, #FFFFFF)', padding: '2px' }}>
            <div className="w-full h-full bg-white rounded-[4px] flex items-center justify-between px-6 relative">
                <div className="text-left">
                    <h3 style={{ fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: '20px', color: '#19191B' }}>{label}</h3>
                    <p style={{ fontFamily: 'var(--font-inter)', fontWeight: 300, fontSize: '12px', color: '#19191B' }}>{subtext}</p>
                </div>
                <Play size={24} fill="#000000" className="text-black transform rotate-0" style={{ width: '42px', height: '42px' }} />
            </div>
        </div>
    </button>
  );

  if (isFetchingUpi) {
      return (
          <div className="min-h-screen bg-white flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-[#F74B33] mb-4" size={40} />
              <p className="font-inter text-[#666666] text-[14px] uppercase tracking-widest">Securing Payment Line...</p>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-white font-sans px-[15px] pt-[40px] pb-20">
      
      <header className="mb-[40px]">
        <h1 style={{ fontFamily: 'var(--font-abhaya)', fontWeight: 800, fontSize: '40px', color: '#19191B', lineHeight: 1 }}>
            TATTOO<br/>TATTVA
        </h1>
      </header>

      <AnimatePresence mode="wait">
          {step === 'SELECT' && (
              <motion.div key="select-view" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  
                  <section className="relative rounded-[6px] mb-[60px]" style={{ boxShadow: '4px 4px 10px rgba(0,0,0,0.1)' }}>
                    <div className="absolute inset-0 rounded-[6px]" style={{ background: 'linear-gradient(225deg, #A5A5A5, #FFFFFF)', padding: '1px' }} />
                    <div className="relative bg-white rounded-[5px] p-5">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 mb-1">
                                <ShoppingCart size={20} color="#19191B" />
                                <span style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', color: '#19191B' }}>Items in Cart-{ids.length}</span>
                            </div>
                            <p style={{ fontFamily: 'var(--font-inter)', fontWeight: 300, fontSize: '12px', color: '#19191B' }}>Code-{codes.join(', ')}</p>
                            <h2 style={{ fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: '20px', color: '#F74B33', marginTop: '4px' }}>Total Cost- ₹{price}/-</h2>

                            <div className="mt-2">
                                <button onClick={() => setIsDesignExpanded(!isDesignExpanded)} className="flex items-center gap-2 transition-opacity hover:opacity-70">
                                    <span style={{ fontFamily: 'var(--font-inter)', fontWeight: 300, fontSize: '12px', color: '#19191B' }}>Check your Design</span>
                                    <ChevronDown size={16} color="#F74B33" className={`transition-transform duration-300 ${isDesignExpanded ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {isDesignExpanded && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                            <div className="pt-3 pl-2 space-y-1 border-t border-gray-100 mt-2">
                                                {titles.map((t, i) => (
                                                    <p key={i} className="text-xs text-gray-500 font-inter">• {t} ({codes[i]})</p>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                  </section>

                  <section className="flex flex-col gap-[15px]">
                    <PaymentButton method="UPI" label="Phone Pe/UPI" subtext="Choose your preferred app" isActive={selectedMethod === 'UPI'} />
                    <PaymentButton method="CASH" label="Pay Via Cash" subtext="Pay at the studio counter" isActive={selectedMethod === 'CASH'} />
                  </section>

                  <div className="mt-10">
                      <button 
                        onClick={handleInitialConfirm}
                        disabled={isGenerating}
                        className="w-full h-[50px] bg-[#F74B33] text-white rounded-[6px] font-bold text-[16px] flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg uppercase tracking-wide"
                      >
                        {isGenerating ? <Loader2 className="animate-spin" /> : 'CONFIRM SELECTION'}
                      </button>
                  </div>
              </motion.div>
          )}

          {step === 'UPI_GATEWAY' && (
              <motion.div key="gateway-view" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
                  
                  <div className="flex items-center gap-2 mb-6">
                      <Landmark size={24} className="text-[#F74B33]" />
                      <h2 className="text-[22px] font-bold text-[#16161B] font-inter leading-tight">Secure Checkout</h2>
                  </div>

                  <div className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded-[12px] p-5 mb-8">
                      <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                          <span className="text-[14px] text-[#666666] font-inter">Paying To</span>
                          <span className="text-[15px] font-bold text-[#16161B] font-inter">{studioName}</span>
                      </div>
                      <div className="flex justify-between items-end mb-4">
                          <div className="flex flex-col">
                              <span className="text-[12px] text-[#666666] font-inter uppercase tracking-wide">Total Amount</span>
                              <span className="text-[32px] font-extrabold text-[#F74B33] font-inter leading-none mt-1">₹{price}</span>
                          </div>
                      </div>
                      <div className="bg-white p-3 rounded-[8px] border border-gray-100 flex items-start gap-2">
                          <AlertCircle size={16} className="text-gray-400 shrink-0 mt-0.5" />
                          <p className="text-[11px] text-gray-500 font-inter leading-relaxed">
                              Tap the button below to securely open your phone's UPI app. Once you complete the payment, return to this screen to generate your ticket.
                          </p>
                      </div>
                  </div>

                  {/* ✅ FIX #1: Replaced <a> tag with <button> utilizing window.location.href to bypass browser security blocks */}
                  <button 
                      onClick={() => {
                          setHasClickedPay(true);
                          window.location.href = upiIntentLink; 
                      }}
                      className="w-full h-[60px] bg-[#16161B] text-white rounded-[12px] font-bold text-[16px] flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg uppercase tracking-wide mb-4"
                  >
                      1. OPEN UPI APP TO PAY
                  </button>

                  <button 
                      onClick={() => generateFinalTicket('UPI')}
                      disabled={!hasClickedPay || isGenerating}
                      className={`w-full h-[60px] rounded-[12px] font-bold text-[16px] flex items-center justify-center gap-2 transition-all uppercase tracking-wide border-2 ${
                          hasClickedPay 
                            ? 'bg-[#F74B33] border-[#F74B33] text-white active:scale-95 shadow-[0_4px_15px_rgba(247,75,51,0.3)]' 
                            : 'bg-transparent border-[#EAEAEA] text-gray-400 opacity-60'
                      }`}
                  >
                      {isGenerating ? <Loader2 className="animate-spin" /> : (
                          <>
                              <CheckCircle2 size={20} />
                              2. I HAVE PAID - GET TICKET
                          </>
                      )}
                  </button>

                  <button onClick={() => setStep('SELECT')} className="mt-6 text-center text-[13px] text-[#666666] underline font-inter w-full">
                      Cancel & Go Back
                  </button>

              </motion.div>
          )}
      </AnimatePresence>

    </div>
  );
}

export default function PaymentPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="animate-spin text-black"/></div>}>
            <PaymentContent />
        </Suspense>
    );
}