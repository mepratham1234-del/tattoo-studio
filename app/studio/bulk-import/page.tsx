'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function BulkImport() {
  const [p1Files, setP1Files] = useState<FileList | null>(null);
  const [p2Files, setP2Files] = useState<FileList | null>(null);
  const [status, setStatus] = useState('Waiting for files...');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successCount, setSuccessCount] = useState(0);

  const handleBulkUpload = async () => {
    if (!p1Files || !p2Files) {
      setStatus("Error: Please select both sets of files first!");
      return;
    }

    setIsProcessing(true);
    setStatus("Matching files and extracting prices...");

    // This object will hold the paired data: { 'A04': { profile1: {...}, profile2: {...} } }
    const tattooMap: Record<string, any> = {};

    // 1. Process Profile 1 Files
    Array.from(p1Files).forEach(file => {
      const name = file.name.replace(/\.[^/.]+$/, ""); // Removes .png
      const parts = name.split('-'); // Splits "A04-1000"
      
      if(parts.length >= 2) {
        const code = parts[0].toUpperCase();
        const price = parts[1].replace(/[^0-9]/g, ''); // Extract only numbers
        tattooMap[code] = {
          code: code,
          profile1: { price: price, imageUrl: `/tattoos/profile1/${file.name}` }
        };
      }
    });

    // 2. Process Profile 2 Files & Pair them up
    Array.from(p2Files).forEach(file => {
      const name = file.name.replace(/\.[^/.]+$/, ""); 
      const parts = name.split('-'); 
      
      if(parts.length >= 2) {
        const code = parts[0].toUpperCase();
        const price = parts[1].replace(/[^0-9]/g, '');
        
        // If we found the matching Profile 1 code, add Profile 2 data to it
        if (tattooMap[code]) {
          tattooMap[code].profile2 = { price: price, imageUrl: `/tattoos/profile2/${file.name}` };
        }
      }
    });

    // 3. Blast to Firebase Database
    setStatus("Uploading to Firebase Database...");
    let count = 0;
    
    try {
      const codes = Object.keys(tattooMap);
      
      for (const code of codes) {
        const data = tattooMap[code];
        
        // Only upload if it successfully matched BOTH profiles
        if (data.profile1 && data.profile2) {
          await addDoc(collection(db, 'inventory'), {
            code: data.code,
            profile1: data.profile1,
            profile2: data.profile2,
            createdAt: new Date()
          });
          count++;
        }
      }
      
      setSuccessCount(count);
      setStatus(`Success!`);
    } catch (err) {
      console.error(err);
      setStatus("Database Error: Check your console.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-[24px] font-sans">
      <div className="bg-[#FFFFFF] p-[32px] rounded-[16px] shadow-[0_10px_30px_rgba(0,0,0,0.1)] w-full max-w-[500px]">
        
        <h1 className="text-[24px] font-extrabold text-[#16161B] uppercase mb-[24px]" style={{ fontFamily: 'var(--font-abhaya), serif' }}>
          Magic Bulk Importer
        </h1>

        <div className="flex flex-col gap-[20px]">
          {/* Input 1 */}
          <div className="bg-[#F5F5F5] p-[16px] rounded-[12px] border border-[#EAEAEA]">
            <label className="font-bold text-[12px] uppercase text-[#16161B] mb-[8px] block">1. Select ALL Profile 1 Images</label>
            <input 
              type="file" 
              multiple 
              accept="image/*"
              onChange={(e) => setP1Files(e.target.files)}
              className="text-[12px]"
            />
            {p1Files && <p className="text-[12px] text-green-600 mt-2 font-bold">{p1Files.length} files loaded</p>}
          </div>

          {/* Input 2 */}
          <div className="bg-[#F5F5F5] p-[16px] rounded-[12px] border border-[#EAEAEA]">
            <label className="font-bold text-[12px] uppercase text-[#16161B] mb-[8px] block">2. Select ALL Profile 2 Images</label>
            <input 
              type="file" 
              multiple 
              accept="image/*"
              onChange={(e) => setP2Files(e.target.files)}
              className="text-[12px]"
            />
            {p2Files && <p className="text-[12px] text-green-600 mt-2 font-bold">{p2Files.length} files loaded</p>}
          </div>

          {/* Action Button */}
          <button 
            onClick={handleBulkUpload}
            disabled={isProcessing || !p1Files || !p2Files}
            className="w-full h-[50px] bg-[#16161B] text-white font-bold rounded-[12px] uppercase tracking-wide flex items-center justify-center gap-2 mt-[12px] disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="animate-spin" /> : 'Merge & Sync to Firebase'}
          </button>

          {/* Status Output */}
          <div className="mt-[16px] text-center">
            <p className={`text-[14px] font-bold ${status === 'Success!' ? 'text-green-600' : 'text-[#666666]'}`}>
              {status}
            </p>
            {successCount > 0 && (
              <p className="text-[18px] font-extrabold text-[#16161B] mt-2 flex items-center justify-center gap-2">
                <CheckCircle2 color="#22c55e" />
                {successCount} Tattoos Synced!
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}