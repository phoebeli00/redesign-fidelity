import React from 'react';
import { Search, User, Wifi } from 'lucide-react';
import { FidelityIcon } from './FidelityIcon';

export const Header: React.FC = () => {
  return (
    <header className="w-full bg-white select-none shrink-0 border-b border-gray-100">
      {/* iOS Status Bar */}
      <div className="h-10 px-7 flex items-center justify-between text-black text-xs font-semibold tracking-tight">
        <span>9:41</span>
        <div className="flex items-center space-x-1.5">
          {/* Cellular signal bars */}
          <div className="flex items-end space-x-0.5 h-3">
            <div className="w-[3px] h-1 bg-black rounded-xs"></div>
            <div className="w-[3px] h-1.5 bg-black rounded-xs"></div>
            <div className="w-[3px] h-2 bg-black rounded-xs"></div>
            <div className="w-[3px] h-2.5 bg-black rounded-xs"></div>
          </div>
          {/* Wifi icon */}
          <Wifi className="w-3.5 h-3.5 text-black stroke-[2.2]" />
          {/* Battery */}
          <div className="w-5 h-2.5 border border-black rounded-[4px] p-0.5 flex items-center">
            <div className="w-3 h-1.5 bg-black rounded-xs"></div>
          </div>
        </div>
      </div>

      {/* App Bar */}
      <div className="px-5 py-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <FidelityIcon size={26} />
          <span className="text-xl font-bold tracking-tight text-gray-900 font-sans">
            Fidelity
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <button
            type="button"
            className="text-gray-700 hover:text-black transition-colors p-1 rounded-full hover:bg-gray-100"
            aria-label="Search"
            title="Search"
          >
            <Search className="w-5 h-5 stroke-[2.2]" />
          </button>
          <button
            type="button"
            className="text-gray-700 hover:text-black transition-colors p-1 rounded-full hover:bg-gray-100"
            aria-label="Account Profile"
            title="Account Profile"
          >
            <div className="w-7 h-7 rounded-full border border-gray-800 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-800 stroke-[2]" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
