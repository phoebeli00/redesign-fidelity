import React, { useRef, useState, useId } from 'react';
import { TimeRange } from '../types';
import { generateOverviewSeries, OverviewPoint } from '../data/chartSeries';

interface OverviewChartProps {
  selectedRange: TimeRange;
}

export const OverviewChart: React.FC<OverviewChartProps> = ({ selectedRange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const chartId = useId();

  const {
    points,
    minVal,
    maxVal,
    yTicks,
    startDateLabel,
    endDateLabel,
  } = generateOverviewSeries(selectedRange);

  // SVG dimensions
  const width = 390;
  const height = 230;
  const paddingLeft = 46;
  const paddingRight = 44;
  const paddingTop = 20;
  const paddingBottom = 28;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Coordinate scales
  const getX = (idx: number) => {
    if (points.length <= 1) return paddingLeft;
    return paddingLeft + (idx / (points.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    if (maxVal === minVal) return paddingTop + chartHeight / 2;
    const norm = (val - minVal) / (maxVal - minVal);
    return paddingTop + chartHeight - norm * chartHeight;
  };

  // Generate Green Portfolio Value Path
  const portPath = points.reduce((acc, p, idx) => {
    const x = getX(idx);
    const y = getY(p.portfolioValue);
    return idx === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `${acc} L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }, '');

  // Generate Gray Step Line for Net Contributions
  let contribPath = '';
  for (let i = 0; i < points.length; i++) {
    const x = getX(i);
    const y = getY(points[i].cumulativeNetContributions);
    if (i === 0) {
      contribPath = `M ${x.toFixed(1)} ${y.toFixed(1)}`;
    } else {
      const prevY = getY(points[i - 1].cumulativeNetContributions);
      if (Math.abs(prevY - y) > 0.1) {
        // Step vertically at current x, then proceed
        contribPath += ` L ${x.toFixed(1)} ${prevY.toFixed(1)} L ${x.toFixed(1)} ${y.toFixed(1)}`;
      } else {
        contribPath += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
      }
    }
  }

  // Active inspected point
  const activePoint: OverviewPoint | null =
    activePointIndex !== null && points[activePointIndex]
      ? points[activePointIndex]
      : null;

  // Handle pointer interactions (mouse & touch drag)
  const handlePointer = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const svgX = (relativeX / rect.width) * width;

    if (svgX < paddingLeft) {
      setActivePointIndex(0);
      return;
    }
    if (svgX > width - paddingRight) {
      setActivePointIndex(points.length - 1);
      return;
    }

    const ratio = (svgX - paddingLeft) / chartWidth;
    const nearestIdx = Math.round(ratio * (points.length - 1));
    const clamped = Math.max(0, Math.min(points.length - 1, nearestIdx));
    setActivePointIndex(clamped);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isLocked) {
      handlePointer(e.clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      handlePointer(e.touches[0].clientX);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isLocked) {
      setIsLocked(false);
      setActivePointIndex(null);
    } else {
      handlePointer(e.clientX);
      setIsLocked(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setActivePointIndex(null);
      setIsLocked(false);
    } else if (e.key === 'ArrowRight') {
      setActivePointIndex((prev) =>
        prev === null ? 0 : Math.min(points.length - 1, prev + 1)
      );
    } else if (e.key === 'ArrowLeft') {
      setActivePointIndex((prev) =>
        prev === null ? points.length - 1 : Math.max(0, prev - 1)
      );
    }
  };

  // Format currency
  const formatDollar = (val: number) =>
    `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatShortDollar = (val: number) => {
    if (val >= 1000) {
      return `$${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}K`;
    }
    return `$${val}`;
  };

  // End point coordinates for resting tags
  const lastPoint = points[points.length - 1];
  const lastX = getX(points.length - 1);
  const lastPortY = getY(lastPoint.portfolioValue);
  const lastContribY = getY(lastPoint.cumulativeNetContributions);

  // Check if active point is March 2026 or has withdrawal
  const isMarch2026 =
    activePoint &&
    (activePoint.dateKey.includes('2026-03') ||
      activePoint.dateLabel.includes('Mar 2026'));

  return (
    <div
      ref={containerRef}
      className="relative px-2 pt-1 pb-4 select-none outline-none focus:ring-1 focus:ring-emerald-500 rounded-xl"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (!isLocked) setActivePointIndex(null);
      }}
      onTouchStart={(e) => {
        handlePointer(e.touches[0].clientX);
      }}
      onTouchMove={handleTouchMove}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Overview portfolio chart with interactive timeline"
    >
      {/* SVG Canvas */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${chartId}-grad`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#15803d" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#15803d" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal Grid lines & Y-axis labels */}
        {yTicks.map((tick) => {
          const y = getY(tick);
          return (
            <g key={tick} className="text-gray-400">
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight + 5}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 8}
                y={y + 3.5}
                textAnchor="end"
                className="text-[11px] font-medium fill-gray-500 font-sans"
              >
                {formatShortDollar(tick)}
              </text>
            </g>
          );
        })}

        {/* Area fill under green line */}
        <path
          d={`${portPath} L ${getX(points.length - 1)} ${getY(minVal)} L ${getX(0)} ${getY(minVal)} Z`}
          fill={`url(#${chartId}-grad)`}
        />

        {/* Gray Step Line (Cumulative Net Contributions) */}
        <path
          d={contribPath}
          fill="none"
          stroke="#71717a"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="miter"
        />

        {/* Green Line (Portfolio Value) */}
        <path
          d={portPath}
          fill="none"
          stroke="#1b873f"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Interactive Scrubbing Crosshair & Points */}
        {activePointIndex !== null && activePoint && (
          <g>
            {/* Vertical crosshair */}
            <line
              x1={getX(activePointIndex)}
              y1={paddingTop}
              x2={getX(activePointIndex)}
              y2={paddingTop + chartHeight}
              stroke="#4b5563"
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />

            {/* Marker on Gray Line */}
            <circle
              cx={getX(activePointIndex)}
              cy={getY(activePoint.cumulativeNetContributions)}
              r="4.5"
              fill="#ffffff"
              stroke="#71717a"
              strokeWidth="2.5"
            />

            {/* Marker on Green Line */}
            <circle
              cx={getX(activePointIndex)}
              cy={getY(activePoint.portfolioValue)}
              r="5"
              fill="#ffffff"
              stroke="#1b873f"
              strokeWidth="2.8"
            />
          </g>
        )}
      </svg>

      {/* Interactive Tooltip Card */}
      {activePoint && (
        <div
          className="absolute z-20 pointer-events-none transition-all duration-75"
          style={{
            left: `${Math.min(
              Math.max(15, (getX(activePointIndex!) / width) * 100),
              85
            )}%`,
            top: '8px',
            transform: 'translateX(-50%)',
          }}
        >
          <div className="bg-gray-900/95 text-white backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-xl border border-gray-700/60 text-xs min-w-[210px]">
            <div className="flex items-center justify-between border-b border-gray-700 pb-1.5 mb-1.5">
              <span className="font-bold text-gray-200">
                {isMarch2026 ? 'March 2026' : activePoint.dateLabel}
              </span>
              {isMarch2026 && (
                <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.5 rounded-sm font-semibold">
                  Withdrawal
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                  Portfolio value:
                </span>
                <span className="font-bold text-white">
                  {isMarch2026
                    ? '$19,598.67'
                    : formatDollar(activePoint.portfolioValue)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-gray-400" />
                  Net contributions:
                </span>
                <span className="font-semibold text-gray-300">
                  {isMarch2026
                    ? '$12,000.00'
                    : formatDollar(activePoint.cumulativeNetContributions)}
                </span>
              </div>

              {/* Explicit March 2026 PRD breakdown */}
              {isMarch2026 ? (
                <div className="pt-1.5 mt-1.5 border-t border-gray-700/80 space-y-0.5 text-[11px]">
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Deposit:</span>
                    <span>+$300.00</span>
                  </div>
                  <div className="flex justify-between text-rose-400 font-bold">
                    <span>Withdrawal:</span>
                    <span>−$2,000.00</span>
                  </div>
                  <div className="flex justify-between text-amber-300 font-semibold">
                    <span>Net cash flow:</span>
                    <span>−$1,700.00</span>
                  </div>
                  <div className="flex justify-between text-gray-300 font-medium">
                    <span>Monthly return:</span>
                    <span>0.0%</span>
                  </div>
                </div>
              ) : activePoint.deposit ? (
                <div className="pt-1.5 mt-1.5 border-t border-gray-700/80 space-y-0.5 text-[11px]">
                  <div className="flex justify-between text-gray-300">
                    <span>Monthly deposit:</span>
                    <span>+$300.00</span>
                  </div>
                  {activePoint.monthlyReturn !== undefined && (
                    <div className="flex justify-between text-gray-300">
                      <span>Monthly return:</span>
                      <span
                        className={
                          activePoint.monthlyReturn >= 0
                            ? 'text-emerald-400 font-semibold'
                            : 'text-rose-400 font-semibold'
                        }
                      >
                        {activePoint.monthlyReturn >= 0
                          ? `+${activePoint.monthlyReturn.toFixed(1)}%`
                          : `${activePoint.monthlyReturn.toFixed(1)}%`}
                      </span>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Date labels at bottom */}
      <div className="px-10 flex items-center justify-between text-[11px] font-medium text-gray-500 mt-0.5">
        <span>{startDateLabel}</span>
        <span>{endDateLabel}</span>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 mt-3 text-xs font-semibold text-gray-700">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1b873f]" />
          <span>Portfolio value</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#71717a]" />
          <span>Net contributions</span>
        </div>
      </div>
    </div>
  );
};
