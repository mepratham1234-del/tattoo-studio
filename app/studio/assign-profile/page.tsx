'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, UserPlus, CheckCircle2, ChevronDown, Landmark, User, ArrowLeft } from 'lucide-react';
import { collection, doc, getDoc, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface BankAccount {
  id: string;
  accountName: string;
  bankName: string;
  upiId: string;
  isDefault: boolean;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  profile?: string; // 1 or 2
  assignedBankId?: string;
  assignedUpiId?: string;
}

// Gradient Wrapper outside to prevent focus loss
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
  const [selectedArtistId, setSelectedArtistId] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<'1' | '2' | null>(null);
  
  // Data States
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [availableBanks, setAvailableBanks] = useState<BankAccount[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // 1. FETCH DATA (Banks + Staff)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // A. Fetch Banks
        const bankSnap = await getDoc(doc(db, 'studio_settings', 'payout_banks'));
        if (bankSnap.exists() && bankSnap.data().accounts) {
          const banks = bankSnap.data().accounts;
          setAvailableBanks(banks);
          const defaultBank = banks.find((b: BankAccount) => b.isDefault);
          if (defaultBank) setSelectedBankId(defaultBank.id);
        }

        // B. Fetch Staff (Only Artists)
        const q = query(collection(db, 'staff'), where('role', '==', 'artist'));
        const querySnapshot = await getDocs(q);
        const staff: StaffMember[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            staff.push({ 
                id: doc.id, 
                name: data.name, 
                role: data.role,
                profile: data.profile,
                assignedBankId: data.assignedBankId,
                assignedUpiId: data.assignedUpiId
            });
        });
        setStaffList(staff);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // 2. SAVE (UPDATE EXISTING STAFF)
  const handleSaveArtist = async () => {
    if (!selectedArtistId || !selectedProfile || !selectedBankId) return;
    setIsSaving(true);

    try {
      const chosenBank = availableBanks.find(b => b.id === selectedBankId);
      
      // Update the specific staff document
      const staffRef = doc(db, 'staff', selectedArtistId);
      await updateDoc(staffRef, {
          profile: selectedProfile, // 1 or 2
          assignedBankId: selectedBankId,
          assignedUpiId: chosenBank?.upiId || ''
      });

      // Update Local UI instantly
      setStaffList(prev => prev.map(s => {
          if (s.id === selectedArtistId) {
              return { 
                  ...s, 
                  profile: selectedProfile, 
                  assignedBankId: selectedBankId,
                  assignedUpiId: chosenBank?.upiId || ''
              };
          }
          return s;
      }));

      setSuccess(true);
      setTimeout(() => {
          setSuccess(false);
          setIsSaving(false);
          setSelectedArtistId('');
          setSelectedProfile(null);
      }, 1500);

    } catch (error) {
      console.error(error);
      alert("Failed to update artist.");
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-sans px-[24px] pt-[40px] pb-[100px]">
      
      {/* HEADER */}
      <header className="flex items-center mb-[40px]">
        <button onClick={() => router.back()} className="p-2 -ml-2 mr-[8px] active:scale-90 transition-transform">
          <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 1.5L2.5 9L13 16.5V1.5Z" fill="#16161B" stroke="#16161B" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="flex flex-col">
            <h1 className="text-[24px] font-extrabold text-[#16161B] uppercase tracking-wide leading-none" style={{ fontFamily: 'var(--font-abhaya), serif' }}>
                ASSIGN PROFILE
            </h1>
            <p className="font-inter text-[12px] text-[#666666] mt-1">Configure Artist Payouts</p>
        </div>
      </header>

      {/* FORM AREA */}
      {success ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-[16px] border border-gray-100 mb-8">
              <CheckCircle2 size={56} className="text-[#22c55e] mb-4" />
              <h2 className="font-inter text-[18px] font-bold text-[#16161B]">Profile Updated!</h2>
          </div>
      ) : (
          <div className="flex flex-col gap-[24px] mb-12">
              
              {/* 1. SELECT ARTIST */}
              <div>
                  <label className="block font-inter text-[12px] font-bold text-[#16161B] mb-[8px] pl-[4px] uppercase tracking-wide">
                      Select Artist
                  </label>
                  <GradientInputWrapper>
                      <div className="w-full h-[52px] flex items-center px-[20px]">
                          <User size={18} className="text-[#16161B] mr-3" />
                          <select 
                              value={selectedArtistId}
                              onChange={(e) => setSelectedArtistId(e.target.value)}
                              className="flex-1 bg-transparent text-[14px] font-bold text-[#16161B] outline-none appearance-none"
                          >
                              <option value="" disabled>Select from staff list</option>
                              {staffList.map(s => (
                                  <option key={s.id} value={s.id}>{s.name}</option>
                              ))}
                          </select>
                          <ChevronDown size={18} className="text-gray-400 pointer-events-none absolute right-[20px]" />
                      </div>
                  </GradientInputWrapper>
                  {staffList.length === 0 && <p className="text-[11px] text-red-500 mt-2 ml-1">No artists found. Add them in 'Add Artist' page first.</p>}
              </div>

              {/* 2. ASSIGN PRICE PROFILE */}
              <div>
                  <label className="block font-inter text-[12px] font-bold text-[#16161B] mb-[8px] pl-[4px] uppercase tracking-wide">
                      Assign Price Profile
                  </label>
                  <div className="flex gap-[12px]">
                      {['1', '2'].map((profile) => (
                          <button
                              key={profile}
                              onClick={() => setSelectedProfile(profile as '1' | '2')}
                              className={`flex-1 h-[52px] rounded-[12px] font-inter text-[14px] font-bold uppercase transition-all ${
                                  selectedProfile === profile 
                                      ? 'bg-[#16161B] text-[#FFFFFF] shadow-lg' 
                                      : 'bg-[#F5F5F5] text-[#666666] border border-[#EAEAEA]'
                              }`}
                          >
                              Profile {profile}
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
                                      {bank.bankName} - {bank.accountName} ({bank.upiId})
                                  </option>
                              ))}
                          </select>
                          <ChevronDown size={18} className="text-gray-400 pointer-events-none absolute right-[20px]" />
                      </div>
                  </GradientInputWrapper>
              </div>

              <button 
                  onClick={handleSaveArtist}
                  disabled={!selectedArtistId || !selectedProfile || !selectedBankId || isSaving}
                  className="w-full h-[56px] mt-[8px] bg-[#F74B33] text-[#FFFFFF] rounded-[12px] font-bold text-[15px] uppercase tracking-wide flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-[0_8px_20px_rgba(247,75,51,0.25)] disabled:opacity-50 disabled:shadow-none"
              >
                  {isSaving ? <Loader2 className="animate-spin" /> : <><UserPlus size={20} /> Update Configuration</>}
              </button>
          </div>
      )}

      {/* ACTIVE CONFIGURATION LIST */}
      {staffList.length > 0 && (
        <div className="mt-8">
            <h2 className="font-inter text-[14px] font-bold text-[#16161B] uppercase tracking-wide mb-4 border-b border-gray-200 pb-2">
                Current Configurations
            </h2>
            <div className="flex flex-col gap-3">
                {staffList.map(artist => (
                    <div key={artist.id} className="bg-gray-50 rounded-[12px] p-4 flex items-center justify-between border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-[40px] h-[40px] bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200">
                                <User size={18} className="text-[#16161B]" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-inter font-bold text-[14px] text-[#16161B]">{artist.name}</span>
                                <span className="font-inter text-[11px] text-[#666666]">
                                    {artist.profile ? `Profile ${artist.profile}` : 'No Profile'} • {artist.assignedUpiId ? `UPI: ${artist.assignedUpiId}` : 'No Bank'}
                                </span>
                            </div>
                        </div>
                        {artist.profile && <div className="w-2 h-2 rounded-full bg-[#22c55e]" />}
                    </div>
                ))}
            </div>
        </div>
      )}

    </div>
  );
}