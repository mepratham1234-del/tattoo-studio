'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, RefreshCw, Users, Clock, ChevronDown } from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function OwnerDashboard() {
  const router = useRouter();
  
  // State
  const [activeTab, setActiveTab] = useState<'stats' | 'owner'>('stats'); // 'stats' = Personal, 'owner' = Studio Global
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState('Owner');
  
  // Data State
  const [tickets, setTickets] = useState<any[]>([]); // All tickets
  const [personalTickets, setPersonalTickets] = useState<any[]>([]); // Tickets scanned by owner
  const [artistStats, setArtistStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Live Timer State (Personal)
  const [shiftTime, setShiftTime] = useState('0h 0m');

  // 1. INITIALIZE
  useEffect(() => {
    const storedName = localStorage.getItem('studio_user_name');
    if (storedName) setOwnerName(storedName);
    else router.push('/studio'); // Security check

    // Personal Shift Timer
    const tick = () => {
        const start = parseInt(localStorage.getItem('shift_start_time') || Date.now().toString());
        const diff = Date.now() - start;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setShiftTime(`${hours}h ${minutes}m`);
    };
    tick();
    const interval = setInterval(tick, 60000);

    fetchData(); // Load Data
    return () => clearInterval(interval);
  }, []);

  // 2. THE AGGREGATION ENGINE (Fixes Issue 8 & 9)
  const fetchData = async () => {
    setIsRefreshing(true);
    try {
        // Fetch ALL redeemed tickets for the studio
        const q = query(collection(db, 'tickets'), where('status', '==', 'REDEEMED'), orderBy('scannedAt', 'desc'));
        const snapshot = await getDocs(q);
        
        const allData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTickets(allData);

        // Filter for "My Stats" tab
        const myData = allData.filter((t: any) => t.scannedBy === localStorage.getItem('studio_user_name'));
        setPersonalTickets(myData);

        // Calculate Artist Breakdown (Grouping by 'scannedBy')
        const stats: Record<string, number> = {};
        allData.forEach((t: any) => {
            const artist = t.scannedBy || 'Unknown';
            const amount = parseInt(t.totalPrice) || 0;
            if (!stats[artist]) stats[artist] = 0;
            stats[artist] += amount;
        });
        setArtistStats(stats);

    } catch (error) {
        console.error("Dashboard Error:", error);
    } finally {
        setLoading(false);
        setIsRefreshing(false);
    }
  };

  const toggleOrder = (id: string) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  // CALCULATIONS
  // A. Personal Stats
  const myRevenue = personalTickets.reduce((sum, t) => sum + (parseInt(t.totalPrice) || 0), 0);
  const myClients = personalTickets.length;

  // B. Studio Stats
  const studioRevenue = tickets.reduce((sum, t) => sum + (parseInt(t.totalPrice) || 0), 0);

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-sans pb-[80px]">
      
      {/* 1. HEADER */}
      <header className="pt-[40px] px-[24px] flex justify-between items-center">
        <div className="flex items-center gap-[12px]">
          <button onClick={() => router.back()} className="p-2 -ml-2 active:scale-90 transition-transform">
            <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 1.5L2.5 9L13 16.5V1.5Z" fill="#16161B" stroke="#16161B" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="flex flex-col">
            <h1 className="text-[24px] font-extrabold text-[#16161B] uppercase leading-none" style={{ fontFamily: 'var(--font-abhaya), serif' }}>
              DASHBOARD
            </h1>
            <div className="flex items-center gap-[4px] mt-[4px]">
              <div className="w-[4px] h-[4px] rounded-full bg-[#F74B33]" />
              <span className="font-inter text-[10px] text-[#F74B33] font-normal leading-none">Live</span>
              <div className="w-[4px] h-[4px] rounded-full bg-[#16161B] ml-[4px]" />
              <span className="font-inter text-[10px] text-[#16161B] font-normal leading-none">
                Update {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
        
        <button 
            onClick={fetchData} 
            className={`w-[32px] h-[32px] rounded-[8px] border-[2px] border-[#16161B] flex items-center justify-center active:scale-95 transition-all ${isRefreshing ? 'opacity-50' : ''}`}
        >
          <RefreshCw size={16} color="#16161B" strokeWidth={2.5} className={isRefreshing ? "animate-spin" : ""} />
        </button>
      </header>

      {/* 2. SEGMENTED TOGGLE SWITCH */}
      <div className="mt-[24px] flex justify-center px-[24px]">
        <div className="flex items-center relative">
          
          {/* MY STATS (Left) */}
          <div onClick={() => setActiveTab('stats')} className="relative cursor-pointer transition-all duration-300" style={{
              zIndex: activeTab === 'stats' ? 10 : 1,
              background: activeTab === 'stats' ? 'linear-gradient(-45deg, #F74B33, #FFB6AB)' : 'transparent',
              padding: activeTab === 'stats' ? '2px' : '0px', 
              borderRadius: '999px',
              boxShadow: activeTab === 'stats' ? '4px 4px 10px rgba(247, 75, 51, 0.25)' : 'none',
            }}>
            <div className="bg-[#FFFFFF] flex items-center justify-center transition-all duration-300" style={{ 
                borderRadius: '999px', 
                padding: activeTab === 'stats' ? '12px 24px' : '14px 26px',
                border: activeTab === 'stats' ? 'none' : '1px solid #16161B' 
              }}>
              <span className={`font-inter text-[14px] ${activeTab === 'stats' ? 'font-bold' : 'font-medium'} text-[#16161B] uppercase`}>MY STATS</span>
            </div>
          </div>

          {/* OWNER (Right) */}
          <div onClick={() => setActiveTab('owner')} className="relative cursor-pointer transition-all duration-300" style={{
              zIndex: activeTab === 'owner' ? 10 : 1,
              marginLeft: '-24px', // The Overlap
              background: activeTab === 'owner' ? 'linear-gradient(-45deg, #F74B33, #FFB6AB)' : 'transparent',
              padding: activeTab === 'owner' ? '2px' : '0px', 
              borderRadius: '999px',
              boxShadow: activeTab === 'owner' ? '4px 4px 10px rgba(247, 75, 51, 0.25)' : 'none',
            }}>
            <div className="bg-[#FFFFFF] flex items-center justify-center transition-all duration-300" style={{ 
                borderRadius: '999px', 
                padding: activeTab === 'owner' ? '12px 32px' : '14px 34px 14px 40px',
                border: activeTab === 'owner' ? 'none' : '1px solid #16161B' 
              }}>
              <span className={`font-inter text-[14px] ${activeTab === 'owner' ? 'font-bold' : 'font-medium'} text-[#16161B] uppercase`}>OWNER</span>
            </div>
          </div>

        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ========================================= */}
        {/* TAB 1: OWNER'S PERSONAL STATS             */}
        {/* ========================================= */}
        {activeTab === 'stats' && (
          <motion.div key="stats-view" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
            
            <div className="mt-[32px] px-[24px]">
              <h2 className="font-inter text-[28px] font-extrabold text-[#16161B] uppercase leading-tight">HELLO, {ownerName}</h2>
              <p className="font-inter text-[12px] font-medium text-[#16161B] uppercase tracking-[0.05em] mt-[4px]">YOUR DAILY PERFORMANCE</p>
            </div>

            <div className="mt-[20px] px-[24px] flex flex-col gap-[16px]">
              <div style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '12px', boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.08)' }}>
                <div className="bg-[#FFFFFF] rounded-[11px] p-[20px] w-full h-full flex flex-col justify-center">
                  <span className="font-inter text-[12px] font-normal text-[#16161B] uppercase">REVENUE GENERATED</span>
                  <span className="font-inter text-[56px] font-extrabold text-[#16161B] leading-[1.1] mt-[8px]">₹{myRevenue}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-[16px]">
                <div style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '12px', boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.08)' }}>
                  <div className="bg-[#FFFFFF] rounded-[11px] p-[20px] w-full h-full flex flex-col justify-between min-h-[140px]">
                    <Users size={24} color="#F74B33" strokeWidth={1.5} className="mb-[16px]" />
                    <div className="flex flex-col">
                      <span className="font-inter text-[10px] font-normal text-[#16161B] uppercase mb-[2px]">CLIENTS ATTENDED</span>
                      <span className="font-inter text-[28px] font-bold text-[#16161B] leading-tight">{myClients}</span>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '12px', boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.08)' }}>
                  <div className="bg-[#FFFFFF] rounded-[11px] p-[20px] w-full h-full flex flex-col justify-between min-h-[140px]">
                    <Clock size={24} color="#16161B" strokeWidth={1.5} className="mb-[16px]" />
                    <div className="flex flex-col">
                      <span className="font-inter text-[10px] font-normal text-[#16161B] uppercase mb-[2px]">SHIFT TIME</span>
                      <span className="font-inter text-[24px] font-bold text-[#16161B] leading-tight">{shiftTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PERSONAL HISTORY */}
            <div className="mt-[24px] px-[24px]">
              <div style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '12px', boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.08)' }}>
                <div className="bg-[#FFFFFF] rounded-[11px] py-[16px] px-[20px] w-full h-full">
                  <h3 className="font-inter text-[14px] font-normal text-[#16161B]">MY ORDER HISTORY</h3>
                  <div className="w-full h-[1px] bg-[#16161B] mt-[8px] mb-[8px]" />

                  <div className="flex flex-col">
                    {personalTickets.length === 0 ? <p className="text-[12px] text-gray-400 py-4 text-center">No personal sales yet.</p> : personalTickets.map((order, index) => {
                      const isExpanded = expandedOrder === order.id;
                      const isLast = index === personalTickets.length - 1;
                      const timeStr = order.scannedAt ? new Date(order.scannedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A';
                      const codesStr = order.items ? order.items.map((i:any) => i.code).join(', ') : 'Unknown';

                      return (
                        <div key={order.id} className="flex flex-col">
                          <button onClick={() => toggleOrder(order.id)} className="flex justify-between items-center py-[16px] w-full">
                            <span className={`font-inter text-[14px] text-[#16161B] ${isExpanded ? 'font-bold' : 'font-normal'}`}>Order #{order.id.slice(-4)}</span>
                            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}><ChevronDown size={16} color="#16161B" /></motion.div>
                          </button>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden flex flex-col">
                                <div className="flex flex-col gap-[4px] mt-[8px]">
                                  <span className="font-inter text-[14px] font-normal text-[#16161B]">Details</span>
                                  <span className="font-inter text-[13px] font-normal text-[#4F4F4F]">Time- {timeStr}</span>
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
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================= */}
        {/* TAB 2: STUDIO TOTAL STATS (Aggregated)    */}
        {/* ========================================= */}
        {activeTab === 'owner' && (
          <motion.div key="owner-view" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
            
            {/* TOTAL STUDIO SALES CARD */}
            <div className="mt-[32px] px-[24px]">
              <div style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '12px', boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.08)' }}>
                <div className="bg-[#FFFFFF] rounded-[11px] p-[20px] w-full h-full flex flex-col justify-center">
                  <div className="flex items-center gap-[6px]">
                    <div className="w-[16px] h-[16px] border border-[#16161B] rounded-[4px] flex items-center justify-center">
                      <div className="w-[8px] h-[8px] border-b border-r border-[#16161B] transform rotate-45 -mt-[2px]" />
                    </div>
                    <span className="font-inter text-[12px] font-normal text-[#16161B] uppercase">TOTAL STUDIO SALES</span>
                  </div>
                  <span className="font-inter text-[56px] font-extrabold text-[#16161B] leading-[1.1] mt-[8px]">₹{studioRevenue}</span>
                </div>
              </div>
            </div>

            {/* ARTIST BREAK DOWN LIST (Fixes Issue 8) */}
            <div className="mt-[24px] px-[24px]">
               <h3 className="font-inter text-[12px] font-normal text-[#16161B] uppercase mb-[8px]">ARTIST BREAK DOWN</h3>
               
               <div style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '12px', boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.08)' }}>
                <div className="bg-[#FFFFFF] rounded-[11px] py-[20px] px-[20px] w-full h-full flex flex-col gap-[20px]">
                  
                  {Object.keys(artistStats).length === 0 ? (
                      <p className="text-[12px] text-gray-400">No data available.</p>
                  ) : (
                      Object.entries(artistStats).map(([name, revenue], index) => (
                        <div key={name} className={`flex flex-col gap-[6px] ${index !== Object.keys(artistStats).length -1 ? 'border-b border-[#16161B] pb-[16px]' : ''}`}>
                          <span className="font-inter text-[14px] font-normal text-[#16161B]">{name}</span>
                          <span className="font-inter text-[14px] font-bold text-[#16161B]">Revenue Generated - ₹{revenue}/-</span>
                        </div>
                      ))
                  )}

                </div>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}