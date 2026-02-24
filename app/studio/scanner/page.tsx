'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ScanLine, CheckCircle2, X, AlertCircle } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function QRScannerPage() {
  const router = useRouter();
  
  // State
  const [scannedData, setScannedData] = useState<{ id: string; amount: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [artistName, setArtistName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Get Logged In Artist Name
  useEffect(() => {
    const name = localStorage.getItem('studio_user_name');
    if (name) setArtistName(name);
    else {
        router.push('/studio');
    }
  }, [router]);

  // 2. Parse and Validate QR
  const handleScan = (text: string) => {
    if (text && !scannedData && !isProcessing) {
      if (text.includes('TKT:') && text.includes('AMT:')) {
          try {
            const parts = text.split('|');
            const id = parts[0].replace('TKT:', '');
            const amount = parts[1].replace('AMT:', '');
            setScannedData({ id, amount });
            setErrorMsg('');
          } catch (e) {
            setErrorMsg('Invalid QR Format');
          }
      } else {
          setScannedData({ id: text, amount: 'Unknown' });
      }
    }
  };

  // 3. DATABASE UPDATE
  const handleAccept = async () => {
    if (!scannedData || !artistName) return;
    
    setIsProcessing(true);
    try {
      const ticketRef = doc(db, 'tickets', scannedData.id);
      const ticketSnap = await getDoc(ticketRef);

      if (ticketSnap.exists()) {
          if (ticketSnap.data().status === 'REDEEMED') {
              setErrorMsg('Ticket already used!');
              setIsProcessing(false);
              return;
          }

          await updateDoc(ticketRef, {
              status: 'REDEEMED',
              scannedBy: artistName, 
              scannedAt: new Date().toISOString(), 
              redeemedAmount: scannedData.amount
          });

          router.push('/studio/dashboard/artist');
      } else {
          setErrorMsg('Ticket ID not found in database.');
          setIsProcessing(false);
      }
    } catch (error) {
      console.error("Scan Error:", error);
      setErrorMsg('Connection Failed. Try Again.');
      setIsProcessing(false);
    }
  };

  const simulateScan = () => {
    handleScan('TKT:TKT-DEMO|AMT:500');
  };

  return (
    <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="min-h-screen bg-[#FFFFFF] font-sans relative overflow-hidden"
    >
      
      {/* 1. TOP NAVIGATION HEADER */}
      <header className="pt-[40px] px-[24px] flex justify-between items-center relative z-10">
        <div className="flex items-center gap-[12px]">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.back()} className="p-2 -ml-2">
            <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 1.5L2.5 9L13 16.5V1.5Z" fill="#16161B" stroke="#16161B" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </motion.button>
          <h1 className="text-[24px] font-extrabold text-[#16161B] uppercase leading-none" style={{ fontFamily: 'var(--font-abhaya), serif' }}>
            SCAN TICKET
          </h1>
        </div>
      </header>

      {/* 2. INSTRUCTION TEXT */}
      <div className="mt-[40px] px-[24px] text-center">
        <p className="font-inter text-[14px] text-[#666666] font-medium uppercase tracking-widest">
          Align QR Code within frame
        </p>
      </div>

      {/* 3. CAMERA VIEWFINDER */}
      <div className="mt-[32px] px-[32px] flex justify-center relative">
        <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            style={{
                background: 'linear-gradient(-45deg, #F74B33, #FFB6AB)',
                padding: '3px',
                borderRadius: '24px',
                boxShadow: '0px 10px 30px rgba(247, 75, 51, 0.25)',
                width: '100%', maxWidth: '300px', aspectRatio: '1/1', position: 'relative'
            }}
        >
          <div className="bg-[#16161B] w-full h-full rounded-[21px] overflow-hidden relative shadow-inner flex items-center justify-center">
            
            {/* The Actual Camera Component */}
            {!scannedData && (
                <div className="absolute inset-0 opacity-80 mix-blend-screen">
                    <Scanner 
                        onScan={(result) => {
                            if(result && result[0]) handleScan(result[0].rawValue);
                        }} 
                        formats={['qr_code']}
                        components={{ finder: false }} 
                    />
                </div>
            )}

            {/* Viewfinder Target Brackets */}
            <div className="absolute inset-8 border-[2px] border-white/20 rounded-[12px]" />
            <div className="absolute top-6 left-6 w-8 h-8 border-t-[4px] border-l-[4px] border-[#F74B33] rounded-tl-[12px]" />
            <div className="absolute top-6 right-6 w-8 h-8 border-t-[4px] border-r-[4px] border-[#F74B33] rounded-tr-[12px]" />
            <div className="absolute bottom-6 left-6 w-8 h-8 border-b-[4px] border-l-[4px] border-[#F74B33] rounded-bl-[12px]" />
            <div className="absolute bottom-6 right-6 w-8 h-8 border-b-[4px] border-r-[4px] border-[#F74B33] rounded-br-[12px]" />

            {/* Scanning Laser Animation */}
            <motion.div 
              animate={{ top: ["10%", "90%", "10%"] }} 
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute left-8 right-8 h-[2px] bg-[#F74B33] shadow-[0_0_20px_#F74B33]"
            />
          </div>
        </motion.div>
      </div>

      {/* Secret Demo Button */}
      <div className="mt-[40px] flex justify-center">
        <motion.button whileTap={{ scale: 0.9 }} onClick={simulateScan} className="flex flex-col items-center gap-[8px] opacity-50 hover:opacity-100 transition-opacity">
          <ScanLine size={32} color="#16161B" />
          <span className="font-inter text-[10px] text-[#16161B] uppercase tracking-widest">Tap to Test</span>
        </motion.button>
      </div>

      {/* 4. SUCCESS BOTTOM SHEET */}
      <AnimatePresence>
        {scannedData && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#16161B]/40 backdrop-blur-sm z-40"
              onClick={() => setScannedData(null)}
            />
            
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] rounded-t-[24px] z-50 px-[24px] py-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
            >
              <div className="flex justify-between items-start mb-[24px]">
                <div className="flex items-center gap-[12px]">
                  <div className="w-[40px] h-[40px] rounded-full bg-[#F74B33]/10 flex items-center justify-center">
                    <CheckCircle2 size={24} color="#F74B33" />
                  </div>
                  <div>
                    <h3 className="font-inter font-extrabold text-[18px] text-[#16161B]">TICKET VERIFIED</h3>
                    <p className="font-inter font-medium text-[12px] text-[#22c55e] uppercase tracking-wider">Ready for Session</p>
                  </div>
                </div>
                <button onClick={() => setScannedData(null)} className="p-2 bg-gray-100 rounded-full active:scale-90 transition-transform">
                  <X size={18} color="#16161B" />
                </button>
              </div>

              {/* Data Card */}
              <div style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '12px' }} className="mb-[24px]">
                <div className="bg-[#FFFFFF] rounded-[11px] p-[20px] flex flex-col gap-[12px]">
                  <div className="flex justify-between items-center border-b border-[#EAEAEA] pb-[12px]">
                    <span className="font-inter text-[13px] text-[#666666]">Ticket ID</span>
                    <span className="font-inter text-[14px] font-bold text-[#16161B]">{scannedData.id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-inter text-[13px] text-[#666666]">Total Paid</span>
                    <span className="font-inter text-[20px] font-extrabold text-[#F74B33]">₹{scannedData.amount}</span>
                  </div>
                </div>
              </div>

              {errorMsg && (
                  <div className="mb-[24px] p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2">
                      <AlertCircle size={16} className="text-red-500" />
                      <p className="text-red-500 text-[12px] font-bold">{errorMsg}</p>
                  </div>
              )}

              {/* Action Button */}
              <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={handleAccept}
                disabled={isProcessing}
                style={{ background: 'linear-gradient(-45deg, #F74B33, #FFB6AB)' }}
                className="w-full h-[56px] rounded-[12px] flex items-center justify-center shadow-[4px_4px_15px_rgba(247,75,51,0.3)] disabled:opacity-50"
              >
                {isProcessing ? (
                    <span className="font-inter font-bold text-[14px] text-[#FFFFFF] uppercase tracking-wide">SYNCING...</span>
                ) : (
                    <span className="font-inter font-bold text-[14px] text-[#FFFFFF] uppercase tracking-wide">ACCEPT & START SESSION</span>
                )}
              </motion.button>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </motion.div>
  );
}