import React, { useEffect } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { BenchmarkId, OverviewView, TabType, TimeRange } from '../types';
import {
  BENCHMARK_OPTIONS,
  CANONICAL_MONTHLY_RECORDS,
  CURRENT_PORTFOLIO_VALUE,
  getBenchmarkReturn,
  getRangeConfig,
  getRangeSummary,
} from '../data/canonicalData';

interface TableViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: TabType;
  overviewView?: OverviewView;
  selectedRange: TimeRange;
  benchmarkId: BenchmarkId;
}

export const TableViewModal: React.FC<TableViewModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  overviewView = 'trend',
  selectedRange,
  benchmarkId,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const config = getRangeConfig(selectedRange);
  const records = CANONICAL_MONTHLY_RECORDS.slice(config.startMonthIndex);
  const benchmarkOpt = BENCHMARK_OPTIONS.find((b) => b.id === benchmarkId);
  const summary = getRangeSummary(selectedRange);

  // Pre-calculate compounded returns for performance view
  let runningCompoundPort = 1.0;
  let runningCompoundBench = 1.0;
  const performanceRows = records.map((r) => {
    runningCompoundPort *= 1.0 + r.portfolioReturn / 100.0;
    const benchRet = getBenchmarkReturn(r, benchmarkId);
    runningCompoundBench *= 1.0 + benchRet / 100.0;

    return {
      record: r,
      cumPortReturn: (runningCompoundPort - 1.0) * 100,
      cumBenchReturn: (runningCompoundBench - 1.0) * 100,
    };
  });

  const formatDollar = (val: number, showSign = false) => {
    const formatted = Math.abs(val).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    if (showSign) {
      return val >= 0 ? `+$${formatted}` : `−$${formatted}`;
    }
    return `$${formatted}`;
  };

  const formatPct = (val: number) =>
    `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;

  let title = 'Overview Trend Data Table';
  if (activeTab === 'performance') {
    title = 'Performance Data Table';
  } else if (overviewView === 'breakdown') {
    title = 'Overview Breakdown Summary Table';
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="table-modal-title"
    >
      <div
        className="w-full max-w-xl max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
          <div>
            <h2 id="table-modal-title" className="text-base font-bold text-gray-900">
              {title}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Time horizon: <span className="font-semibold text-gray-700">{selectedRange}</span> ({records.length} periods)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-200/60 transition cursor-pointer"
            aria-label="Close table view"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {activeTab === 'performance' ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100/80 sticky top-0 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-3">Month</th>
                  <th className="py-2.5 px-2 text-right">Monthly Return</th>
                  <th className="py-2.5 px-2 text-right">Compounded Return</th>
                  <th className="py-2.5 px-3 text-right">
                    {benchmarkOpt ? benchmarkOpt.name : 'Benchmark'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {performanceRows.map(({ record: r, cumPortReturn, cumBenchReturn }) => (
                  <tr key={r.month} className="hover:bg-gray-50/60 text-gray-700">
                    <td className="py-2.5 px-3 whitespace-nowrap font-medium text-gray-900">
                      {r.label}
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <span
                        className={
                          r.portfolioReturn >= 0 ? 'text-emerald-700' : 'text-rose-600'
                        }
                      >
                        {formatPct(r.portfolioReturn)}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-right font-bold text-gray-900">
                      <span
                        className={
                          cumPortReturn >= 0 ? 'text-emerald-700' : 'text-rose-600'
                        }
                      >
                        {formatPct(cumPortReturn)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-gray-600">
                      {benchmarkId === 'none' ? '—' : formatPct(cumBenchReturn)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : overviewView === 'breakdown' ? (
            /* Overview Breakdown Summary Table */
            <div className="p-4 space-y-4 text-xs">
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-[11.5px] text-emerald-950">
                  <span className="font-bold">Waterfall Equation Validated:</span>
                  <div className="font-mono text-emerald-900 mt-1">
                    {formatDollar(summary.startingValue)} (Starting) + {formatDollar(summary.netCashFlow, true)} (Net Cash) + {formatDollar(summary.investmentGainDollars, true)} (Gain) = {formatDollar(CURRENT_PORTFOLIO_VALUE)} (Current)
                  </div>
                </div>
              </div>

              <div className="overflow-hidden border border-gray-200 rounded-xl shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-3">Waterfall Step</th>
                      <th className="py-2.5 px-3">Period / Details</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-3 text-right">% of Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="bg-slate-50/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">1. Starting Value</td>
                      <td className="py-2.5 px-3 text-gray-500">{config.startDateLabel}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        {formatDollar(summary.startingValue)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-gray-500">
                        {((summary.startingValue / CURRENT_PORTFOLIO_VALUE) * 100).toFixed(1)}%
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-gray-800">2. Net Cash Flow</td>
                      <td className="py-2.5 px-3 text-gray-500">
                        +{formatDollar(summary.totalDeposits)} dep / −{formatDollar(summary.totalWithdrawals)} wdl
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-gray-800">
                        {formatDollar(summary.netCashFlow, true)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-gray-500">
                        {((summary.netCashFlow / CURRENT_PORTFOLIO_VALUE) * 100).toFixed(1)}%
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-emerald-800">3. Investment Gain</td>
                      <td className="py-2.5 px-3 text-gray-500">
                        Cumulative Return: {formatPct(summary.portfolioCumulativeReturn)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#1b873f]">
                        {formatDollar(summary.investmentGainDollars, true)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-700 font-medium">
                        {((summary.investmentGainDollars / CURRENT_PORTFOLIO_VALUE) * 100).toFixed(1)}%
                      </td>
                    </tr>
                    <tr className="bg-emerald-50/40 font-bold border-t-2 border-gray-200">
                      <td className="py-2.5 px-3 text-[#14532d]">4. Current Value</td>
                      <td className="py-2.5 px-3 text-gray-600 font-medium">{config.endDateLabel}</td>
                      <td className="py-2.5 px-3 text-right text-[#14532d]">
                        {formatDollar(CURRENT_PORTFOLIO_VALUE)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-gray-800">100.0%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Monthly breakdown table for context */}
              <div className="mt-3">
                <h4 className="font-bold text-gray-800 mb-2">Monthly Cash Flow & Balance Log</h4>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-100/70 text-gray-600 font-semibold border-b border-gray-200">
                      <tr>
                        <th className="py-2 px-3">Month</th>
                        <th className="py-2 px-2 text-right">Deposits</th>
                        <th className="py-2 px-2 text-right">Withdrawals</th>
                        <th className="py-2 px-2 text-right">Monthly Return</th>
                        <th className="py-2 px-3 text-right">Ending Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {records.map((r) => (
                        <tr
                          key={r.month}
                          className={r.month === '2026-03' ? 'bg-amber-50/70 font-semibold' : 'hover:bg-gray-50/60'}
                        >
                          <td className="py-2 px-3">{r.label}</td>
                          <td className="py-2 px-2 text-right text-emerald-600 font-medium">
                            +{formatDollar(r.deposit)}
                          </td>
                          <td className="py-2 px-2 text-right">
                            {r.withdrawal > 0 ? (
                              <span className="text-rose-600 font-bold">−{formatDollar(r.withdrawal)}</span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-right">
                            <span className={r.portfolioReturn >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                              {formatPct(r.portfolioReturn)}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-semibold text-gray-900">
                            {formatDollar(r.endingPortfolioValue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* Overview Trend Table */
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100/80 sticky top-0 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-3">Month</th>
                  <th className="py-2.5 px-2 text-right">Portfolio Value</th>
                  <th className="py-2.5 px-2 text-right">Net Contributions</th>
                  <th className="py-2.5 px-2 text-right">Deposit</th>
                  <th className="py-2.5 px-3 text-right">Withdrawal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map((r) => {
                  const isMarch2026 = r.month === '2026-03';
                  return (
                    <tr
                      key={r.month}
                      className={
                        isMarch2026
                          ? 'bg-amber-50/70 font-semibold text-gray-900'
                          : 'hover:bg-gray-50/60 text-gray-700'
                      }
                    >
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{r.label}</span>
                          {isMarch2026 && (
                            <span className="text-[10px] bg-rose-100 text-rose-700 px-1 rounded-sm font-bold">
                              Withdrawal
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-right font-medium text-gray-900">
                        {formatDollar(r.endingPortfolioValue)}
                      </td>
                      <td className="py-2.5 px-2 text-right text-gray-600">
                        {formatDollar(r.cumulativeNetContributions)}
                      </td>
                      <td className="py-2.5 px-2 text-right text-emerald-600 font-medium">
                        +{formatDollar(r.deposit)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {r.withdrawal > 0 ? (
                          <span className="text-rose-600 font-bold">
                            −${r.withdrawal.toLocaleString('en-US')}.00
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <span>{records.length} records in current range</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-900 hover:bg-black text-white font-medium rounded-lg text-xs transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
