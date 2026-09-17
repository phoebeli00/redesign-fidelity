import React from 'react';
import { TabType } from '../types';

interface TabsNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const TabsNav: React.FC<TabsNavProps> = ({ activeTab, onChangeTab }) => {
  return (
    <div className="w-full border-b border-gray-200 mt-2">
      <div className="flex w-full">
        {/* Overview Tab */}
        <button
          type="button"
          onClick={() => onChangeTab('overview')}
          className={`flex-1 py-3 text-center text-[15px] font-semibold transition-colors relative cursor-pointer ${
            activeTab === 'overview'
              ? 'text-gray-900 font-bold'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          aria-selected={activeTab === 'overview'}
          role="tab"
        >
          <span>Overview</span>
          {activeTab === 'overview' && (
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1b873f] rounded-t-sm" />
          )}
        </button>

        {/* Performance Tab */}
        <button
          type="button"
          onClick={() => onChangeTab('performance')}
          className={`flex-1 py-3 text-center text-[15px] font-semibold transition-colors relative cursor-pointer ${
            activeTab === 'performance'
              ? 'text-gray-900 font-bold'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          aria-selected={activeTab === 'performance'}
          role="tab"
        >
          <span>Performance</span>
          {activeTab === 'performance' && (
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1b873f] rounded-t-sm" />
          )}
        </button>
      </div>
    </div>
  );
};
