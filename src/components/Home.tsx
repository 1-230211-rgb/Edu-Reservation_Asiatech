import React from 'react';
import { Page } from '../types';
import { motion } from 'motion/react';
import { Alert } from 'react-bootstrap';

interface HomeProps {
  setPage: (page: Page) => void;
}

export const Home: React.FC<HomeProps> = ({ setPage }) => {
  return (
    <div className="p-4 lg:p-8 space-y-8 lg:space-y-12 bg-white min-h-full">
      {/* Hero Banner */}
      <div className="relative h-48 lg:h-80 rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl border-2 lg:border-4 border-white">
        <img 
          src="/banner.jpg" 
          alt="School Banner" 
          className="w-full h-full object-cover brightness-75"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/school-banner/1200/400';
          }}
        />
          
          <div className="absolute top-2 lg:top-4 right-2 lg:right-4 bg-white/20 backdrop-blur-md px-3 lg:px-4 py-1 lg:py-2 rounded-full text-white text-[8px] lg:text-xs font-bold tracking-widest uppercase">
            PRESCHOOL • GRADE SCHOOL • JUNIOR HIGH AND SENIOR HIGH SCHOOL
          </div>
        </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start py-8">
        <div className="space-y-8 lg:space-y-10">
          <h1 className="text-[140px] lg:text-[20rem] xl:text-[24rem] font-serif font-black text-[#143b1c] leading-[0.7] tracking-[-0.08em] uppercase text-justify">
            WEAR <br />
            SUCCESS <br />
            EVERY <br />
            DAY
          </h1>
          
          <div className="max-w-md space-y-8">
            <p className="text-gray-600 text-lg lg:text-2xl font-medium leading-relaxed">
              Empowering students with confidence, discipline, and excellence—one uniform at a time.
            </p>
            
            <button 
              onClick={() => setPage('track')}
              className="w-full lg:w-auto px-10 lg:px-12 py-5 lg:py-6 bg-[#4ade80] hover:bg-[#22c55e] text-white font-black text-xl lg:text-2xl rounded-2xl lg:rounded-[2rem] shadow-2xl transition-all transform hover:scale-[1.05] active:scale-[0.95]"
            >
              TRACK RESERVED ITEMS
            </button>
          </div>
        </div>

        <div className="relative group self-center">
          <div className="absolute inset-0 bg-[#4ade80]/10 rounded-2xl lg:rounded-[3rem] transform rotate-3 scale-105 group-hover:rotate-0 transition-transform duration-500"></div>
          <img 
            src="/students.jpg" 
            alt="Students" 
            className="relative w-full h-[300px] lg:h-[600px] object-cover rounded-2xl lg:rounded-[3rem] shadow-2xl border-4 lg:border-8 border-white"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/students/600/800';
            }}
          />
          
        </div>
      </div>
    </div>
  );
};
