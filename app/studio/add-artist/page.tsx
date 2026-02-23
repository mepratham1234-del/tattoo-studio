'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, UserCircle, Loader2 } from 'lucide-react';

// 1. IMPORT FIREBASE
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';

export default function AddArtistPage() {
  const router = useRouter();

  // Form State
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  // Database State
  const [artists, setArtists] = useState<{ id: string; name: string; role: string }[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // 2. FETCH CURRENT ARTISTS ON LOAD
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        // Only fetch staff members who are artists (ignore the owner)
        const q = query(collection(db, 'staff'), where('role', '==', 'artist'));
        const querySnapshot = await getDocs(q);
        
        const fetchedArtists: { id: string; name: string; role: string }[] = [];
        querySnapshot.forEach((doc) => {
          fetchedArtists.push({ id: doc.id, name: doc.data().name, role: 'Artist' });
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

  // 3. ADD ARTIST TO CLOUD
  const handleAddArtist = async () => {
    if (!name || !password) return;
    setIsAdding(true);
    
    try {
      // Save to Firebase
      const docRef = await addDoc(collection(db, 'staff'), {
        name: name,
        pin: password, // Storing the password as 'pin' to match the login logic
        role: 'artist',
        profile: 2 // Defaulting new artists to Category 2 pricing
      });
      
      // Update the UI instantly
      setArtists([{ id: docRef.id, name: name, role: 'Artist' }, ...artists]);
      
      // Clear inputs
      setName('');
      setPassword('');
    } catch (error) {
      console.error("Error adding artist:", error);
      alert("Failed to add artist. Check connection.");
    } finally {
      setIsAdding(false);
    }
  };

  // 4. DELETE ARTIST FROM CLOUD
  const handleDeleteArtist = async (id: string) => {
    // Optimistic UI update (remove from screen immediately for a snappy feel)
    const previousArtists = [...artists];
    setArtists(artists.filter(artist => artist.id !== id));

    try {
      // Delete from Firebase
      await deleteDoc(doc(db, 'staff', id));
    } catch (error) {
      console.error("Error deleting artist:", error);
      // Revert if it fails
      setArtists(previousArtists);
      alert("Failed to delete artist.");
    }
  };

  // Reusable Component for the 1px Gradient Input Borders
  const GradientInputWrapper = ({ children }: { children: React.ReactNode }) => (
    <div style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '9999px' }}>
      <div className="bg-[#FFFFFF] rounded-full overflow-hidden h-[48px] flex items-center">
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-sans px-[24px] pt-[40px] pb-[80px]">
      
      {/* TOP NAVIGATION HEADER */}
      <header className="flex items-center mb-[40px]">
        <button onClick={() => router.back()} className="p-2 -ml-2 mr-[8px] active:scale-90 transition-transform">
          <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 1.5L2.5 9L13 16.5V1.5Z" fill="#16161B" stroke="#16161B" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="text-[26px] font-extrabold text-[#16161B] uppercase tracking-wide leading-none" style={{ fontFamily: 'var(--font-abhaya), serif' }}>
          ADD ARTIST
        </h1>
      </header>

      {/* ADD NEW ARTIST FORM CARD */}
      <div style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '16px', boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.08)' }}>
        <div className="bg-[#FFFFFF] rounded-[15px] p-[24px] w-full flex flex-col">
          
          <h2 className="font-inter text-[18px] font-bold text-[#16161B] mb-[24px]">
            Add New Artist
          </h2>

          <div className="flex flex-col gap-[16px]">
            {/* Name Input */}
            <div>
              <label className="block font-inter text-[12px] font-normal text-[#16161B] mb-[8px] pl-[4px]">Name</label>
              <GradientInputWrapper>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-full bg-transparent px-[20px] text-[14px] text-[#16161B] outline-none font-inter"
                />
              </GradientInputWrapper>
            </div>

            {/* Password Input */}
            <div>
              <label className="block font-inter text-[12px] font-normal text-[#16161B] mb-[8px] pl-[4px]">Password (PIN)</label>
              <GradientInputWrapper>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g., 1234"
                  className="w-full h-full bg-transparent px-[20px] text-[14px] text-[#16161B] outline-none font-inter tracking-widest"
                />
              </GradientInputWrapper>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            onClick={handleAddArtist}
            disabled={!name || !password || isAdding}
            style={{ background: name && password ? 'linear-gradient(-45deg, #F74B33, #FFB6AB)' : '#EAEAEA' }}
            className={`w-full h-[48px] rounded-full mt-[32px] flex items-center justify-center transition-all ${
              name && password ? 'shadow-[0_4px_15px_rgba(247,75,51,0.25)] active:scale-[0.98]' : 'opacity-50'
            }`}
          >
            {isAdding ? (
               <Loader2 className="animate-spin text-[#FFFFFF]" size={20} />
            ) : (
              <span className={`font-inter text-[14px] font-bold uppercase tracking-wide ${name && password ? 'text-[#FFFFFF]' : 'text-[#666666]'}`}>
                ADD ARTIST
              </span>
            )}
          </button>

        </div>
      </div>

      {/* CURRENT ARTISTS SECTION */}
      <div className="mt-[32px]">
        <h3 className="font-inter text-[14px] font-medium text-[#16161B] uppercase tracking-wide mb-[16px]">
          CURRENT ARTISTS
        </h3>
        
        <div style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '16px', boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.08)' }}>
          <div className="bg-[#FFFFFF] rounded-[15px] p-[20px] w-full min-h-[150px] flex flex-col gap-[16px]">
            
            {isFetching ? (
              <div className="h-full flex items-center justify-center py-[40px]">
                <Loader2 className="animate-spin text-[#F74B33]" size={24} />
              </div>
            ) : artists.length === 0 ? (
              <div className="h-full flex items-center justify-center py-[40px]">
                <p className="font-inter text-[12px] text-[#666666]">No artists added yet.</p>
              </div>
            ) : (
              artists.map((artist, index) => (
                <div 
                  key={artist.id} 
                  className={`flex items-center justify-between pb-[16px] ${index !== artists.length - 1 ? 'border-b border-[#EAEAEA]' : 'pb-0'}`}
                >
                  <div className="flex items-center gap-[12px]">
                    <UserCircle size={28} color="#16161B" strokeWidth={1.5} />
                    <span className="font-inter text-[14px] font-bold text-[#16161B]">{artist.name}</span>
                  </div>
                  
                  <button 
                    onClick={() => handleDeleteArtist(artist.id)}
                    className="w-[36px] h-[36px] rounded-full flex items-center justify-center bg-[#F74B33]/10 text-[#F74B33] hover:bg-[#F74B33]/20 active:scale-95 transition-all"
                  >
                    <Trash2 size={16} strokeWidth={2} />
                  </button>
                </div>
              ))
            )}

          </div>
        </div>
      </div>

    </div>
  );
}