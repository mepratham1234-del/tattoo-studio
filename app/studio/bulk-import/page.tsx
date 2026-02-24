'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, CheckCircle2, UploadCloud, ChevronLeft, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BulkImport() {
  const router = useRouter();
  
  const [p1Files, setP1Files] = useState<FileList | null>(null);
  const [p2Files, setP2Files] = useState<FileList | null>(null);
  
  const [status, setStatus] = useState('Waiting for files...');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  const handleBulkUpload = async () => {
    if (!p1Files || !p2Files) {
      setStatus("Error: Please select both sets of files first!");
      return;
    }

    setIsProcessing(true);
    setSuccessCount(0);
    setErrorCount(0);
    setStatus("Analyzing files...");

    const tattooMap: Record<string, any> = {};

    const parseFile = (file: File) => {
        const name = file.name.replace(/\.[^/.]+$/, ""); 
        const parts = name.split('-'); 
        if(parts.length >= 2) {
            return {
                code: parts[0].toUpperCase(),
                price: parts[1].replace(/[^0-9]/g, '')
            };
        }
        return null;
    };

    Array.from(p1Files).forEach(file => {
      const info = parseFile(file);
      if(info) {
        tattooMap[info.code] = {
          code: info.code,
          profile1: { price: info.price, ref: file.name }
        };
      }
    });

    Array.from(p2Files).forEach(file => {
      const info = parseFile(file);
      if(info) {
        if (tattooMap[info.code]) {
          tattooMap[info.code].profile2 = { price: info.price, ref: file.name };
        }
      }
    });

    setStatus("Syncing to Database...");
    let sCount = 0;
    let eCount = 0;
    const codes = Object.keys(tattooMap);
    
    for (const code of codes) {
        const data = tattooMap[code];
        if (data.profile1 && data.profile2) {
            try {
                await addDoc(collection(db, 'inventory'), {
                    code: data.code,
                    profile1: data.profile1,
                    profile2: data.profile2,
                    createdAt: serverTimestamp(),
                    source: 'bulk_import'
                });
                sCount++;
            } catch (err) {
                console.error(`Failed to upload ${code}`, err);
                eCount++;
            }
        }
    }

    setSuccessCount(sCount);
    setErrorCount(eCount);
    setStatus(sCount > 0 ? "Import Complete!" : "No matching pairs found.");
    setIsProcessing(false);
  };

  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-[#FFFFFF] font-sans px-[24px] pt-[40px] pb-[80px]"
    >
      
      {/* HEADER */}
      <header className="flex items-center mb-[40px]">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.back()} className="p-2 -ml-2 mr-[8px]">
          <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 1.5L2.5 9L13 16.5V1.5Z" fill="#16161B" stroke="#16161B" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </motion.button>
        <div className="flex flex-col">
            <h1 className="text-[24px] font-extrabold text-[#16161B] uppercase tracking-wide leading-none" style={{ fontFamily: 'var(--font-abhaya), serif' }}>
              BULK IMPORT
            </h1>
            <p className="font-inter text-[12px] text-[#666666] mt-1">Mass Upload Inventory</p>
        </div>
      </header>

      {/* UPLOAD CARD */}
      <motion.div 
        initial={{ scale: 0.95 }} animate={{ scale: 1 }}
        style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '16px', boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.08)' }}
      >
        <div className="bg-[#FFFFFF] rounded-[15px] p-[24px] w-full flex flex-col">
          
          <div className="flex flex-col gap-[24px]">
            
            {/* Input 1 */}
            <div>
                <label className="font-bold text-[12px] uppercase text-[#16161B] mb-[8px] block pl-1">1. Select Profile 1 Images</label>
                <div className="relative w-full h-[80px] border-2 border-dashed border-[#EAEAEA] rounded-[12px] bg-[#FAFAFA] flex flex-col items-center justify-center group overflow-hidden">
                    <input 
                        type="file" multiple accept="image/*"
                        onChange={(e) => setP1Files(e.target.files)}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    {p1Files ? (
                        <div className="flex items-center gap-2 text-[#22c55e]">
                            <CheckCircle2 size={20} />
                            <span className="font-inter text-[12px] font-bold">{p1Files.length} files selected</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-[#666666]">
                            <UploadCloud size={24} />
                            <span className="font-inter text-[10px] mt-1">Click to Browse</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Input 2 */}
            <div>
                <label className="font-bold text-[12px] uppercase text-[#16161B] mb-[8px] block pl-1">2. Select Profile 2 Images</label>
                <div className="relative w-full h-[80px] border-2 border-dashed border-[#EAEAEA] rounded-[12px] bg-[#FAFAFA] flex flex-col items-center justify-center group overflow-hidden">
                    <input 
                        type="file" multiple accept="image/*"
                        onChange={(e) => setP2Files(e.target.files)}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    {p2Files ? (
                        <div className="flex items-center gap-2 text-[#22c55e]">
                            <CheckCircle2 size={20} />
                            <span className="font-inter text-[12px] font-bold">{p2Files.length} files selected</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-[#666666]">
                            <UploadCloud size={24} />
                            <span className="font-inter text-[10px] mt-1">Click to Browse</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Button */}
            <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={handleBulkUpload}
                disabled={isProcessing || !p1Files || !p2Files}
                className="w-full h-[56px] bg-[#16161B] text-white font-bold rounded-[12px] uppercase tracking-wide flex items-center justify-center gap-2 mt-[8px] disabled:opacity-50 shadow-lg active:scale-95 transition-transform"
            >
                {isProcessing ? <Loader2 className="animate-spin" /> : 'Merge & Sync to Database'}
            </motion.button>

          </div>
        </div>
      </motion.div>

      {/* STATUS REPORT */}
      {(status !== 'Waiting for files...' || successCount > 0) && (
          <div className="mt-[32px] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className={`p-4 rounded-[12px] border ${successCount > 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <p className={`text-[14px] font-bold text-center ${successCount > 0 ? 'text-green-700' : 'text-[#666666]'}`}>
                    {status}
                </p>
                {successCount > 0 && (
                    <div className="mt-3 flex justify-center items-center gap-2">
                        <CheckCircle2 size={18} className="text-green-600" />
                        <span className="font-inter text-[14px] font-bold text-[#16161B]">{successCount} Designs Created</span>
                    </div>
                )}
                {errorCount > 0 && (
                    <div className="mt-2 flex justify-center items-center gap-2">
                        <AlertCircle size={18} className="text-red-500" />
                        <span className="font-inter text-[12px] font-medium text-red-500">{errorCount} Failures</span>
                    </div>
                )}
            </div>
          </div>
      )}

    </motion.div>
  );
}