'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, UserPlus, CheckCircle2, ChevronDown, Landmark, User } from 'lucide-react';
import { collection, addDoc, doc, getDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface BankAccount {
  id: string;
  accountName: string;
  bankName: string;
  upiId: string;
  isDefault: boolean;
}

interface Artist {
  id: string;
  name: string;
  priceProfile: string;
  assignedUpiId: string;
}

// KEPT FROM CODE 1: Placed OUTSIDE to prevent the typing/cursor focus bug
const GradientInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '12px' }}>
    <div className="bg-[#FFFFFF] rounded-[11px] overflow-hidden flex items-center relative">
      {children}
    </div>
  </div>
);

export default function AssignProfilePage() {
  const router = useRouter();
  
  // States
  const [artistName, setArtistName] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<'Profile 1' | 'Profile 2' | null>(null);
  
  // Bank Account & Artist List States
  const [availableBanks, setAvailableBanks] = useState<BankAccount[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [savedArtists, setSavedArtists] = useState<Artist[]>([]);
  
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // FETCH BANKS & EXISTING ARTISTS ON LOAD
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Banks
        const bankSnap = await getDoc(doc(db, 'studio_settings', 'payout_banks'));
        if (bankSnap.exists() && bankSnap.data().accounts) {
          const banks = bankSnap.data().accounts;
          setAvailableBanks(banks);
          const defaultBank = banks.find((b: BankAccount) => b.isDefault);
          if (defaultBank) setSelectedBankId(defaultBank.id);
        }

        // 2. Fetch Existing Artists (Kept from Code 1)
        const q = query(collection(db, 'artists'), orderBy('createdAt', 'desc'));
        const artistSnap = await getDocs(q);
        const artistsData = artistSnap.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            priceProfile: doc.data().priceProfile,
            assignedUpiId: doc.data().assignedUpiId
        }));
        setSavedArtists(artistsData);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleSaveArtist = async () => {
    if (!artistName || !selectedProfile || !selectedBankId) return;
    setIsSaving(true);

    try {
      const chosenBank = availableBanks.find(b => b.id === selectedBankId);

      // Create new artist object
      const newArtistData = {
        name: artistName,
        priceProfile: selectedProfile,
        bankAccountId: selectedBankId,
        assignedUpiId: chosenBank?.upiId || '', 
        createdAt: new Date().toISOString()
      };

      // Save to Firebase
      const docRef = await addDoc(collection(db, 'artists'), newArtistData);

      // Update UI List Instantly (Optimistic Update - Kept from Code 1)
      setSavedArtists([{ id: docRef.id, ...newArtistData }, ...savedArtists]);

      // Show Success Checkmark
      setSuccess(true);

      // Reset Form securely WITHOUT leaving the page (Fixes the 404 error)
      setTimeout(() => {
          setArtistName('');
          setSelectedProfile(null);
          setSuccess(false);
          setIsSaving(false);
      }, 1500);

    } catch (error) {
      console.error(error);
      alert("Failed to save artist.");
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-sans px-[24px] pt-[40px] pb-[100px]">
      
      <header className="flex items-center mb-[40px]">
        <button onClick={() => router.back()} className="p-2 -ml-2 mr-[8px] active:scale-90 transition-transform">
          <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 1.5L2.5 9L13 16.5V1.5Z" fill="#16161B" stroke="#16161B" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="flex flex-col">
            <h1 className="text-[24px] font-extrabold text-[#16161B] uppercase tracking-wide leading-none" style={{ fontFamily: 'var(--font-abhaya), serif' }}>
                ADD ARTIST
            </h1>
            <p className="font-inter text-[12px] text-[#666666] mt-1">Assign Profile & Payouts</p>
        </div>
      </header>

      {/* NEW ARTIST FORM */}
      {success ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-[16px] border border-gray-100">
              <CheckCircle2 size={56} className="text-[#22c55e] mb-4" />
              <h2 className="font-inter text-[18px] font-bold text-[#16161B]">Artist Added Successfully!</h2>
          </div>
      ) : (
          <div className="flex flex-col gap-[24px]">
              
              {/* 1. ARTIST NAME */}
              <div>
                  <label className="block font-inter text-[12px] font-bold text-[#16161B] mb-[8px] pl-[4px] uppercase tracking-wide">
                      Artist Name
                  </label>
                  <GradientInputWrapper>
                      <input 
                          type="text" 
                          value={artistName}
                          onChange={(e) => setArtistName(e.target.value)}
                          placeholder="Enter artist name" 
                          className="w-full h-[52px] bg-transparent px-[20px] text-[15px] font-bold text-[#16161B] outline-none placeholder:font-normal" 
                      />
                  </GradientInputWrapper>
              </div>

              {/* 2. PRICE PROFILE */}
              <div>
                  <label className="block font-inter text-[12px] font-bold text-[#16161B] mb-[8px] pl-[4px] uppercase tracking-wide">
                      Assign Price Profile
                  </label>
                  <div className="flex gap-[12px]">
                      {['Profile 1', 'Profile 2'].map((profile) => (
                          <button
                              key={profile}
                              onClick={() => setSelectedProfile(profile as 'Profile 1' | 'Profile 2')}
                              className={`flex-1 h-[52px] rounded-[12px] font-inter text-[14px] font-bold uppercase transition-all ${
                                  selectedProfile === profile 
                                      ? 'bg-[#16161B] text-[#FFFFFF] shadow-lg' 
                                      : 'bg-[#F5F5F5] text-[#666666] border border-[#EAEAEA]'
                              }`}
                          >
                              {profile}
                          </button>
                      ))}
                  </div>
              </div>

              {/* 3. ASSIGN PAYOUT BANK */}
              <div>
                  <label className="block font-inter text-[12px] font-bold text-[#16161B] mb-[8px] pl-[4px] uppercase tracking-wide">
                      Route Payments To
                  </label>
                  <GradientInputWrapper>
                      <div className="w-full h-[52px] flex items-center px-[20px]">
                          <Landmark size={18} className="text-[#F74B33] mr-3" />
                          <select 
                              value={selectedBankId}
                              onChange={(e) => setSelectedBankId(e.target.value)}
                              className="flex-1 bg-transparent text-[14px] font-bold text-[#16161B] outline-none appearance-none"
                          >
                              <option value="" disabled>Select a bank account</option>
                              {availableBanks.map(bank => (
                                  <option key={bank.id} value={bank.id}>
                                      {/* KEPT FROM CODE 2: Added ({bank.upiId}) into the dropdown text */}
                                      {bank.bankName} - {bank.accountName} ({bank.upiId})
                                  </option>
                              ))}
                          </select>
                          <ChevronDown size={18} className="text-gray-400 pointer-events-none absolute right-[20px]" />
                      </div>
                  </GradientInputWrapper>
                  {availableBanks.length === 0 && (
                      <p className="text-[11px] text-red-500 mt-2 ml-1 font-inter">No banks found. Please add a bank in Bank Details first.</p>
                  )}
              </div>

              <button 
                  onClick={handleSaveArtist}
                  disabled={!artistName || !selectedProfile || !selectedBankId || isSaving}
                  className="w-full h-[56px] mt-[8px] bg-[#F74B33] text-[#FFFFFF] rounded-[12px] font-bold text-[15px] uppercase tracking-wide flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-[0_8px_20px_rgba(247,75,51,0.25)] disabled:opacity-50 disabled:shadow-none"
              >
                  {isSaving ? <Loader2 className="animate-spin" /> : <><UserPlus size={20} /> Save Artist</>}
              </button>
          </div>
      )}

      {/* SAVED ARTISTS LIST (Kept from Code 1) */}
      {savedArtists.length > 0 && (
        <div className="mt-12">
            <h2 className="font-inter text-[14px] font-bold text-[#16161B] uppercase tracking-wide mb-4 border-b border-gray-200 pb-2">
                Active Artists
            </h2>
            <div className="flex flex-col gap-3">
                {savedArtists.map(artist => (
                    <div key={artist.id} className="bg-gray-50 rounded-[12px] p-4 flex items-center justify-between border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-[40px] h-[40px] bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200">
                                <User size={18} className="text-[#16161B]" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-inter font-bold text-[14px] text-[#16161B]">{artist.name}</span>
                                <span className="font-inter text-[11px] text-[#666666]">{artist.priceProfile} • UPI: {artist.assignedUpiId}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

    </div>
  );
}