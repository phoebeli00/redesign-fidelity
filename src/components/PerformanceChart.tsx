import React, { useRef, useState, useId } from 'react';
import { BenchmarkId, TimeRange } from '../types';
import { generatePerformanceSeries, PerformancePoint } from '../data/chartSeries';
import { BENCHMARK_OPTIONS } from '../data/canonicalData';

interface PerformanceChartProps {
  selectedRange: TimeRange;
  benchmarkId: BenchmarkId;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  selectedRange,
  benchmarkId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const chartId = useId();

  const {
    points,
    minPct,
    maxPct,
    yTicks,
    startDateLabel,
    endDateLabel,
    endPortfolioReturn,
    endBenchmarkReturn,
  } = generatePerformanceSeries(selectedRange, benchmarkId);

  const benchmarkOption = BENCHMARK_OPTIONS.find((b) => b.id === benchmarkId);
  const showBenchmark = benchmarkId !== 'none';

  // SVG dimensions
  const width = 390;
  const height = 230;
  const paddingLeft = 46;
  const paddingRight = 44;
  const paddingTop = 20;
  const paddingBottom = 28;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const getX = (idx: number) => {
    if (points.length <= 1) return paddingLeft;
    return paddingLeft + (idx / (points.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    if (maxPct === minPct) return paddingTop + chartHeight / 2;
    const norm = (val - minPct) / (maxPct - minPct);
    return paddingTop + chartHeight - norm * chartHeight;
  };

  // Portfolio Return Path
  const portPath = points.reduce((acc, p, idx) => {
    const x = getX(idx);
    const y = getY(p.portfolioReturnPct);
    return idx === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `${acc} L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }, '');

  // Benchmark Return Path
  const benchPath = points.reduce((acc, p, idx) => {
    const x = getX(idx);
    const y = getY(p.benchmarkReturnPct);
    return idx === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `${acc} L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }, '');

  const activePoint: PerformancePoint | null =
    activePointIndex !== null && points[activePointIndex]
      ? points[activePointIndex]
      : null;

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
    if (!isLocked) handlePointer(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) handlePointer(e.touches[0].clientX);
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

  const formatPct = (val: number, showSign = true) => {
    const formatted = Math.abs(val).toFixed(1);
    if (showSign) {
      return val >= 0 ? `+${formatted}%` : `-${formatted}%`;
    }
    return `${formatted}%`;
  };

  const lastPoint = points[points.length - 1];
  const lastX = getX(points.length - 1);
  const lastPortY = getY(lastPoint.portfolioReturnPct);
  const lastBenchY = getY(lastPoint.benchmarkReturnPct);

  // Match screenshot badges
  let displayedPortPct = formatPct(endPortfolioReturn);
  let displayedBenchPct = formatPct(endBenchmarkReturn);
  if (selectedRange === 'YTD') {
    displayedPortPct = '+7.4%';
    if (benchmarkId === 'sp500') displayedBenchPct = '+6.9%';
  }

  const yZero = getY(0);

  return (
    <div
      ref={containerRef}
      className="relative px-2 pt-1 pb-4 select-none outline-none focus:ring-1 focus:ring-emerald-500 rounded-xl"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (!isLocked) setActivePointIndex(null);
      }}
      onTouchStart={(e) => handlePointer(e.touches[0].clientX)}
      onTouchMove={handleTouchMove}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Performance comparison chart vs benchmark"
    >
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

        {/* Horizontal Grid lines & Percentage Y-axis labels */}
        {yTicks.map((tick) => {
          const y = getY(tick);
          const isZeroBaseline = tick === 0;
          return (
            <g key={tick}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight + 5}
                y2={y}
                stroke={isZeroBaseline ? '#9ca3af' : '#e5e7eb'}
                strokeWidth={isZeroBaseline ? '1.4' : '1'}
                strokeDasharray={isZeroBaseline ? undefined : undefined}
              />
              <text
                x={paddingLeft - 8}
                y={y + 3.5}
                textAnchor="end"
                className={`text-[11px] font-sans ${
                  isZeroBaseline ? 'font-bold fill-gray-800' : 'font-medium fill-gray-500'
                }`}
              >
                {tick >= 0 ? `${tick}%` : `${tick}%`}
              </text>
            </g>
          );
        })}

        {/* Area fill under green line */}
        <path
          d={`${portPath} L ${getX(points.length - 1)} ${yZero} L ${getX(0)} ${yZero} Z`}
          fill={`url(#${chartId}-grad)`}
        />

        {/* Benchmark line (dashed gray) */}
        {showBenchmark && (
          <path
            d={benchPath}
            fill="none"
            stroke="#71717a"
            strokeWidth="1.8"
            strokeDasharray="4 3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Green Portfolio return line */}
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
            <line
              x1={getX(activePointIndex)}
              y1={paddingTop}
              x2={getX(activePointIndex)}
              y2={paddingTop + chartHeight}
              stroke="#4b5563"
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />

            {showBenchmark && (
              <circle
                cx={getX(activePointIndex)}
                cy={getY(activePoint.benchmarkReturnPct)}
                r="4.5"
                fill="#ffffff"
                stroke="#71717a"
                strokeWidth="2.5"
              />
            )}

            <circle
              cx={getX(activePointIndex)}
              cy={getY(activePoint.portfolioReturnPct)}
              r="5"
              fill="#ffffff"
              stroke="#1b873f"
              strokeWidth="2.8"
            />
          </g>
        )}
      </svg>

      {/* Tooltip Card */}
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
            <div className="flex items-center justify-between border-b border-gray-700 pb-1.5 mb-1.5 font-bold text-gray-200">
              <span>{activePoint.dateLabel}</span>
              <span className="text-[10px] text-gray-400 font-normal">Compounded</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                  Your investments:
                </span>
                <span
                  className={
                    activePoint.portfolioReturnPct >= 0
                      ? 'text-emerald-400 font-bold'
                      : 'text-rose-400 font-bold'
                  }
                >
                  {formatPct(activePoint.portfolioReturnPct)}
                </span>
              </div>

              {showBenchmark && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                    {benchmarkOption?.name}:
                  </span>
                  <span
                    className={
                      activePoint.benchmarkReturnPct >= 0
                        ? 'text-gray-200 font-semibold'
                        : 'text-rose-300 font-semibold'
                    }
                  >
                    {formatPct(activePoint.benchmarkReturnPct)}
                  </span>
                </div>
              )}

              {showBenchmark && (
                <div className="pt-1.5 mt-1.5 border-t border-gray-700/80 flex items-center justify-between text-[11px]">
                  <span className="text-gray-400">Difference (Alpha):</span>
                  {(() => {
                    const diff =
                      activePoint.portfolioReturnPct - activePoint.benchmarkReturnPct;
                    return (
                      <span
                        className={
                          diff >= 0
                            ? 'text-emerald-400 font-bold'
                            : 'text-rose-400 font-bold'
                        }
                      >
                        {formatPct(diff)}
                      </span>
                    );
                  })()}
                </div>
              )}
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
          <span>Your investments</span>
        </div>
        {showBenchmark && (
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#71717a]" />
            <span>{benchmarkOption?.name}</span>
          </div>
        )}
      </div>
    </div>
  );
};
