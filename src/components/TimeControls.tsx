import React from 'react';
import { Table } from 'lucide-react';
import { OverviewView, TabType, TimeRange } from '../types';

interface TimeControlsProps {
  selectedRange: TimeRange;
  onSelectRange: (range: TimeRange) => void;
  onOpenTable: () => void;
  activeTab: TabType;
  overviewView: OverviewView;
  onChangeOverviewView: (view: OverviewView) => void;
}

export const TimeControls: React.FC<TimeControlsProps> = ({
  selectedRange,
  onSelectRange,
  onOpenTable,
  activeTab,
  overviewView,
  onChangeOverviewView,
}) => {
  const ranges: TimeRange[] = ['1M', 'YTD', '1Y', '3Y'];

  return (
    <div className="px-5 pt-3 pb-1 space-y-2.5">
      {/* Row 1: Time Range Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {ranges.map((range) => {
            const isActive = range === selectedRange;
            return (
              <button
                key={range}
                type="button"
                onClick={() => onSelectRange(range)}
                className={`px-3.5 py-1 text-sm font-bold rounded-full transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#215732] text-white shadow-xs'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
                aria-pressed={isActive}
              >
                {range}
              </button>
            );
          })}
        </div>

        {/* If in Performance tab, show Table button on Row 1 right side */}
        {activeTab === 'performance' && (
          <button
            type="button"
            onClick={onOpenTable}
            className="w-8 h-8 rounded-lg border border-gray-200/90 bg-white hover:bg-gray-50 active:bg-gray-100 flex items-center justify-center text-slate-700 transition cursor-pointer shadow-2xs"
            title="Open Table View"
            aria-label="Open Table View"
          >
            <Table className="w-4 h-4 text-slate-700 stroke-[2]" />
          </button>
        )}
      </div>

      {/* Row 2: In Overview tab, Narrow Trend | Breakdown Segmented Control with Table Button to its right */}
      {activeTab === 'overview' && (
        <div className="flex items-center justify-end space-x-2">
          {/* Narrow Trend | Breakdown Segmented Control */}
          <div className="inline-flex bg-gray-100/90 p-0.5 rounded-lg border border-gray-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => onChangeOverviewView('trend')}
              className={`px-3 py-1 text-xs rounded-md transition-all cursor-pointer ${
                overviewView === 'trend'
                  ? 'bg-[#15803d] text-white font-bold shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 font-medium'
              }`}
              aria-selected={overviewView === 'trend'}
              role="tab"
            >
              Trend
            </button>
            <button
              type="button"
              onClick={() => onChangeOverviewView('breakdown')}
              className={`px-3 py-1 text-xs rounded-md transition-all cursor-pointer ${
                overviewView === 'breakdown'
                  ? 'bg-[#15803d] text-white font-bold shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 font-medium'
              }`}
              aria-selected={overviewView === 'breakdown'}
              role="tab"
            >
              Breakdown
            </button>
          </div>

          {/* Table Button right next to Trend | Breakdown */}
          <button
            type="button"
            onClick={onOpenTable}
            className="w-8 h-8 rounded-lg border border-gray-200/90 bg-white hover:bg-gray-50 active:bg-gray-100 flex items-center justify-center text-slate-700 transition cursor-pointer shadow-2xs"
            title="Open Table View"
            aria-label="Open Table View"
          >
            <Table className="w-4 h-4 text-slate-700 stroke-[2]" />
          </button>
        </div>
      )}
    </div>
  );
};
