import React from 'react';
import { Home, BarChart2, CircleDashed, LayoutGrid } from 'lucide-react';

export const BottomNav: React.FC = () => {
  return (
    <nav className="w-full bg-white border-t border-gray-150 pt-2 pb-5 px-3 select-none shrink-0" aria-label="Bottom Navigation">
      <div className="flex items-end justify-around">
        {/* Home */}
        <button
          type="button"
          className="flex flex-col items-center cursor-pointer group w-14"
          aria-label="Home"
        >
          <div className="w-6 h-6 flex items-center justify-center text-[#1b873f]">
            <Home className="w-5 h-5 fill-[#1b873f] stroke-[#1b873f]" />
          </div>
          <span className="text-[11px] font-bold text-[#1b873f] mt-1">Home</span>
        </button>

        {/* Investing */}
        <button
          type="button"
          className="flex flex-col items-center cursor-pointer group w-14"
          aria-label="Investing"
        >
          <div className="w-6 h-6 flex items-center justify-center text-gray-500 group-hover:text-gray-900 transition">
            <BarChart2 className="w-5 h-5 stroke-[2]" />
          </div>
          <span className="text-[11px] font-medium text-gray-600 group-hover:text-gray-900 mt-1">
            Investing
          </span>
        </button>

        {/* Transact (Green Floating Action Pill) */}
        <button
          type="button"
          className="flex flex-col items-center cursor-pointer group -mt-1 w-14"
          aria-label="Transact"
        >
          <div className="w-9 h-9 rounded-full bg-[#1b873f] flex items-center justify-center shadow-xs text-white group-hover:bg-[#167034] transition">
            <span className="text-base font-extrabold font-sans">$</span>
          </div>
          <span className="text-[11px] font-medium text-gray-600 group-hover:text-gray-900 mt-1">
            Transact
          </span>
        </button>

        {/* Planning */}
        <button
          type="button"
          className="flex flex-col items-center cursor-pointer group w-14"
          aria-label="Planning"
        >
          <div className="w-6 h-6 flex items-center justify-center text-gray-500 group-hover:text-gray-900 transition">
            <CircleDashed className="w-5 h-5 stroke-[2]" />
          </div>
          <span className="text-[11px] font-medium text-gray-600 group-hover:text-gray-900 mt-1">
            Planning
          </span>
        </button>

        {/* Discover */}
        <button
          type="button"
          className="flex flex-col items-center cursor-pointer group w-14"
          aria-label="Discover"
        >
          <div className="w-6 h-6 flex items-center justify-center text-gray-500 group-hover:text-gray-900 transition">
            <LayoutGrid className="w-5 h-5 stroke-[2]" />
          </div>
          <span className="text-[11px] font-medium text-gray-600 group-hover:text-gray-900 mt-1">
            Discover
          </span>
        </button>
      </div>

      {/* iOS Home Indicator Bar */}
      <div className="w-32 h-1 bg-black rounded-full mx-auto mt-3" />
    </nav>
  );
};
