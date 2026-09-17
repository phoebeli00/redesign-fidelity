import React, { useState } from 'react';
import { TabType, TimeRange, BenchmarkId, OverviewView } from './types';
import { Header } from './components/Header';
import { AccountSummary } from './components/AccountSummary';
import { TabsNav } from './components/TabsNav';
import { BenchmarkSelector } from './components/BenchmarkSelector';
import { TimeControls } from './components/TimeControls';
import { OverviewChart } from './components/OverviewChart';
import { BreakdownWaterfall } from './components/BreakdownWaterfall';
import { PerformanceChart } from './components/PerformanceChart';
import { AccountsList } from './components/AccountsList';
import { BottomNav } from './components/BottomNav';
import { TableViewModal } from './components/TableViewModal';
import { Smartphone, Monitor } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [overviewView, setOverviewView] = useState<OverviewView>('trend');
  const [selectedRange, setSelectedRange] = useState<TimeRange>('YTD');
  const [benchmarkId, setBenchmarkId] = useState<BenchmarkId>('sp500');
  const [isTableOpen, setIsTableOpen] = useState(false);
  const [deviceFrame, setDeviceFrame] = useState(true);

  return (
    <div className="min-h-screen bg-[#f1f3f5] flex flex-col items-center justify-start py-0 sm:py-6 selection:bg-emerald-200">
      {/* Top Prototype Helper Bar on wider screens */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-[430px] mb-2 px-2 text-xs text-gray-500">
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span className="font-semibold text-gray-700">Fidelity Redesign Prototype</span>
        </div>
        <button
          type="button"
          onClick={() => setDeviceFrame((prev) => !prev)}
          className="flex items-center space-x-1 hover:text-gray-900 font-medium bg-white/70 px-2 py-1 rounded-md border border-gray-200 shadow-2xs transition cursor-pointer"
          title="Toggle phone frame"
        >
          {deviceFrame ? (
            <>
              <Monitor className="w-3.5 h-3.5" />
              <span>Full Width</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5" />
              <span>Phone Frame</span>
            </>
          )}
        </button>
      </div>

      {/* Main Mobile App Frame */}
      <div
        className={`w-full bg-white flex flex-col transition-all duration-200 ${
          deviceFrame
            ? 'sm:max-w-[420px] sm:rounded-[44px] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] sm:border-[8px] sm:border-gray-900 sm:overflow-hidden relative sm:min-h-[880px]'
            : 'max-w-2xl shadow-md min-h-screen'
        }`}
      >
        {/* Dynamic Island / Notch on Phone Frame */}
        {deviceFrame && (
          <div className="hidden sm:block absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40" />
        )}

        {/* 1. iOS Status Bar & Fidelity App Header */}
        <Header />

        {/* Scrollable Account Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-white">
          {/* 2. Account Summary ($27,435.74 and Selected Period Return/Gain) */}
          <AccountSummary
            activeTab={activeTab}
            selectedRange={selectedRange}
          />

          {/* 3. Equal Tabs: Overview and Performance */}
          <TabsNav
            activeTab={activeTab}
            onChangeTab={(tab) => setActiveTab(tab)}
          />

          {/* 4. Benchmark Selector Bar (Only in Performance Tab) */}
          {activeTab === 'performance' && (
            <BenchmarkSelector
              currentBenchmark={benchmarkId}
              onSelectBenchmark={(id) => setBenchmarkId(id)}
            />
          )}

          {/* 5. Time Controls (1M, YTD, 1Y, 3Y) + Narrow Trend/Breakdown + Table View Button */}
          <TimeControls
            selectedRange={selectedRange}
            onSelectRange={(range) => setSelectedRange(range)}
            onOpenTable={() => setIsTableOpen(true)}
            activeTab={activeTab}
            overviewView={overviewView}
            onChangeOverviewView={(v) => setOverviewView(v)}
          />

          {/* 6. Primary Interactive Chart / Breakdown Waterfall */}
          {activeTab === 'overview' ? (
            overviewView === 'trend' ? (
              <OverviewChart selectedRange={selectedRange} />
            ) : (
              <BreakdownWaterfall selectedRange={selectedRange} />
            )
          ) : (
            <PerformanceChart
              selectedRange={selectedRange}
              benchmarkId={benchmarkId}
            />
          )}

          {/* Visual Divider */}
          <div className="h-2 bg-gray-100/70 border-t border-b border-gray-150 my-1" />

          {/* 7. Accounts List (INDIVIDUAL and Fidelity Go) */}
          <AccountsList />
        </main>

        {/* 8. Bottom Navigation Bar */}
        <BottomNav />
      </div>

      {/* Modal Data Table View */}
      <TableViewModal
        isOpen={isTableOpen}
        onClose={() => setIsTableOpen(false)}
        activeTab={activeTab}
        overviewView={overviewView}
        selectedRange={selectedRange}
        benchmarkId={benchmarkId}
      />
    </div>
  );
}
