'use client';

import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ChevronLeft, ChevronRight, X, Loader2, ScanLine, Camera, Check } from 'lucide-react';

export default function ArtistScanner() {
  const [ticket, setTicket] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'verifying' | 'valid' | 'pending_cash' | 'active_session' | 'error'>('idle');
  const [index, setIndex] = useState(0);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // --- CAMERA LOGIC ---
  const startScanner = () => {
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      const scannerElement = document.getElementById("reader");
      if (scannerElement && !scannerRef.current) {
        const scanner = new Html5QrcodeScanner(
          "reader", 
          { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            videoConstraints: { facingMode: "environment" } 
          }, 
          false
        );
        scanner.render(async (text) => {
          setStatus('verifying');
          await scanner.clear(); 
          scannerRef.current = null;
          verifyTicket(text);
        }, (err) => console.warn(err));
        scannerRef.current = scanner;
      }
    }, 500);
  };

  useEffect(() => {
    startScanner();
    return () => { if (scannerRef.current) scannerRef.current.clear(); };
  }, []);

  async function verifyTicket(id: string) {
    try {
      const docSnap = await getDoc(doc(db, "tokens", id));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTicket({ ...data, id });
        // Determine initial state
        if (data.status === 'redeemed') setStatus('error');
        else if (data.status === 'paid' || data.paymentMode === 'PHONEPE_UPI') setStatus('valid');
        else setStatus('pending_cash');
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  }

  // --- CAROUSEL CONTROLS ---
  const images = ticket?.imageUrls || [];
  const ids = ticket?.designIds || [];
  const titles = ticket?.titles || [];
  
  const handleNext = () => setIndex((prev) => (prev + 1) % images.length);
  const handlePrev = () => setIndex((prev) => (prev - 1 + images.length) % images.length);

  const resetScanner = () => {
    setTicket(null);
    setIndex(0);
    setStatus('idle');
    startScanner();
  };

  // --- 1. ACTIVE SESSION SCREEN (Immersive Black) ---
  if (status === 'active_session') {
    return (
      <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-between p-6">
        {/* Top Bar */}
        <div className="w-full flex justify-between items-end border-b border-white/10 pb-4">
          <div>
            <h1 className="text-3xl font-serif text-white font-bold leading-none">SESSION<br/>ACTIVE</h1>
            <p className="text-[#720e1e] text-xs font-bold uppercase tracking-widest mt-2">DO NOT CLOSE</p>
          </div>
          <div className="text-right">
             <span className="text-4xl font-serif text-white">{index + 1}</span>
             <span className="text-zinc-500 text-lg font-serif">/{images.length}</span>
          </div>
        </div>

        {/* Main Artwork Display */}
        <div className="relative flex-1 w-full flex items-center justify-center my-4">
          <div className="bg-white/5 rounded-lg p-4 w-full h-full flex items-center justify-center border border-white/10">
            <img src={images[index]} className="max-w-full max-h-full object-contain filter drop-shadow-2xl" alt="Tattoo" />
          </div>

          {/* Floating Controls */}
          {images.length > 1 && (
             <div className="absolute inset-x-0 bottom-4 flex justify-center gap-6">
                <button onClick={handlePrev} className="p-4 bg-black border border-white/20 rounded-full text-white active:scale-90 transition-transform"><ChevronLeft /></button>
                <button onClick={handleNext} className="p-4 bg-black border border-white/20 rounded-full text-white active:scale-90 transition-transform"><ChevronRight /></button>
             </div>
          )}
        </div>

        {/* Info & Action */}
        <div className="w-full">
           <div className="mb-6">
             <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Current Design Code</p>
             <p className="text-3xl text-white font-serif">{ids[index]}</p>
             <p className="text-zinc-400 text-sm">{titles[index]}</p>
           </div>
           
           <button 
             onClick={resetScanner} 
             className="w-full bg-[#720e1e] text-white py-6 rounded-lg font-bold uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all shadow-[0_0_30px_rgba(114,14,30,0.4)]"
           >
             <X size={20} /> End Session
           </button>
        </div>
      </div>
    );
  }

  // --- 2. MAIN SCANNER UI ---
  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center font-sans">
      
      {/* Header */}
      <header className="w-full flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
        <h2 className="text-2xl font-serif font-bold">STUDIO<br/>ACCESS</h2>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#720e1e]">
          <div className="w-2 h-2 rounded-full bg-[#720e1e] animate-pulse"></div> Live
        </div>
      </header>

      {/* IDLE STATE: Camera View */}
      {status === 'idle' && (
        <div className="flex-1 w-full flex flex-col items-center justify-center">
           <div className="relative w-full aspect-square bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
              <div id="reader" className="w-full h-full object-cover"></div>
              {/* Overlay graphics */}
              <div className="absolute inset-0 border-[40px] border-black/50 pointer-events-none"></div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <ScanLine size={200} className="text-white/20 animate-pulse" strokeWidth={1} />
              </div>
           </div>
           <p className="mt-8 text-zinc-500 text-xs uppercase tracking-widest">Align QR Code within frame</p>
        </div>
      )}

      {/* LOADING STATE */}
      {status === 'verifying' && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 size={48} className="text-[#720e1e] animate-spin mb-4" />
          <p className="text-sm font-bold uppercase tracking-widest">Verifying Ticket...</p>
        </div>
      )}

      {/* PREVIEW STATE: White Card Result */}
      {(status === 'valid' || status === 'pending_cash') && (
        <div className="w-full flex-1 flex flex-col justify-center">
          <div className="bg-white text-black rounded-lg overflow-hidden shadow-2xl mb-6">
             {/* Image Preview */}
             <div className="aspect-square bg-zinc-100 relative flex items-center justify-center p-6">
                <img src={images[index]} className="max-w-full max-h-full object-contain mix-blend-multiply" alt="Preview" />
                
                {images.length > 1 && (
                  <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
                    {images.map((_: any, i: number) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === index ? 'bg-black w-4' : 'bg-zinc-300'}`} />
                    ))}
                  </div>
                )}

                {/* Navigation Arrows for Preview */}
                {images.length > 1 && (
                  <>
                    <button onClick={handlePrev} className="absolute left-2 p-2 rounded-full hover:bg-black/10 transition-colors"><ChevronLeft /></button>
                    <button onClick={handleNext} className="absolute right-2 p-2 rounded-full hover:bg-black/10 transition-colors"><ChevronRight /></button>
                  </>
                )}
             </div>

             {/* Details */}
             <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                   <div>
                      <h3 className="text-xl font-serif font-bold">{titles[index]}</h3>
                      <p className="text-zinc-500 text-xs uppercase tracking-wider font-medium">Code: {ids[index]}</p>
                   </div>
                   <div className="bg-black text-white px-3 py-1 text-xs font-bold rounded">
                      {index + 1}/{images.length}
                   </div>
                </div>

                <div className="mt-4 pt-4 border-t border-dashed border-zinc-200 flex justify-between items-center">
                    <span className="text-xs font-bold text-zinc-400 uppercase">Total Amount</span>
                    <span className="text-xl font-bold text-[#720e1e]">Rs. {ticket?.amount}</span>
                </div>
             </div>
          </div>

          {/* Action Button */}
          <button 
             onClick={status === 'pending_cash' ? () => updateDoc(doc(db, "tokens", ticket.id), {status: 'paid'}).then(() => setStatus('valid')) : () => setStatus('active_session')}
             className={`w-full py-5 rounded-lg font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all ${
               status === 'pending_cash' ? 'bg-[#720e1e] text-white' : 'bg-white text-black'
             }`}
          >
             {status === 'pending_cash' ? (
               <>Confirm Payment <Banknote size={18} /></>
             ) : (
               <>Start Session <Camera size={18} /></>
             )}
          </button>
        </div>
      )}

      {/* ERROR STATE */}
      {status === 'error' && (
         <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mb-6">
              <X size={40} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-serif font-bold mb-2">Invalid Ticket</h3>
            <p className="text-zinc-500 text-sm mb-8">This code has already been scanned or does not exist.</p>
            <button onClick={resetScanner} className="bg-white text-black px-8 py-3 rounded-lg font-bold uppercase tracking-widest text-xs">
              Scan Again
            </button>
         </div>
      )}
    </div>
  );
}

function Banknote({ size }: { size: number }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="12" x="2" y="6" rx="2" /><circle cx="12" cy="12" r="2" /><path d="M6 12h.01M18 12h.01" /></svg>;
}