import React from 'react';
import { TabType, TimeRange } from '../types';
import { CURRENT_PORTFOLIO_VALUE, getRangeSummary } from '../data/canonicalData';

interface AccountSummaryProps {
  activeTab: TabType;
  selectedRange: TimeRange;
}

export const AccountSummary: React.FC<AccountSummaryProps> = ({
  activeTab,
  selectedRange,
}) => {
  const summary = getRangeSummary(selectedRange);

  // Formatter for currency
  const formatDollar = (val: number, showSign = false) => {
    const formatted = Math.abs(val).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    if (showSign) {
      return val >= 0 ? `+$${formatted}` : `-$${formatted}`;
    }
    return `$${formatted}`;
  };

  const formatPct = (val: number, showSign = true) => {
    const formatted = Math.abs(val).toFixed(1);
    if (showSign) {
      return val >= 0 ? `+${formatted}%` : `-${formatted}%`;
    }
    return `${formatted}%`;
  };

  // Metric title & value
  const metricTypeLabel = activeTab === 'overview' ? 'investment gain' : 'investment return';
  
  // Derived directly from the canonical dataset
  const dollarGainText = formatDollar(summary.investmentGainDollars, true);
  const pctReturnText = formatPct(summary.portfolioCumulativeReturn, true);

  return (
    <div className="px-5 pt-3 pb-2 text-left">
      <div className="text-[11px] font-bold text-gray-500 tracking-wider uppercase">
        FIDELITY ACCOUNTS
      </div>
      <div className="text-3xl sm:text-[34px] font-extrabold tracking-tight text-gray-900 mt-1">
        ${CURRENT_PORTFOLIO_VALUE.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </div>
      <div className="text-xs text-gray-600 mt-1 font-medium flex items-center gap-1">
        <span>{selectedRange} {metricTypeLabel}</span>
      </div>
      <div className="text-[15px] font-bold text-[#1b873f] mt-0.5 tracking-tight flex items-center gap-1">
        <span>{dollarGainText}</span>
        <span className="font-semibold">({pctReturnText})</span>
      </div>
    </div>
  );
};
