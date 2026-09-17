import React from 'react';
import { ChevronRight } from 'lucide-react';

export const AccountsList: React.FC = () => {
  return (
    <div className="px-5 pt-3 pb-6">
      {/* Title */}
      <h2 className="text-lg font-extrabold text-gray-900 mb-3 tracking-tight">
        All accounts
      </h2>

      {/* Group 1: INVESTMENT */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-500 tracking-wider mb-2">
          <span>INVESTMENT</span>
          <span className="text-gray-700 font-bold">$18,251.04</span>
        </div>

        {/* Individual Card */}
        <div className="bg-white border border-gray-150 rounded-2xl p-3.5 shadow-2xs hover:shadow-xs transition flex items-center justify-between cursor-pointer group">
          <div className="flex items-center space-x-3">
            {/* Green accent strip */}
            <div className="w-1 h-9 bg-[#1b873f] rounded-full" />
            <div>
              <div className="text-sm font-bold text-gray-900 tracking-tight">
                INDIVIDUAL
              </div>
              <div className="text-xs text-gray-500 font-medium">Z25996829</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className="text-sm font-bold text-gray-900">$18,251.04</div>
              <div className="text-xs font-semibold text-[#1b873f]">
                +$11.87 (+0.07%)
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition" />
          </div>
        </div>
      </div>

      {/* Group 2: PROFESSIONALLY MANAGED */}
      <div>
        <div className="flex items-center justify-between text-xs font-semibold text-gray-500 tracking-wider mb-2">
          <span>PROFESSIONALLY MANAGED</span>
          <span className="text-gray-700 font-bold">$9,184.70</span>
        </div>

        {/* Wealth Advisory Card */}
        <div className="bg-white border border-gray-150 rounded-2xl p-3.5 shadow-2xs hover:shadow-xs transition flex items-center justify-between cursor-pointer group">
          <div className="flex items-center space-x-3">
            {/* Green accent strip */}
            <div className="w-1 h-9 bg-[#1b873f] rounded-full" />
            <div>
              <div className="text-sm font-bold text-gray-900 tracking-tight">
                Wealth Advisory – Fidelity Go
              </div>
              <div className="text-xs text-gray-500 font-medium">Z12345678</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className="text-sm font-bold text-gray-900">$9,184.70</div>
              <div className="text-xs font-semibold text-[#1b873f]">
                +$20.06 (+0.22%)
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition" />
          </div>
        </div>
      </div>
    </div>
  );
};
