'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

// ----------------------------------------------------------------------
// CRITICAL FIX: Component moved OUTSIDE to prevent keyboard focus loss
// ----------------------------------------------------------------------
const GradientBorderInput = ({ children }: { children: React.ReactNode }) => (
  <div 
      className="w-full p-[1px] rounded-full relative"
      style={{
          background: 'linear-gradient(135deg, #BDBDBD 0%, #4F4F4F 100%)',
          height: '48px' 
      }}
  >
      <div className="w-full h-full bg-white rounded-full overflow-hidden flex items-center">
          {children}
      </div>
  </div>
);

export default function StaffLogin() {
  const router = useRouter();
  
  // State
  const [selectedArtist, setSelectedArtist] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [staffList, setStaffList] = useState<string[]>([]);
  const [isFetchingStaff, setIsFetchingStaff] = useState(true);

  // 1. FETCH STAFF NAMES
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'staff'));
        const names: string[] = [];
        querySnapshot.forEach((doc) => {
          names.push(doc.data().name);
        });
        setStaffList(names);
      } catch (err) {
        console.error("Error fetching staff:", err);
        setError("Could not connect to database.");
      } finally {
        setIsFetchingStaff(false);
      }
    };

    fetchStaff();
  }, []);

  // 2. AUTHENTICATION & SESSION START
  const handleLogin = async () => {
    if (!selectedArtist || !code) {
        setError('Select an artist and enter code.');
        return;
    }

    setLoading(true);
    setError('');

    try {
      // Find user matching Name + PIN
      const q = query(
        collection(db, 'staff'), 
        where('name', '==', selectedArtist), 
        where('pin', '==', code)
      );
      
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        
        // SAVE SESSION DATA
        localStorage.setItem('studio_user_name', userData.name);
        localStorage.setItem('studio_user_role', userData.role);
        
        // Start Invisible Timer
        if (!localStorage.getItem('shift_start_time')) {
            localStorage.setItem('shift_start_time', Date.now().toString());
        }
        
        // Route based on role
        if (userData.role === 'owner') {
            router.push('/studio/session/owner');
        } else {
            router.push('/studio/session/artist');
        }
      } else {
        setError('Invalid Access Code');
      }
    } catch (err) {
      console.error("Login error:", err);
      setError('Connection error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans pb-[80px]">
       
       {/* LOGO SECTION */}
       <div className="w-[180px] h-[180px] relative mb-2 flex items-center justify-center">
          <img src="/logo.png" alt="Tattoo Tattva Logo" className="w-full h-full object-contain" 
            onError={(e) => {
              e.currentTarget.style.display='none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }} 
          />
          {/* Fallback SVG if logo fails */}
          <svg className="hidden" width="100" height="120" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 10 C 60 30, 80 40, 90 50 C 70 50, 60 40, 50 60 C 40 40, 30 50, 10 50 C 20 40, 40 30, 50 10 Z" fill="#16161B"/>
            <path d="M50 60 C 60 70, 90 70, 90 60 C 70 80, 55 75, 50 90 C 45 75, 30 80, 10 60 C 10 70, 40 70, 50 60 Z" fill="#16161B"/>
            <path d="M50 90 C 50 110, 65 110, 65 100 C 65 115, 45 120, 45 100 C 45 95, 50 90, 50 90 Z" fill="#16161B"/>
          </svg>
       </div>

       {/* TEXT SECTION */}
       <div className="text-center mb-10">
         <h1 style={{ fontFamily: 'var(--font-abhaya), serif' }} className="text-[40px] font-extrabold text-black leading-[1.1] tracking-tight mb-2 uppercase">
           TATTOO<br/>TATTVA
         </h1>
         <p className="font-inter text-[14px] text-gray-500 font-normal">
           Staff Login
         </p>
       </div>

       {/* FORM SECTION */}
       <div className="w-full max-w-[320px] space-y-4">
         
         {/* Artist Dropdown */}
         <GradientBorderInput>
             <select 
                value={selectedArtist}
                onChange={(e) => setSelectedArtist(e.target.value)}
                disabled={isFetchingStaff}
                className="w-full h-full bg-transparent px-5 text-[14px] text-black appearance-none outline-none font-inter cursor-pointer disabled:opacity-50"
             >
                <option value="" disabled>
                  {isFetchingStaff ? 'Loading...' : 'Select Artist'}
                </option>
                {staffList.map(name => <option key={name} value={name}>{name}</option>)}
             </select>
             <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                {isFetchingStaff ? (
                  <Loader2 className="animate-spin text-gray-400" size={16} />
                ) : (
                  <svg width="12" height="8" viewBox="0 0 10 6" fill="none" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L5 5L9 1"/></svg>
                )}
             </div>
         </GradientBorderInput>

         {/* Code Input */}
         <GradientBorderInput>
             <input 
                type="password" 
                placeholder="Enter the Code" 
                className="w-full h-full bg-transparent px-5 text-[14px] text-black outline-none placeholder:text-gray-400 font-inter"
                value={code}
                onChange={(e) => setCode(e.target.value)}
             />
         </GradientBorderInput>

         {error && <p className="text-[#F74B33] font-bold text-[12px] uppercase tracking-wide text-center mt-2">{error}</p>}

         {/* ENTER Button */}
         <button 
            onClick={handleLogin}
            disabled={loading || isFetchingStaff}
            className="w-full rounded-full text-white font-bold text-[14px] uppercase shadow-[0_4px_15px_rgba(247,75,51,0.25)] active:scale-95 transition-all flex items-center justify-center mt-6 disabled:opacity-70"
            style={{ 
                backgroundColor: '#F74B33', 
                height: '48px',
                fontFamily: 'var(--font-inter)'
            }}
         >
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'ENTER'}
         </button>

       </div>
    </div>
  );
}