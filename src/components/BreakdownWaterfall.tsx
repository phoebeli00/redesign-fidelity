import React from 'react';
import { TimeRange } from '../types';
import { CURRENT_PORTFOLIO_VALUE, getRangeSummary } from '../data/canonicalData';

interface BreakdownWaterfallProps {
  selectedRange: TimeRange;
}

export const BreakdownWaterfall: React.FC<BreakdownWaterfallProps> = ({ selectedRange }) => {
  const summary = getRangeSummary(selectedRange);

  const startingValue = summary.startingValue;
  const netCashFlow = summary.netCashFlow;
  const investmentGain = summary.investmentGainDollars;
  const currentValue = CURRENT_PORTFOLIO_VALUE;

  // Truncation configurations per PRD
  let lowerBound = 0;
  let upperBound = 30000;
  let yTicks: number[] = [0, 10000, 20000, 30000];
  let isTruncated = false;

  switch (selectedRange) {
    case '1M':
      lowerBound = 25000;
      upperBound = 28000;
      yTicks = [25000, 26000, 27000, 28000];
      isTruncated = true;
      break;
    case 'YTD':
      // Canonical YTD lower bound ~ $20,000
      lowerBound = 20000;
      upperBound = 28000;
      yTicks = [20000, 22000, 24000, 26000, 28000];
      isTruncated = true;
      break;
    case '1Y':
      lowerBound = 18000;
      upperBound = 28000;
      yTicks = [18000, 20000, 22000, 24000, 26000, 28000];
      isTruncated = true;
      break;
    case '3Y':
      // 3Y starts from 0 baseline
      lowerBound = 0;
      upperBound = 30000;
      yTicks = [0, 10000, 20000, 30000];
      isTruncated = false;
      break;
  }

  // Formatters
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

  const formatTick = (val: number) => {
    if (val === 0) return '$0';
    return `$${(val / 1000).toFixed(0)}K`;
  };

  // Dimensions
  const width = 390;
  const height = 245;
  const paddingLeft = 48;
  const paddingRight = 18;
  const paddingTop = 32;
  const paddingBottom = 48;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const baseY = paddingTop + chartHeight;

  const getY = (val: number) => {
    const clamped = Math.max(lowerBound, Math.min(upperBound, val));
    const ratio = (clamped - lowerBound) / (upperBound - lowerBound);
    return baseY - ratio * chartHeight;
  };

  // 4 columns geometry
  const colWidth = 50;
  const gap = (chartWidth - 4 * colWidth) / 3;

  const x1 = paddingLeft;
  const x2 = x1 + colWidth + gap;
  const x3 = x2 + colWidth + gap;
  const x4 = x3 + colWidth + gap;

  // Levels
  // Column 1: Starting Value (total column)
  const y1Top = getY(startingValue);
  const y1Bottom = baseY;

  // Column 2: Net Cash Flow (floating step)
  const netCashFlowEnd = startingValue + netCashFlow;
  const y2Bottom = getY(startingValue);
  const y2Top = getY(netCashFlowEnd);

  // Column 3: Investment Gain (floating step)
  const y3Bottom = getY(netCashFlowEnd);
  const y3Top = getY(currentValue);

  // Column 4: Current Value (total column)
  const y4Top = getY(currentValue);
  const y4Bottom = baseY;

  // Zigzag notched bottom path for total columns when truncated
  const getNotchedColumnPath = (x: number, topY: number, bottomY: number) => {
    if (!isTruncated) {
      return `M ${x} ${topY} L ${x + colWidth} ${topY} L ${x + colWidth} ${bottomY} L ${x} ${bottomY} Z`;
    }
    const cutH = 4;
    return `M ${x} ${topY}
      L ${x + colWidth} ${topY}
      L ${x + colWidth} ${bottomY - cutH}
      L ${x + colWidth * 0.75} ${bottomY}
      L ${x + colWidth * 0.5} ${bottomY - cutH - 2}
      L ${x + colWidth * 0.25} ${bottomY}
      L ${x} ${bottomY - cutH}
      Z`;
  };

  return (
    <div className="relative px-3 pt-1 pb-3 select-none">
      {/* Title Bar with range subtitle */}
      <div className="flex items-center justify-between px-1 mb-1">
        <span className="text-xs font-bold text-gray-800">Selected Period Breakdown</span>
        <div className="text-[11px] font-medium text-gray-500">
          From {formatDollar(startingValue)} to {formatDollar(currentValue)}
        </div>
      </div>

      {/* Waterfall SVG */}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        {/* Horizontal grid lines & Y-axis labels */}
        {yTicks.map((tick) => {
          const y = getY(tick);
          return (
            <g key={tick}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 8}
                y={y + 3.5}
                textAnchor="end"
                className="text-[10px] font-semibold fill-gray-400 font-sans"
              >
                {formatTick(tick)}
              </text>
            </g>
          );
        })}

        {/* Y-axis baseline */}
        <line
          x1={paddingLeft}
          y1={paddingTop - 5}
          x2={paddingLeft}
          y2={baseY}
          stroke="#e2e8f0"
          strokeWidth="1.2"
        />

        {/* Axis break double slash mark when truncated */}
        {isTruncated && (
          <g>
            <line
              x1={paddingLeft - 5}
              y1={baseY - 2}
              x2={paddingLeft + 5}
              y2={baseY - 8}
              stroke="#64748b"
              strokeWidth="1.8"
            />
            <line
              x1={paddingLeft - 5}
              y1={baseY + 4}
              x2={paddingLeft + 5}
              y2={baseY - 2}
              stroke="#64748b"
              strokeWidth="1.8"
            />
          </g>
        )}

        {/* Dashed connector lines between adjacent steps */}
        {/* Connector 1 -> 2 */}
        <line
          x1={x1 + colWidth}
          y1={y1Top}
          x2={x2}
          y2={y2Bottom}
          stroke="#94a3b8"
          strokeWidth="1.2"
          strokeDasharray="3 3"
        />
        {/* Connector 2 -> 3 */}
        <line
          x1={x2 + colWidth}
          y1={y2Top}
          x2={x3}
          y2={y3Bottom}
          stroke="#94a3b8"
          strokeWidth="1.2"
          strokeDasharray="3 3"
        />
        {/* Connector 3 -> 4 */}
        <line
          x1={x3 + colWidth}
          y1={y3Top}
          x2={x4}
          y2={y4Top}
          stroke="#94a3b8"
          strokeWidth="1.2"
          strokeDasharray="3 3"
        />

        {/* Column 1: Starting Value (Dark Navy Total Column) */}
        <path
          d={getNotchedColumnPath(x1, y1Top, y1Bottom)}
          fill="#1e293b"
          rx={isTruncated ? 0 : 4}
          className="transition-all duration-300"
        />

        {/* Column 2: Net Cash Flow (Muted Gray Floating Step) */}
        <rect
          x={x2}
          y={Math.min(y2Top, y2Bottom)}
          width={colWidth}
          height={Math.max(3, Math.abs(y2Bottom - y2Top))}
          fill="#64748b"
          rx="3"
          className="transition-all duration-300"
        />

        {/* Column 3: Investment Gain (Fidelity Green Floating Step) */}
        <rect
          x={x3}
          y={Math.min(y3Top, y3Bottom)}
          width={colWidth}
          height={Math.max(3, Math.abs(y3Bottom - y3Top))}
          fill="#1b873f"
          rx="3"
          className="transition-all duration-300"
        />

        {/* Column 4: Current Value (Dark Green Total Column) */}
        <path
          d={getNotchedColumnPath(x4, y4Top, y4Bottom)}
          fill="#14532d"
          rx={isTruncated ? 0 : 4}
          className="transition-all duration-300"
        />

        {/* Exact Dollar Labels directly above/on the columns */}
        {/* Col 1 Label */}
        <text
          x={x1 + colWidth / 2}
          y={y1Top - 8}
          textAnchor="middle"
          className="text-[10px] font-bold fill-gray-900"
        >
          {formatDollar(startingValue)}
        </text>

        {/* Col 2 Label */}
        <text
          x={x2 + colWidth / 2}
          y={Math.min(y2Top, y2Bottom) - 8}
          textAnchor="middle"
          className="text-[10px] font-bold fill-gray-800"
        >
          {formatDollar(netCashFlow, true)}
        </text>

        {/* Col 3 Label */}
        <text
          x={x3 + colWidth / 2}
          y={Math.min(y3Top, y3Bottom) - 8}
          textAnchor="middle"
          className="text-[10px] font-bold fill-[#15803d]"
        >
          {formatDollar(investmentGain, true)}
        </text>

        {/* Col 4 Label */}
        <text
          x={x4 + colWidth / 2}
          y={y4Top - 8}
          textAnchor="middle"
          className="text-[10px] font-bold fill-[#14532d]"
        >
          {formatDollar(currentValue)}
        </text>

        {/* Category Labels underneath the baseline */}
        <text
          x={x1 + colWidth / 2}
          y={baseY + 16}
          textAnchor="middle"
          className="text-[10.5px] font-bold fill-gray-700"
        >
          Starting
        </text>

        <text
          x={x2 + colWidth / 2}
          y={baseY + 16}
          textAnchor="middle"
          className="text-[10.5px] font-bold fill-gray-700"
        >
          Net Cash
        </text>
        {/* Deposits and Withdrawals breakdown under Net Cash */}
        <text
          x={x2 + colWidth / 2}
          y={baseY + 28}
          textAnchor="middle"
          className="text-[8.5px] font-medium fill-gray-500"
        >
          +{formatDollar(summary.totalDeposits).replace('.00', '')} / −{formatDollar(summary.totalWithdrawals).replace('.00', '')}
        </text>

        <text
          x={x3 + colWidth / 2}
          y={baseY + 16}
          textAnchor="middle"
          className="text-[10.5px] font-bold fill-gray-700"
        >
          Gain/Loss
        </text>
        <text
          x={x3 + colWidth / 2}
          y={baseY + 28}
          textAnchor="middle"
          className="text-[8.5px] font-medium fill-emerald-600"
        >
          +{summary.portfolioCumulativeReturn.toFixed(1)}%
        </text>

        <text
          x={x4 + colWidth / 2}
          y={baseY + 16}
          textAnchor="middle"
          className="text-[10.5px] font-bold fill-[#14532d]"
        >
          Current
        </text>
      </svg>

      {/* Truncation explanation caption required by PRD */}
      {isTruncated && (
        <p className="text-center text-[10.5px] text-gray-500 mt-1 italic">
          Axis starts at ${lowerBound.toLocaleString()} to make {selectedRange} changes easier to compare.
        </p>
      )}
    </div>
  );
};
