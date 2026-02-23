'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, RefreshCw, Users, Clock, ChevronDown } from 'lucide-react';

const MOCK_ORDERS = [
  { id: '1', time: '10:30PM', count: 2, codes: '01,02', total: 250 },
  { id: '2', time: '08:15PM', count: 1, codes: '104', total: 150 },
  { id: '3', time: '06:00PM', count: 3, codes: '99,12,45', total: 450 },
  { id: '4', time: '04:30PM', count: 1, codes: '33', total: 150 },
];

export default function ArtistDashboard() {
  const router = useRouter();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const toggleOrder = (id: string) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-sans pb-[80px]">
      
      {/* 1. TOP NAVIGATION HEADER */}
      <header className="pt-[40px] px-[24px] flex justify-between items-center">
        <div className="flex items-center gap-[12px]">
          <button onClick={() => router.back()} className="p-1 -ml-1">
            <ChevronLeft size={24} color="#16161B" strokeWidth={2.5} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-[24px] font-extrabold text-[#16161B] uppercase leading-none" style={{ fontFamily: 'var(--font-abhaya), serif' }}>
              DASHBOARD
            </h1>
            <div className="flex items-center gap-[4px] mt-[4px]">
              <div className="w-[4px] h-[4px] rounded-full bg-[#F74B33]" />
              <span className="font-inter text-[10px] text-[#F74B33] font-normal leading-none">Live</span>
              <div className="w-[4px] h-[4px] rounded-full bg-[#16161B] ml-[4px]" />
              <span className="font-inter text-[10px] text-[#16161B] font-normal leading-none">Update 10:31:58 PM</span>
            </div>
          </div>
        </div>
        
        <button className="w-[32px] h-[32px] rounded-[8px] border-[2px] border-[#16161B] flex items-center justify-center">
          <RefreshCw size={16} color="#16161B" strokeWidth={2.5} />
        </button>
      </header>

      {/* 2. "MY STATS" FLOATING PILL BUTTON */}
      <div className="mt-[24px] flex justify-center">
        <div style={{
          background: 'linear-gradient(-45deg, #F74B33, #FFB6AB)',
          padding: '2px', 
          borderRadius: '999px',
          boxShadow: '4px 4px 10px rgba(247, 75, 51, 0.25)' 
        }}>
          <button className="bg-[#FFFFFF] rounded-full flex items-center justify-center" style={{ padding: '12px 24px' }}>
            <span className="font-inter text-[14px] font-bold text-[#16161B] uppercase tracking-wide leading-none">
              MY STATS
            </span>
          </button>
        </div>
      </div>

      {/* 3. GREETING SECTION */}
      <div className="mt-[32px] px-[24px]">
        <h2 className="font-inter text-[28px] font-extrabold text-[#16161B] uppercase leading-tight">
          HELLO, RAHUL
        </h2>
        <p className="font-inter text-[12px] font-medium text-[#16161B] uppercase tracking-[0.05em] mt-[4px]">
          YOUR DAILY PERFORMANCE
        </p>
      </div>

      {/* 4. DAILY PERFORMANCE CARDS */}
      <div className="mt-[20px] px-[24px] flex flex-col gap-[16px]">
        {/* Card A: Revenue */}
        <div style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '12px', boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.08)' }}>
          <div className="bg-[#FFFFFF] rounded-[11px] p-[20px] w-full h-full flex flex-col justify-center">
            <span className="font-inter text-[12px] font-normal text-[#16161B] uppercase">REVENUE GENERATED</span>
            <span className="font-inter text-[56px] font-extrabold text-[#16161B] leading-[1.1] mt-[8px]">0</span>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-2 gap-[16px]">
          <div style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '12px', boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.08)' }}>
            <div className="bg-[#FFFFFF] rounded-[11px] p-[20px] w-full h-full flex flex-col justify-between">
              <Users size={24} color="#F74B33" strokeWidth={1.5} className="mb-[16px]" />
              <div className="flex flex-col">
                <span className="font-inter text-[10px] font-normal text-[#16161B] uppercase mb-[2px]">CLIENTS ATTENDED</span>
                <span className="font-inter text-[28px] font-bold text-[#16161B] leading-tight">0</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '12px', boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.08)' }}>
            <div className="bg-[#FFFFFF] rounded-[11px] p-[20px] w-full h-full flex flex-col justify-between">
              <Clock size={24} color="#16161B" strokeWidth={1.5} className="mb-[16px]" />
              <div className="flex flex-col">
                <span className="font-inter text-[10px] font-normal text-[#16161B] uppercase mb-[2px]">SHIFT TIME</span>
                <span className="font-inter text-[24px] font-bold text-[#16161B] leading-tight">0h 0min</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. ORDER HISTORY */}
      <div className="mt-[24px] px-[24px]">
        <div style={{ background: 'linear-gradient(-45deg, #BDBDBD, #4F4F4F)', padding: '1px', borderRadius: '12px', boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.08)' }}>
          <div className="bg-[#FFFFFF] rounded-[11px] py-[16px] px-[20px] w-full h-full">
            <h3 className="font-inter text-[14px] font-normal text-[#16161B]">ORDER HISTORY</h3>
            <div className="w-full h-[1px] bg-[#16161B] mt-[8px] mb-[8px]" />

            <div className="flex flex-col">
              {MOCK_ORDERS.map((order, index) => {
                const isExpanded = expandedOrder === order.id;
                const isLast = index === MOCK_ORDERS.length - 1;

                return (
                  <div key={order.id} className="flex flex-col">
                    <button onClick={() => toggleOrder(order.id)} className="flex justify-between items-center py-[16px] w-full">
                      <span className={`font-inter text-[14px] text-[#16161B] ${isExpanded ? 'font-bold' : 'font-normal'}`}>Order {order.id}</span>
                      <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}><ChevronDown size={16} color="#16161B" /></motion.div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden flex flex-col">
                          <div className="flex flex-col gap-[4px] mt-[8px]">
                            <span className="font-inter text-[14px] font-normal text-[#16161B]">Details</span>
                            <span className="font-inter text-[13px] font-normal text-[#4F4F4F]">Time- {order.time}</span>
                            <span className="font-inter text-[13px] font-normal text-[#4F4F4F]">Number of Tattoo - {order.count}</span>
                            <span className="font-inter text-[13px] font-normal text-[#4F4F4F]">Code - {order.codes}</span>
                          </div>
                          <div className="mt-[12px] mb-[12px]">
                            <span className="font-inter text-[14px] font-bold text-[#16161B] uppercase">TOTAL COST - {order.total}/-</span>
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
    </div>
  );
}