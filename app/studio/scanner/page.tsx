'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ScanLine, CheckCircle2, X } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';

export default function QRScannerPage() {
  const router = useRouter();
  const [scannedData, setScannedData] = useState<{ id: string; amount: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Parse the QR code data (Format from our checkout: "TKT:TKT-1234|AMT:250")
  const handleScan = (text: string) => {
    if (text && !scannedData) {
      try {
        const parts = text.split('|');
        const id = parts[0].replace('TKT:', '');
        const amount = parts[1].replace('AMT:', '');
        setScannedData({ id, amount });
      } catch (error) {
        console.error("Invalid QR Code");
      }
    }
  };

  // Secret Demo Function for your Client Pitch
  const simulateScan = () => {
    handleScan('TKT:TKT-8492|AMT:450');
  };

  const handleAccept = () => {
    setIsProcessing(true);
    // Simulate API call to Firebase to mark ticket as used
    setTimeout(() => {
      setIsProcessing(false);
      setScannedData(null);
      // Optional: route back to dashboard or show success toast
      router.push('/studio/dashboard/artist'); 
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-sans relative overflow-hidden">
      
      {/* 1. TOP NAVIGATION HEADER */}
      <header className="pt-[40px] px-[24px] flex justify-between items-center relative z-10">
        <div className="flex items-center gap-[12px]">
          <button onClick={() => router.back()} className="p-1 -ml-1">
            <ChevronLeft size={24} color="#16161B" strokeWidth={2.5} />
          </button>
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

      {/* 3. CAMERA VIEWFINDER (Premium UI) */}
      <div className="mt-[32px] px-[32px] flex justify-center relative">
        {/* Active Red Glowing Gradient Border */}
        <div style={{
          background: 'linear-gradient(-45deg, #F74B33, #FFB6AB)',
          padding: '3px',
          borderRadius: '24px',
          boxShadow: '0px 10px 30px rgba(247, 75, 51, 0.25)',
          width: '100%',
          maxWidth: '300px',
          aspectRatio: '1/1',
          position: 'relative'
        }}>
          {/* Inner Camera Box */}
          <div className="bg-[#16161B] w-full h-full rounded-[21px] overflow-hidden relative shadow-inner flex items-center justify-center">
            
            {/* The Actual Camera Component */}
            {!scannedData && (
                <div className="absolute inset-0 opacity-80 mix-blend-screen">
                    <Scanner 
                        onScan={(result) => handleScan(result[0].rawValue)} 
                        formats={['qr_code']}
                        components={{ finder: false }} 
                    />
                </div>
            )}

            {/* Viewfinder Target Brackets (UI Polish) */}
            <div className="absolute inset-8 border-[2px] border-white/20 rounded-[12px]" />
            <div className="absolute top-6 left-6 w-8 h-8 border-t-[4px] border-l-[4px] border-[#F74B33] rounded-tl-[12px]" />
            <div className="absolute top-6 right-6 w-8 h-8 border-t-[4px] border-r-[4px] border-[#F74B33] rounded-tr-[12px]" />
            <div className="absolute bottom-6 left-6 w-8 h-8 border-b-[4px] border-l-[4px] border-[#F74B33] rounded-bl-[12px]" />
            <div className="absolute bottom-6 right-6 w-8 h-8 border-b-[4px] border-r-[4px] border-[#F74B33] rounded-br-[12px]" />

            {/* Scanning Laser Animation */}
            <motion.div 
              animate={{ y: [0, 200, 0] }} 
              transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
              className="absolute top-8 left-8 right-8 h-[2px] bg-[#F74B33] shadow-[0_0_15px_#F74B33]"
            />
          </div>
        </div>
      </div>

      {/* Secret Demo Button for Pitching (Tap the scanner icon to fake a scan) */}
      <div className="mt-[40px] flex justify-center">
        <button onClick={simulateScan} className="flex flex-col items-center gap-[8px] opacity-50 hover:opacity-100 transition-opacity">
          <ScanLine size={32} color="#16161B" />
          <span className="font-inter text-[10px] text-[#16161B] uppercase tracking-widest">Scanner Active</span>
        </button>
      </div>

      {/* 4. SUCCESS BOTTOM SHEET (Slides up when QR is detected) */}
      <AnimatePresence>
        {scannedData && (
          <>
            {/* Dark Overlay */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#16161B]/40 backdrop-blur-sm z-40"
              onClick={() => setScannedData(null)}
            />
            
            {/* The Ticket Details Sheet */}
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
                <button onClick={() => setScannedData(null)} className="p-2 bg-gray-100 rounded-full">
                  <X size={18} color="#16161B" />
                </button>
              </div>

              {/* Data Card (Matching the 1 Lakh Aesthetic) */}
              <div style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '12px' }} className="mb-[32px]">
                <div className="bg-[#FFFFFF] rounded-[11px] p-[20px] flex flex-col gap-[12px]">
                  <div className="flex justify-between items-center border-b border-[#EAEAEA] pb-[12px]">
                    <span className="font-inter text-[13px] text-[#666666]">Ticket ID</span>
                    <span className="font-inter text-[14px] font-bold text-[#16161B]">{scannedData.id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-inter text-[13px] text-[#666666]">Total Paid</span>
                    <span className="font-inter text-[20px] font-extrabold text-[#F74B33]">{scannedData.amount}/-</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={handleAccept}
                disabled={isProcessing}
                style={{ background: 'linear-gradient(-45deg, #F74B33, #FFB6AB)' }}
                className="w-full h-[56px] rounded-[12px] flex items-center justify-center shadow-[4px_4px_15px_rgba(247,75,51,0.3)] transition-transform active:scale-[0.98]"
              >
                <span className="font-inter font-bold text-[14px] text-[#FFFFFF] uppercase tracking-wide">
                  {isProcessing ? 'PROCESSING...' : 'ACCEPT & START SESSION'}
                </span>
              </button>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}