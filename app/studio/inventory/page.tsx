'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Trash2, Plus, Loader2 } from 'lucide-react';

// FIREBASE IMPORTS
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query } from 'firebase/firestore';

export default function InventoryPage() {
  const router = useRouter();
  
  // Shared Code
  const [code, setCode] = useState('');

  // Profile 1 State
  const [price1, setPrice1] = useState(''); 
  const [image1, setImage1] = useState<string | null>(null);

  // Profile 2 State
  const [price2, setPrice2] = useState(''); 
  const [image2, setImage2] = useState<string | null>(null);

  // Database State
  const [inventory, setInventory] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // 1. FETCH INVENTORY FROM CLOUD
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const q = query(collection(db, 'inventory'));
        const querySnapshot = await getDocs(q);
        
        const fetchedItems: any[] = [];
        querySnapshot.forEach((doc) => {
          fetchedItems.push({ id: doc.id, ...doc.data() });
        });
        
        setInventory(fetchedItems);
      } catch (error) {
        console.error("Error fetching inventory:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchInventory();
  }, []);

  // 2. MAGIC AUTO-FILL FOR SPECIFIC PROFILES
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, profile: 1 | 2) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      
      // Parse "A04-1000.png"
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, ""); 
      const parts = fileNameWithoutExt.split('-'); 

      if (profile === 1) {
        setImage1(previewUrl);
        if (parts.length >= 2) {
          if (!code) setCode(parts[0].toUpperCase()); // Only set if empty
          setPrice1(parts[1].replace(/[^0-9]/g, ''));
        }
      } else {
        setImage2(previewUrl);
        if (parts.length >= 2) {
          if (!code) setCode(parts[0].toUpperCase()); // Only set if empty
          setPrice2(parts[1].replace(/[^0-9]/g, ''));
        }
      }
    }
  };

  // 3. ADD DUAL-PROFILE ITEM TO FIREBASE
  const handleAddItem = async () => {
    if (!code || !price1 || !price2) return;
    setIsAdding(true);
    
    try {
      const docRef = await addDoc(collection(db, 'inventory'), {
        code: code,
        profile1: { price: price1, imageRef: "local_for_now_1" }, // Will upgrade to Cloud Storage later
        profile2: { price: price2, imageRef: "local_for_now_2" },
        createdAt: new Date()
      });
      
      setInventory([{ id: docRef.id, code, profile1: { price: price1 }, profile2: { price: price2 } }, ...inventory]);
      
      // Reset Form
      setCode(''); setPrice1(''); setPrice2(''); setImage1(null); setImage2(null);
    } catch (error) {
      console.error("Error adding item:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    const previous = [...inventory];
    setInventory(inventory.filter(i => i.id !== id)); 
    try {
      await deleteDoc(doc(db, 'inventory', id));
    } catch (error) {
      setInventory(previous); 
    }
  };

  const GradientInput = ({ children }: { children: React.ReactNode }) => (
    <div style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '12px' }}>
      <div className="bg-[#FFFFFF] rounded-[11px] overflow-hidden h-[42px] flex items-center">
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-sans px-[24px] pt-[40px] pb-[80px]">
        
        {/* HEADER */}
        <header className="flex items-center mb-[32px]">
          <button onClick={() => router.back()} className="p-2 -ml-2 mr-[8px] active:scale-90 transition-transform">
            <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 1.5L2.5 9L13 16.5V1.5Z" fill="#16161B" stroke="#16161B" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="text-[26px] font-extrabold text-[#16161B] uppercase tracking-wide leading-none" style={{ fontFamily: 'var(--font-abhaya), serif' }}>
            INVENTORY
          </h1>
        </header>

        {/* ADD NEW DESIGN CARD */}
        <div style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '16px', boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.08)' }} className="mb-[32px]">
          <div className="bg-[#FFFFFF] rounded-[15px] p-[20px] w-full flex flex-col">
            
            <h2 className="font-inter text-[16px] font-bold text-[#16161B] mb-[20px]">Add Dual-Profile Design</h2>
            
            {/* Master Code Input */}
            <div className="mb-[20px]">
              <label className="text-[12px] text-[#666666] font-inter mb-[6px] block pl-[4px] uppercase tracking-wide">Master Tattoo Code</label>
              <GradientInput>
                <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. A04" className="w-full h-full bg-transparent px-[16px] font-bold text-[#16161B] outline-none font-inter uppercase" />
              </GradientInput>
            </div>

            {/* DUAL UPLOAD GRID */}
            <div className="flex gap-[16px] mb-[24px]">
              
              {/* PROFILE 1 COLUMN */}
              <div className="flex-1 flex flex-col gap-[12px]">
                <label className="text-[10px] font-bold text-[#16161B] font-inter uppercase tracking-wide text-center">Profile 1 Asset</label>
                <div className="w-full h-[120px] border-2 border-dashed border-[#EAEAEA] rounded-[12px] flex flex-col items-center justify-center bg-[#FAFAFA] relative overflow-hidden group cursor-pointer">
                    {image1 ? <img src={image1} className="w-full h-full object-contain mix-blend-multiply" alt="P1" /> : (
                        <div className="flex flex-col items-center gap-[4px] text-[#666666]"><Upload size={20} /><span className="text-[10px]">Upload</span></div>
                    )}
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 1)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    {image1 && <button onClick={(e) => {e.preventDefault(); setImage1(null);}} className="absolute top-[4px] right-[4px] bg-[#FFFFFF] shadow-md p-[4px] rounded-full text-[#F74B33] z-20"><Trash2 size={12} /></button>}
                </div>
                <GradientInput>
                  <input type="number" value={price1} onChange={(e) => setPrice1(e.target.value)} placeholder="Price ₹" className="w-full h-full bg-transparent px-[8px] text-center font-bold text-[#16161B] outline-none text-[14px]" />
                </GradientInput>
              </div>

              {/* PROFILE 2 COLUMN */}
              <div className="flex-1 flex flex-col gap-[12px]">
                <label className="text-[10px] font-bold text-[#16161B] font-inter uppercase tracking-wide text-center">Profile 2 Asset</label>
                <div className="w-full h-[120px] border-2 border-dashed border-[#EAEAEA] rounded-[12px] flex flex-col items-center justify-center bg-[#FAFAFA] relative overflow-hidden group cursor-pointer">
                    {image2 ? <img src={image2} className="w-full h-full object-contain mix-blend-multiply" alt="P2" /> : (
                        <div className="flex flex-col items-center gap-[4px] text-[#666666]"><Upload size={20} /><span className="text-[10px]">Upload</span></div>
                    )}
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 2)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    {image2 && <button onClick={(e) => {e.preventDefault(); setImage2(null);}} className="absolute top-[4px] right-[4px] bg-[#FFFFFF] shadow-md p-[4px] rounded-full text-[#F74B33] z-20"><Trash2 size={12} /></button>}
                </div>
                <GradientInput>
                  <input type="number" value={price2} onChange={(e) => setPrice2(e.target.value)} placeholder="Price ₹" className="w-full h-full bg-transparent px-[8px] text-center font-bold text-[#16161B] outline-none text-[14px]" />
                </GradientInput>
              </div>

            </div>

            {/* Action Button */}
            <button 
                onClick={handleAddItem}
                disabled={!code || !price1 || !price2 || !image1 || !image2 || isAdding}
                style={{ background: code && price1 && price2 && image1 && image2 ? 'linear-gradient(-45deg, #F74B33, #FFB6AB)' : '#EAEAEA' }}
                className={`w-full h-[48px] rounded-full flex items-center justify-center gap-[8px] transition-all ${
                    code && price1 && price2 && image1 && image2 ? 'shadow-[0_4px_15px_rgba(247,75,51,0.25)] active:scale-[0.98]' : 'opacity-50 text-[#666666]'
                }`}
            >
                {isAdding ? <Loader2 className="animate-spin text-[#FFFFFF]" size={20} /> : (
                  <>
                    <Plus size={18} color={code && price1 && price2 && image1 && image2 ? "#FFFFFF" : "#666666"} /> 
                    <span className={`font-inter text-[14px] font-bold uppercase tracking-wide ${code && price1 && price2 && image1 && image2 ? 'text-[#FFFFFF]' : 'text-[#666666]'}`}>
                      ADD TO INVENTORY
                    </span>
                  </>
                )}
            </button>
          </div>
        </div>

        {/* CURRENT INVENTORY LIST */}
        <h3 className="font-inter text-[14px] font-medium text-[#16161B] uppercase tracking-wide mb-[16px]">
          CURRENT INVENTORY
        </h3>
        
        <div className="flex flex-col gap-[12px]">
            {isFetching ? (
              <div className="flex justify-center py-[40px]"><Loader2 className="animate-spin text-[#F74B33]" size={24} /></div>
            ) : inventory.length === 0 ? (
              <p className="text-center text-[12px] text-[#666666] py-[20px]">No designs in database.</p>
            ) : (
              inventory.map((item) => (
                  <div key={item.id} style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '12px', boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.05)' }}>
                    <div className="bg-[#FFFFFF] rounded-[11px] p-[16px] flex items-center justify-between">
                        <div className="flex items-center gap-[16px]">
                            <div className="flex flex-col">
                                <span className="text-[16px] font-extrabold text-[#16161B] font-inter uppercase">CODE: {item.code}</span>
                                <span className="text-[12px] text-[#666666] font-inter mt-[4px]">
                                  P1: <strong className="text-[#16161B]">₹{item.profile1?.price || 0}</strong> | P2: <strong className="text-[#16161B]">₹{item.profile2?.price || 0}</strong>
                                </span>
                            </div>
                        </div>
                        <button onClick={() => handleDelete(item.id)} className="w-[36px] h-[36px] rounded-full flex items-center justify-center bg-[#F74B33]/10 text-[#F74B33] active:scale-95 transition-transform">
                            <Trash2 size={16} strokeWidth={2} />
                        </button>
                    </div>
                  </div>
              ))
            )}
        </div>

    </div>
  );
}