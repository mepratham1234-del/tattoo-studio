'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Users, Clock, ChevronDown } from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function ArtistDashboard() {
  const router = useRouter();
  
  // State
  const [artistName, setArtistName] = useState('Artist');
  const [shiftTime, setShiftTime] = useState('0h 0m');
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. INITIALIZE & START TIMER
  useEffect(() => {
    const storedName = localStorage.getItem('studio_user_name');
    if (storedName) setArtistName(storedName);
    else router.push('/studio');

    const startTimer = () => {
        const startStr = localStorage.getItem('shift_start_time');
        if (!startStr) {
            localStorage.setItem('shift_start_time', Date.now().toString());
        }

        const tick = () => {
            const start = parseInt(localStorage.getItem('shift_start_time') || Date.now().toString());
            const now = Date.now();
            const diff = now - start;
            
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            setShiftTime(`${hours}h ${minutes}m`);
        };

        tick(); 
        const interval = setInterval(tick, 60000); 
        return () => clearInterval(interval);
    };

    startTimer();
    fetchData(storedName || '');
  }, []);

  // 2. FETCH REAL DATA
  const fetchData = async (name: string) => {
    if(!name) return;
    setIsRefreshing(true);
    try {
        const q = query(
            collection(db, 'tickets'), 
            where('scannedBy', '==', name),
            orderBy('scannedAt', 'desc')
        );
        
        const snapshot = await getDocs(q);
        const fetchedTickets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTickets(fetchedTickets);
    } catch (error) {
        console.error("Error fetching dashboard:", error);
    } finally {
        setLoading(false);
        setIsRefreshing(false);
    }
  };

  const toggleOrder = (id: string) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  // 3. CALCULATE TOTALS
  const totalRevenue = tickets.reduce((sum, t) => sum + (parseInt(t.totalPrice) || 0), 0);
  const totalClients = tickets.length;

  return (
    <motion.div 
        initial="hidden" animate="show" variants={containerVariants}
        className="min-h-screen bg-[#FFFFFF] font-sans pb-[80px]"
    >
      
      {/* 1. TOP NAVIGATION HEADER */}
      <header className="pt-[40px] px-[24px] flex justify-between items-center">
        <div className="flex items-center gap-[12px]">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.back()} className="p-2 -ml-2">
            <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 1.5L2.5 9L13 16.5V1.5Z" fill="#16161B" stroke="#16161B" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </motion.button>
          
          <div className="flex flex-col">
            <h1 className="text-[24px] font-extrabold text-[#16161B] uppercase leading-none" style={{ fontFamily: 'var(--font-abhaya), serif' }}>
              DASHBOARD
            </h1>
            <div className="flex items-center gap-[4px] mt-[4px]">
              <motion.div 
                animate={{ opacity: [1, 0.5, 1] }} 
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-[4px] h-[4px] rounded-full bg-[#F74B33]" 
              />
              <span className="font-inter text-[10px] text-[#F74B33] font-normal leading-none">Live</span>
              <div className="w-[4px] h-[4px] rounded-full bg-[#16161B] ml-[4px]" />
              <span className="font-inter text-[10px] text-[#16161B] font-normal leading-none">
                Update {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
        
        <motion.button 
            whileTap={{ rotate: 180 }}
            onClick={() => fetchData(artistName)} 
            disabled={isRefreshing}
            className={`w-[32px] h-[32px] rounded-[8px] border-[2px] border-[#16161B] flex items-center justify-center transition-all ${isRefreshing ? 'opacity-50' : ''}`}
        >
          <RefreshCw size={16} color="#16161B" strokeWidth={2.5} className={isRefreshing ? "animate-spin" : ""} />
        </motion.button>
      </header>

      {/* 2. "MY STATS" PILL */}
      <motion.div variants={itemVariants} className="mt-[24px] flex justify-center">
        <div style={{ background: 'linear-gradient(-45deg, #F74B33, #FFB6AB)', padding: '2px', borderRadius: '999px', boxShadow: '4px 4px 10px rgba(247, 75, 51, 0.25)' }}>
          <div className="bg-[#FFFFFF] rounded-full flex items-center justify-center px-[24px] py-[12px]">
            <span className="font-inter text-[14px] font-bold text-[#16161B] uppercase tracking-wide leading-none">
              MY STATS
            </span>
          </div>
        </div>
      </motion.div>

      {/* 3. GREETING SECTION */}
      <motion.div variants={itemVariants} className="mt-[32px] px-[24px]">
        <h2 className="font-inter text-[28px] font-extrabold text-[#16161B] uppercase leading-tight">
          HELLO, {artistName}
        </h2>
        <p className="font-inter text-[12px] font-medium text-[#16161B] uppercase tracking-[0.05em] mt-[4px]">
          YOUR DAILY PERFORMANCE
        </p>
      </motion.div>

      {/* 4. DAILY PERFORMANCE CARDS */}
      <motion.div variants={itemVariants} className="mt-[20px] px-[24px] flex flex-col gap-[16px]">
        
        {/* Card A: Revenue */}
        <motion.div whileHover={{ scale: 1.02 }} style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '12px', boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.08)' }}>
          <div className="bg-[#FFFFFF] rounded-[11px] p-[20px] w-full h-full flex flex-col justify-center">
            <span className="font-inter text-[12px] font-normal text-[#16161B] uppercase">REVENUE GENERATED</span>
            <span className="font-inter text-[56px] font-extrabold text-[#16161B] leading-[1.1] mt-[8px]">₹{totalRevenue}</span>
          </div>
        </motion.div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-2 gap-[16px]">
          
          {/* Clients */}
          <motion.div whileHover={{ scale: 1.02 }} style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '12px', boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.08)' }}>
            <div className="bg-[#FFFFFF] rounded-[11px] p-[20px] w-full h-full flex flex-col justify-between min-h-[140px]">
              <Users size={24} color="#F74B33" strokeWidth={1.5} className="mb-[16px]" />
              <div className="flex flex-col">
                <span className="font-inter text-[10px] font-normal text-[#16161B] uppercase mb-[2px]">CLIENTS ATTENDED</span>
                <span className="font-inter text-[28px] font-bold text-[#16161B] leading-tight">{totalClients}</span>
              </div>
            </div>
          </motion.div>

          {/* Shift Time (Live Timer) */}
          <motion.div whileHover={{ scale: 1.02 }} style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '12px', boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.08)' }}>
            <div className="bg-[#FFFFFF] rounded-[11px] p-[20px] w-full h-full flex flex-col justify-between min-h-[140px]">
              <Clock size={24} color="#16161B" strokeWidth={1.5} className="mb-[16px]" />
              <div className="flex flex-col">
                <span className="font-inter text-[10px] font-normal text-[#16161B] uppercase mb-[2px]">SHIFT TIME</span>
                <span className="font-inter text-[24px] font-bold text-[#16161B] leading-tight">{shiftTime}</span>
              </div>
            </div>
          </motion.div>

        </div>
      </motion.div>

      {/* 5. ORDER HISTORY */}
      <motion.div variants={itemVariants} className="mt-[24px] px-[24px]">
        <div style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '12px', boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.08)' }}>
          <div className="bg-[#FFFFFF] rounded-[11px] py-[16px] px-[20px] w-full h-full">
            <h3 className="font-inter text-[14px] font-normal text-[#16161B]">ORDER HISTORY</h3>
            <div className="w-full h-[1px] bg-[#16161B] mt-[8px] mb-[8px]" />

            <div className="flex flex-col">
              {loading ? (
                  <p className="text-[12px] text-gray-400 py-4 text-center">Loading records...</p>
              ) : tickets.length === 0 ? (
                  <p className="text-[12px] text-gray-400 py-4 text-center">No sessions completed yet.</p>
              ) : (
                  tickets.map((order, index) => {
                    const isExpanded = expandedOrder === order.id;
                    const isLast = index === tickets.length - 1;
                    const timeStr = order.scannedAt ? new Date(order.scannedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A';
                    const codesStr = order.items ? order.items.map((i:any) => i.code).join(', ') : 'Unknown';

                    return (
                      <motion.div key={order.id} className="flex flex-col">
                        <button onClick={() => toggleOrder(order.id)} className="flex justify-between items-center py-[16px] w-full active:opacity-60">
                          <span className={`font-inter text-[14px] text-[#16161B] ${isExpanded ? 'font-bold' : 'font-normal'}`}>
                              Order #{order.id.slice(-4)}
                          </span>
                          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                              <ChevronDown size={16} color="#16161B" />
                          </motion.div>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }} 
                                animate={{ height: 'auto', opacity: 1 }} 
                                exit={{ height: 0, opacity: 0 }} 
                                className="overflow-hidden flex flex-col"
                            >
                              <div className="flex flex-col gap-[4px] mt-[8px]">
                                <span className="font-inter text-[14px] font-normal text-[#16161B]">Details</span>
                                <span className="font-inter text-[13px] font-normal text-[#4F4F4F]">Time - {timeStr}</span>
                                <span className="font-inter text-[13px] font-normal text-[#4F4F4F]">Tattoos - {order.items?.length || 0}</span>
                                <span className="font-inter text-[13px] font-normal text-[#4F4F4F]">Codes - {codesStr}</span>
                              </div>
                              <div className="mt-[12px] mb-[12px]">
                                <span className="font-inter text-[14px] font-bold text-[#16161B] uppercase">TOTAL COST - ₹{order.totalPrice}/-</span>
                              </div>
                              <div className="w-full h-[1px] bg-[#16161B] mb-[8px]" />
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {!isExpanded && !isLast && <div className="w-full h-[1px] bg-[#EAEAEA]" />}
                      </motion.div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}