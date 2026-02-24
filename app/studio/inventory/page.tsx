'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Trash2, Plus, Loader2, FileEdit } from 'lucide-react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';

// UI Helper
const GradientInput = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '12px' }}>
    <div className="bg-[#FFFFFF] rounded-[11px] overflow-hidden h-[42px] flex items-center">
      {children}
    </div>
  </div>
);

// Animation Variants
const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
};

export default function InventoryPage() {
  const router = useRouter();
  
  // Form State
  const [code, setCode] = useState('');
  const [price1, setPrice1] = useState(''); 
  const [price2, setPrice2] = useState(''); 
  
  // Database State
  const [inventory, setInventory] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // 1. FETCH INVENTORY
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const q = query(collection(db, 'inventory'), orderBy('createdAt', 'desc'));
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

  // 2. ADD ITEM TO DATABASE
  const handleAddItem = async () => {
    if (!code || !price1 || !price2) return;
    setIsAdding(true);
    
    try {
      const newItem = {
        code: code.toUpperCase(),
        profile1: { price: price1 },
        profile2: { price: price2 },
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'inventory'), newItem);
      
      // Update UI with animation
      setInventory([{ id: docRef.id, ...newItem }, ...inventory]);
      
      // Reset Form
      setCode(''); setPrice1(''); setPrice2('');
    } catch (error) {
      console.error("Error adding item:", error);
      alert("Failed to save to database.");
    } finally {
      setIsAdding(false);
    }
  };

  // 3. DELETE ITEM
  const handleDelete = async (id: string) => {
    if(!confirm("Delete this design from the database?")) return;

    const previous = [...inventory];
    setInventory(inventory.filter(i => i.id !== id)); 
    
    try {
      await deleteDoc(doc(db, 'inventory', id));
    } catch (error) {
      console.error("Delete failed", error);
      setInventory(previous); // Revert
      alert("Failed to delete.");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-[#FFFFFF] font-sans px-[24px] pt-[40px] pb-[80px]"
    >
        
        {/* HEADER */}
        <header className="flex items-center mb-[32px]">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.back()} className="p-2 -ml-2 mr-[8px]">
            <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 1.5L2.5 9L13 16.5V1.5Z" fill="#16161B" stroke="#16161B" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </motion.button>
          <div className="flex flex-col">
            <h1 className="text-[26px] font-extrabold text-[#16161B] uppercase tracking-wide leading-none" style={{ fontFamily: 'var(--font-abhaya), serif' }}>
                INVENTORY
            </h1>
            <p className="font-inter text-[12px] text-[#666666] mt-1">Manage Database Records</p>
          </div>
        </header>

        {/* ADD NEW DESIGN CARD */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}
          style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '16px', boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.08)' }} className="mb-[32px]"
        >
          <div className="bg-[#FFFFFF] rounded-[15px] p-[20px] w-full flex flex-col">
            
            <h2 className="font-inter text-[16px] font-bold text-[#16161B] mb-[20px] flex items-center gap-2">
                <FileEdit size={18} /> Add Design
            </h2>
            
            {/* Code Input */}
            <div className="mb-[20px]">
              <label className="text-[12px] text-[#666666] font-inter mb-[6px] block pl-[4px] uppercase tracking-wide">Design Code</label>
              <GradientInput>
                <input 
                    type="text" 
                    value={code} 
                    onChange={(e) => setCode(e.target.value.toUpperCase())} 
                    placeholder="e.g. A04" 
                    className="w-full h-full bg-transparent px-[16px] font-bold text-[#16161B] outline-none font-inter uppercase" 
                />
              </GradientInput>
            </div>

            {/* Pricing Inputs */}
            <div className="flex gap-[16px] mb-[24px]">
              <div className="flex-1 flex flex-col gap-[6px]">
                <label className="text-[10px] font-bold text-[#666666] font-inter uppercase tracking-wide pl-1">Profile 1 Price</label>
                <GradientInput>
                  <input type="number" value={price1} onChange={(e) => setPrice1(e.target.value)} placeholder="₹" className="w-full h-full bg-transparent px-[16px] font-bold text-[#16161B] outline-none" />
                </GradientInput>
              </div>

              <div className="flex-1 flex flex-col gap-[6px]">
                <label className="text-[10px] font-bold text-[#666666] font-inter uppercase tracking-wide pl-1">Profile 2 Price</label>
                <GradientInput>
                  <input type="number" value={price2} onChange={(e) => setPrice2(e.target.value)} placeholder="₹" className="w-full h-full bg-transparent px-[16px] font-bold text-[#16161B] outline-none" />
                </GradientInput>
              </div>
            </div>

            {/* Action Button */}
            <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={handleAddItem}
                disabled={!code || !price1 || !price2 || isAdding}
                style={{ background: code && price1 && price2 ? 'linear-gradient(-45deg, #F74B33, #FFB6AB)' : '#EAEAEA' }}
                className={`w-full h-[48px] rounded-full flex items-center justify-center gap-[8px] transition-all ${
                    code && price1 && price2 ? 'shadow-[0_4px_15px_rgba(247,75,51,0.25)]' : 'opacity-50 text-[#666666]'
                }`}
            >
                {isAdding ? <Loader2 className="animate-spin text-[#FFFFFF]" size={20} /> : (
                  <>
                    <Plus size={18} color={code && price1 && price2 ? "#FFFFFF" : "#666666"} /> 
                    <span className={`font-inter text-[14px] font-bold uppercase tracking-wide ${code && price1 && price2 ? 'text-[#FFFFFF]' : 'text-[#666666]'}`}>
                      ADD RECORD
                    </span>
                  </>
                )}
            </motion.button>
          </div>
        </motion.div>

        {/* LIST */}
        <h3 className="font-inter text-[14px] font-medium text-[#16161B] uppercase tracking-wide mb-[16px] border-b border-gray-200 pb-2">
          Database Records
        </h3>
        
        <motion.div 
          variants={listVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-[12px]"
        >
            <AnimatePresence mode='popLayout'>
            {isFetching ? (
              <div className="flex justify-center py-[40px]"><Loader2 className="animate-spin text-[#F74B33]" size={24} /></div>
            ) : inventory.length === 0 ? (
              <p className="text-center text-[12px] text-[#666666] py-[20px]">Database is empty.</p>
            ) : (
              inventory.map((item) => (
                  <motion.div 
                    layout
                    variants={itemVariants}
                    exit={{ scale: 0.9, opacity: 0 }}
                    key={item.id} 
                    style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '12px', boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.05)' }}
                  >
                    <div className="bg-[#FFFFFF] rounded-[11px] p-[16px] flex items-center justify-between">
                        <div className="flex items-center gap-[16px]">
                            <div className="flex flex-col">
                                <span className="text-[16px] font-extrabold text-[#16161B] font-inter uppercase">CODE: {item.code}</span>
                                <span className="text-[12px] text-[#666666] font-inter mt-[4px]">
                                  P1: <strong className="text-[#16161B]">₹{item.profile1?.price || 0}</strong> | P2: <strong className="text-[#16161B]">₹{item.profile2?.price || 0}</strong>
                                </span>
                            </div>
                        </div>
                        <motion.button 
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(item.id)} 
                          className="w-[36px] h-[36px] rounded-full flex items-center justify-center bg-[#F74B33]/10 text-[#F74B33] transition-transform"
                        >
                            <Trash2 size={16} strokeWidth={2} />
                        </motion.button>
                    </div>
                  </motion.div>
              ))
            )}
            </AnimatePresence>
        </motion.div>

    </motion.div>
  );
}