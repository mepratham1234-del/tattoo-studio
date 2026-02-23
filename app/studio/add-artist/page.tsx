'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, UserCircle, Loader2, UserPlus, KeyRound } from 'lucide-react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// UI Wrapper for Inputs
const GradientInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '9999px' }}>
    <div className="bg-[#FFFFFF] rounded-full overflow-hidden h-[48px] flex items-center">
      {children}
    </div>
  </div>
);

export default function AddArtistPage() {
  const router = useRouter();

  // Form State
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');

  // Data State
  const [artists, setArtists] = useState<{ id: string; name: string; pin: string }[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // 1. FETCH EXISTING ARTISTS
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        // Query only 'artist' roles, ignore 'owner'
        const q = query(collection(db, 'staff'), where('role', '==', 'artist'));
        const querySnapshot = await getDocs(q);
        
        const fetchedArtists: any[] = [];
        querySnapshot.forEach((doc) => {
          fetchedArtists.push({ id: doc.id, ...doc.data() });
        });
        
        setArtists(fetchedArtists);
      } catch (error) {
        console.error("Error fetching artists:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchArtists();
  }, []);

  // 2. ADD NEW ARTIST
  const handleAddArtist = async () => {
    if (!name || !pin) return;
    setIsAdding(true);
    
    try {
      // Create the Staff Document
      const newArtist = {
        name: name,
        pin: pin, // This allows them to login
        role: 'artist', // Critical for filtering
        profile: '2', // Default to Standard pricing
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'staff'), newArtist);
      
      // Update UI Instantly
      setArtists([{ id: docRef.id, ...newArtist }, ...artists]);
      
      // Reset Form
      setName('');
      setPin('');
    } catch (error) {
      console.error("Error adding artist:", error);
      alert("Failed to add artist. Check connection.");
    } finally {
      setIsAdding(false);
    }
  };

  // 3. DELETE ARTIST
  const handleDeleteArtist = async (id: string) => {
    if(!confirm("Are you sure? This artist will no longer be able to log in.")) return;

    const previousArtists = [...artists];
    setArtists(artists.filter(artist => artist.id !== id));

    try {
      await deleteDoc(doc(db, 'staff', id));
    } catch (error) {
      console.error("Error deleting artist:", error);
      setArtists(previousArtists); // Revert on error
      alert("Failed to delete artist.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-sans px-[24px] pt-[40px] pb-[80px]">
      
      {/* HEADER */}
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
            <p className="font-inter text-[12px] text-[#666666] mt-1">Create Staff Logins</p>
        </div>
      </header>

      {/* ADD NEW ARTIST FORM */}
      <div style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '16px', boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.08)' }}>
        <div className="bg-[#FFFFFF] rounded-[15px] p-[24px] w-full flex flex-col">
          
          <h2 className="font-inter text-[16px] font-bold text-[#16161B] mb-[20px]">
            New Artist Credentials
          </h2>

          <div className="flex flex-col gap-[16px]">
            {/* Name Input */}
            <div>
              <label className="block font-inter text-[12px] font-bold text-[#666666] mb-[6px] pl-[4px] uppercase tracking-wide">Display Name</label>
              <GradientInputWrapper>
                <div className="w-full h-full flex items-center px-[16px]">
                    <UserCircle size={20} className="text-[#16161B] mr-3" />
                    <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul"
                    className="w-full h-full bg-transparent text-[14px] text-[#16161B] outline-none font-inter font-medium"
                    />
                </div>
              </GradientInputWrapper>
            </div>

            {/* PIN Input */}
            <div>
              <label className="block font-inter text-[12px] font-bold text-[#666666] mb-[6px] pl-[4px] uppercase tracking-wide">Login PIN</label>
              <GradientInputWrapper>
                <div className="w-full h-full flex items-center px-[16px]">
                    <KeyRound size={20} className="text-[#16161B] mr-3" />
                    <input 
                    type="tel"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="4-digit PIN"
                    className="w-full h-full bg-transparent text-[14px] text-[#16161B] outline-none font-inter tracking-widest font-bold"
                    />
                </div>
              </GradientInputWrapper>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            onClick={handleAddArtist}
            disabled={!name || pin.length < 4 || isAdding}
            style={{ background: name && pin.length >= 4 ? 'linear-gradient(-45deg, #F74B33, #FFB6AB)' : '#EAEAEA' }}
            className={`w-full h-[48px] rounded-full mt-[32px] flex items-center justify-center transition-all ${
              name && pin.length >= 4 ? 'shadow-[0_4px_15px_rgba(247,75,51,0.25)] active:scale-[0.98]' : 'opacity-50'
            }`}
          >
            {isAdding ? (
               <Loader2 className="animate-spin text-[#FFFFFF]" size={20} />
            ) : (
              <span className={`font-inter text-[13px] font-bold uppercase tracking-wide flex items-center gap-2 ${name && pin.length >= 4 ? 'text-[#FFFFFF]' : 'text-[#666666]'}`}>
                <UserPlus size={18} /> Create Account
              </span>
            )}
          </button>

        </div>
      </div>

      {/* CURRENT ARTISTS LIST */}
      <div className="mt-[40px]">
        <h3 className="font-inter text-[14px] font-bold text-[#16161B] uppercase tracking-wide mb-[16px] border-b border-gray-200 pb-2">
          Active Staff
        </h3>
        
        <div className="flex flex-col gap-[12px]">
            {isFetching ? (
              <div className="flex justify-center py-[20px]">
                <Loader2 className="animate-spin text-[#F74B33]" size={24} />
              </div>
            ) : artists.length === 0 ? (
              <div className="flex justify-center py-[20px]">
                <p className="font-inter text-[12px] text-[#666666]">No staff found.</p>
              </div>
            ) : (
              artists.map((artist) => (
                <div 
                  key={artist.id} 
                  className="bg-gray-50 rounded-[12px] p-[16px] flex items-center justify-between border border-gray-100"
                >
                  <div className="flex items-center gap-[12px]">
                    <div className="w-[36px] h-[36px] bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-sm">
                        <span className="font-inter font-bold text-[14px] text-[#16161B]">{artist.name.charAt(0)}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-inter text-[14px] font-bold text-[#16161B]">{artist.name}</span>
                        <span className="font-inter text-[11px] text-[#666666]">PIN: ••••</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleDeleteArtist(artist.id)}
                    className="w-[32px] h-[32px] rounded-full flex items-center justify-center bg-[#F74B33]/10 text-[#F74B33] hover:bg-[#F74B33]/20 active:scale-95 transition-all"
                  >
                    <Trash2 size={14} strokeWidth={2} />
                  </button>
                </div>
              ))
            )}
        </div>
      </div>

    </div>
  );
}