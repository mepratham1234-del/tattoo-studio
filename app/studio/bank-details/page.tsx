'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Landmark, ShieldCheck, Plus, Trash2, CheckCircle2, QrCode } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';

interface BankAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  upiId: string; 
  isDefault: boolean;
}

const GradientInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '9999px' }}>
    <div className="bg-[#FFFFFF] rounded-full overflow-hidden h-[48px] flex items-center">
      {children}
    </div>
  </div>
);

export default function BankDetailsPage() {
  const router = useRouter();

  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [upiId, setUpiId] = useState(''); 

  // 1. FETCH BANKS
  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        const docRef = doc(db, 'studio_settings', 'payout_banks');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().accounts) {
          setAccounts(docSnap.data().accounts);
        }
      } catch (error) {
        console.error("Error fetching bank details:", error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchBankDetails();
  }, []);

  // 2. ADD NEW BANK
  const handleAddAccount = async () => {
    if (!accountName || !accountNumber || !ifscCode || !bankName || !upiId) return;
    setIsSaving(true);

    const newAccount: BankAccount = {
      id: Date.now().toString(),
      accountName,
      accountNumber,
      ifscCode: ifscCode.toUpperCase(),
      bankName,
      upiId: upiId.toLowerCase(),
      isDefault: accounts.length === 0 
    };

    const updatedAccounts = [...accounts, newAccount];

    try {
      await setDoc(doc(db, 'studio_settings', 'payout_banks'), {
        accounts: updatedAccounts,
        updatedAt: new Date().toISOString()
      });

      setAccounts(updatedAccounts);
      setAccountName('');
      setAccountNumber('');
      setIfscCode('');
      setBankName('');
      setUpiId('');
      setIsAddingMode(false);
    } catch (error) {
      console.error("Error saving bank detail:", error);
      alert("Failed to save. Please check your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  // 3. SET DEFAULT
  const handleSetDefault = async (id: string) => {
    const updatedAccounts = accounts.map(acc => ({
      ...acc,
      isDefault: acc.id === id 
    }));
    setAccounts(updatedAccounts);
    try {
      await setDoc(doc(db, 'studio_settings', 'payout_banks'), { accounts: updatedAccounts, updatedAt: new Date().toISOString() });
    } catch (error) { console.error(error); }
  };

  // 4. DELETE ACCOUNT
  const handleDelete = async (id: string) => {
    if(!confirm("Remove this bank account?")) return;
    
    const updatedAccounts = accounts.filter(acc => acc.id !== id);
    if (updatedAccounts.length > 0 && !updatedAccounts.some(acc => acc.isDefault)) {
        updatedAccounts[0].isDefault = true;
    }
    setAccounts(updatedAccounts);
    try {
      await setDoc(doc(db, 'studio_settings', 'payout_banks'), { accounts: updatedAccounts, updatedAt: new Date().toISOString() });
    } catch (error) { console.error(error); }
  };

  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-[#FFFFFF] font-sans px-[24px] pt-[40px] pb-[100px]"
    >
      
      {/* HEADER */}
      <header className="flex items-center mb-[32px]">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.back()} className="p-2 -ml-2 mr-[8px]">
          <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 1.5L2.5 9L13 16.5V1.5Z" fill="#16161B" stroke="#16161B" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </motion.button>
        <div className="flex flex-col">
            <h1 className="text-[24px] font-extrabold text-[#16161B] uppercase tracking-wide leading-none" style={{ fontFamily: 'var(--font-abhaya), serif' }}>
                BANK DETAILS
            </h1>
            <p className="font-inter text-[12px] text-[#666666] mt-1">Manage artist payout accounts</p>
        </div>
      </header>

      {/* SECURITY BADGE */}
      <div className="flex items-center gap-2 mb-[24px] px-2">
          <ShieldCheck size={18} className="text-[#22c55e]" />
          <span className="font-inter text-[12px] font-bold text-[#22c55e] uppercase tracking-wider">
              256-Bit Encrypted Vault
          </span>
      </div>

      {isFetching ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#F74B33]" size={32} /></div>
      ) : (
          <div className="flex flex-col gap-[20px]">
              
              {/* ACCOUNT LIST */}
              {accounts.map((acc) => (
                  <motion.div 
                    layout
                    key={acc.id} 
                    style={{ background: acc.isDefault ? 'linear-gradient(-45deg, #F74B33, #FFB6AB)' : 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '16px', boxShadow: '4px 4px 10px rgba(0,0,0,0.05)' }}
                  >
                      <div className="bg-[#FFFFFF] rounded-[15px] p-[20px] relative overflow-hidden">
                          <Landmark size={80} className="absolute -right-4 -bottom-4 text-gray-100 opacity-50 pointer-events-none" />
                          
                          <div className="flex justify-between items-start mb-4 relative z-10">
                              <div>
                                  <h3 className="font-inter text-[16px] font-bold text-[#16161B] uppercase">{acc.bankName}</h3>
                                  <p className="font-inter text-[12px] text-[#666666] mt-1">{acc.accountName}</p>
                              </div>
                              <button onClick={() => handleDelete(acc.id)} className="p-2 text-gray-400 hover:text-[#F74B33] active:scale-95 transition-all">
                                  <Trash2 size={18} />
                              </button>
                          </div>
                          
                          <div className="flex flex-col gap-2 relative z-10 mb-2">
                              <p className="font-inter text-[14px] font-bold text-[#16161B] tracking-widest">
                                  •••• •••• {acc.accountNumber.slice(-4)}
                              </p>
                              <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100 w-fit mt-1">
                                  <QrCode size={14} className="text-[#F74B33]" />
                                  <span className="font-inter text-[12px] font-semibold text-[#16161B]">{acc.upiId}</span>
                              </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between relative z-10">
                              {acc.isDefault ? (
                                  <div className="flex items-center gap-1.5 text-[#F74B33]">
                                      <CheckCircle2 size={16} />
                                      <span className="font-inter text-[12px] font-bold uppercase">Studio Default</span>
                                  </div>
                              ) : (
                                  <button onClick={() => handleSetDefault(acc.id)} className="font-inter text-[12px] font-medium text-[#666666] uppercase hover:text-[#16161B]">
                                      Make Studio Default
                                  </button>
                              )}
                          </div>
                      </div>
                  </motion.div>
              ))}

              {/* ADD BUTTON */}
              {!isAddingMode && accounts.length < 4 && (
                  <motion.button 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsAddingMode(true)} 
                    className="w-full h-[60px] border-2 border-dashed border-[#BDBDBD] rounded-[16px] flex items-center justify-center gap-2 text-[#666666] hover:border-[#16161B] hover:text-[#16161B] transition-colors"
                  >
                      <Plus size={20} />
                      <span className="font-inter text-[14px] font-bold uppercase tracking-wide">Link New Account</span>
                  </motion.button>
              )}

              {/* ADD FORM */}
              <AnimatePresence>
              {isAddingMode && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '16px' }} className="mt-4 shadow-xl mb-12"
                >
                    <div className="bg-[#FFFFFF] rounded-[15px] p-[24px] flex flex-col gap-[16px]">
                        <h2 className="font-inter text-[16px] font-bold text-[#16161B] mb-2">New Account Details</h2>
                        
                        <div>
                            <label className="block font-inter text-[11px] font-bold text-[#666666] mb-2 pl-1 uppercase tracking-wide">Bank Name</label>
                            <GradientInputWrapper>
                                <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. HDFC Bank" className="w-full h-full bg-transparent px-[20px] text-[14px] font-bold text-[#16161B] outline-none" />
                            </GradientInputWrapper>
                        </div>
                        
                        <div>
                            <label className="block font-inter text-[11px] font-bold text-[#666666] mb-2 pl-1 uppercase tracking-wide">Account Holder</label>
                            <GradientInputWrapper>
                                <input type="text" value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="Name on account" className="w-full h-full bg-transparent px-[20px] text-[14px] font-bold text-[#16161B] outline-none" />
                            </GradientInputWrapper>
                        </div>

                        <div>
                            <label className="block font-inter text-[11px] font-bold text-[#666666] mb-2 pl-1 uppercase tracking-wide">Account Number</label>
                            <GradientInputWrapper>
                                <input type="password" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="•••• ••••" className="w-full h-full bg-transparent px-[20px] text-[14px] font-bold text-[#16161B] tracking-widest outline-none" />
                            </GradientInputWrapper>
                        </div>

                        <div>
                            <label className="block font-inter text-[11px] font-bold text-[#666666] mb-2 pl-1 uppercase tracking-wide">IFSC Code</label>
                            <GradientInputWrapper>
                                <input type="text" value={ifscCode} onChange={(e) => setIfscCode(e.target.value.toUpperCase())} placeholder="SBIN000XXXX" className="w-full h-full bg-transparent px-[20px] text-[14px] font-bold text-[#16161B] uppercase outline-none" />
                            </GradientInputWrapper>
                        </div>

                        <div>
                            <label className="block font-inter text-[11px] font-bold text-[#666666] mb-2 pl-1 uppercase tracking-wide">UPI ID</label>
                            <GradientInputWrapper>
                                <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value.toLowerCase())} placeholder="e.g. name@bank" className="w-full h-full bg-transparent px-[20px] text-[14px] font-bold text-[#16161B] outline-none" />
                            </GradientInputWrapper>
                        </div>

                        <div className="flex gap-[12px] mt-4">
                            <button onClick={() => setIsAddingMode(false)} className="flex-1 h-[48px] rounded-full border border-[#EAEAEA] font-inter text-[13px] font-bold text-[#666666] uppercase tracking-wide active:scale-95">Cancel</button>
                            <button onClick={handleAddAccount} disabled={!accountName || !accountNumber || !ifscCode || !bankName || !upiId || isSaving} className="flex-1 h-[48px] rounded-full bg-[#F74B33] font-inter text-[13px] font-bold text-[#FFFFFF] uppercase tracking-wide active:scale-95 disabled:opacity-50 flex items-center justify-center">
                                {isSaving ? <Loader2 className="animate-spin" size={18} /> : 'Save Account'}
                            </button>
                        </div>
                    </div>
                </motion.div>
              )}
              </AnimatePresence>
          </div>
      )}
    </motion.div>
  );
}