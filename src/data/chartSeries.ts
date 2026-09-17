import { BenchmarkId, ChartPoint } from '../types';
import {
  CANONICAL_MONTHLY_RECORDS,
  CURRENT_CONTRIBUTIONS,
  CURRENT_PORTFOLIO_VALUE,
  getBenchmarkReturn,
  getRangeConfig,
  INITIAL_SNAPSHOT,
} from './canonicalData';
import { TimeRange } from '../types';

export interface OverviewPoint {
  index: number;
  dateKey: string;
  dateLabel: string;
  displayDate: string;
  portfolioValue: number;
  cumulativeNetContributions: number;
  isMonthEnd: boolean;
  deposit?: number;
  withdrawal?: number;
  netCashFlow?: number;
  monthlyReturn?: number;
}

export interface PerformancePoint {
  index: number;
  dateKey: string;
  dateLabel: string;
  displayDate: string;
  portfolioReturnPct: number;
  benchmarkReturnPct: number;
  isMonthEnd: boolean;
}

export function generateOverviewSeries(range: TimeRange): {
  points: OverviewPoint[];
  minVal: number;
  maxVal: number;
  yTicks: number[];
  startDateLabel: string;
  endDateLabel: string;
  currentValue: number;
  currentContributions: number;
} {
  const config = getRangeConfig(range);
  const relevantRecords = CANONICAL_MONTHLY_RECORDS.slice(config.startMonthIndex);

  const points: OverviewPoint[] = [];

  // Start anchor point
  points.push({
    index: 0,
    dateKey: 'start',
    dateLabel: config.startDateLabel,
    displayDate: config.startDateLabel,
    portfolioValue: config.startingValue,
    cumulativeNetContributions: config.startingContributions,
    isMonthEnd: false,
  });

  if (range === '1M') {
    // For 1M, show 4 weekly progress points culminating in the final monthly close
    const rec = relevantRecords[0];
    const startVal = config.startingValue;
    const endVal = rec.endingPortfolioValue;
    const startContrib = config.startingContributions;
    const endContrib = rec.cumulativeNetContributions;

    const weeks = [
      { date: 'Sep 07, 2026', label: 'Sep 7', val: startVal + (endVal - startVal) * 0.22 },
      { date: 'Sep 14, 2026', label: 'Sep 14', val: startVal + (endVal - startVal) * 0.55 },
      { date: 'Sep 21, 2026', label: 'Sep 21', val: startVal + (endVal - startVal) * 0.78 },
      { date: 'Sep 30, 2026', label: 'Sep 2026', val: endVal },
    ];

    weeks.forEach((w, idx) => {
      const isEnd = idx === weeks.length - 1;
      points.push({
        index: points.length,
        dateKey: `2026-09-w${idx + 1}`,
        dateLabel: w.label,
        displayDate: w.date,
        portfolioValue: w.val,
        cumulativeNetContributions: endContrib,
        isMonthEnd: isEnd,
        deposit: isEnd ? rec.deposit : undefined,
        withdrawal: isEnd ? rec.withdrawal : undefined,
        netCashFlow: isEnd ? rec.netCashFlow : undefined,
        monthlyReturn: isEnd ? rec.portfolioReturn : undefined,
      });
    });
  } else {
    // For YTD, 1Y, 3Y: Plot the monthly data points derived directly from canonical dataset
    relevantRecords.forEach((record) => {
      points.push({
        index: points.length,
        dateKey: record.month,
        dateLabel: record.label,
        displayDate: record.label,
        portfolioValue: record.endingPortfolioValue,
        cumulativeNetContributions: record.cumulativeNetContributions,
        isMonthEnd: true,
        deposit: record.deposit,
        withdrawal: record.withdrawal,
        netCashFlow: record.netCashFlow,
        monthlyReturn: record.portfolioReturn,
      });
    });
  }

  // Ensure end matches exact current snapshot
  if (points.length > 0) {
    points[points.length - 1].portfolioValue = CURRENT_PORTFOLIO_VALUE;
    points[points.length - 1].cumulativeNetContributions = CURRENT_CONTRIBUTIONS;
  }

  // Calculate y-axis bounds with 10-15% padding
  let rawMin = Infinity;
  let rawMax = -Infinity;

  points.forEach((p) => {
    rawMin = Math.min(rawMin, p.portfolioValue, p.cumulativeNetContributions);
    rawMax = Math.max(rawMax, p.portfolioValue, p.cumulativeNetContributions);
  });

  const span = rawMax - rawMin;
  const pad = Math.max(span * 0.12, 1000);
  let minVal = Math.max(0, rawMin - pad);
  let maxVal = rawMax + pad;

  // Round ticks to friendly dollar intervals ($1k, $2k, $5k, $10k)
  const roughRange = maxVal - minVal;
  let tickInterval = 5000;
  if (roughRange <= 4000) tickInterval = 1000;
  else if (roughRange <= 10000) tickInterval = 2000;
  else if (roughRange <= 22000) tickInterval = 5000;
  else tickInterval = 10000;

  minVal = Math.floor(minVal / tickInterval) * tickInterval;
  maxVal = Math.ceil(maxVal / tickInterval) * tickInterval;

  const yTicks: number[] = [];
  for (let t = minVal; t <= maxVal; t += tickInterval) {
    yTicks.push(t);
  }

  return {
    points,
    minVal,
    maxVal,
    yTicks,
    startDateLabel: config.startDateLabel,
    endDateLabel: config.endDateLabel,
    currentValue: CURRENT_PORTFOLIO_VALUE,
    currentContributions: CURRENT_CONTRIBUTIONS,
  };
}

export function generatePerformanceSeries(
  range: TimeRange,
  benchmarkId: BenchmarkId
): {
  points: PerformancePoint[];
  minPct: number;
  maxPct: number;
  yTicks: number[];
  startDateLabel: string;
  endDateLabel: string;
  endPortfolioReturn: number;
  endBenchmarkReturn: number;
} {
  const config = getRangeConfig(range);
  const relevantRecords = CANONICAL_MONTHLY_RECORDS.slice(config.startMonthIndex);

  const points: PerformancePoint[] = [];

  // Start point normalized to 0.0%
  points.push({
    index: 0,
    dateKey: 'start',
    dateLabel: config.startDateLabel,
    displayDate: config.startDateLabel,
    portfolioReturnPct: 0.0,
    benchmarkReturnPct: 0.0,
    isMonthEnd: false,
  });

  let compoundPort = 1.0;
  let compoundBench = 1.0;

  if (range === '1M') {
    const rec = relevantRecords[0];
    const bReturn = getBenchmarkReturn(rec, benchmarkId);
    const pEndReturn = rec.portfolioReturn;
    const bEndReturn = bReturn;

    const weeks = [
      { date: 'Sep 07, 2026', label: 'Sep 7', p: pEndReturn * 0.22, b: bEndReturn * 0.25 },
      { date: 'Sep 14, 2026', label: 'Sep 14', p: pEndReturn * 0.55, b: bEndReturn * 0.52 },
      { date: 'Sep 21, 2026', label: 'Sep 21', p: pEndReturn * 0.78, b: bEndReturn * 0.8 },
      { date: 'Sep 30, 2026', label: 'Sep 2026', p: pEndReturn, b: bEndReturn },
    ];

    weeks.forEach((w, idx) => {
      points.push({
        index: points.length,
        dateKey: `2026-09-w${idx + 1}`,
        dateLabel: w.label,
        displayDate: w.date,
        portfolioReturnPct: w.p,
        benchmarkReturnPct: benchmarkId === 'none' ? 0 : w.b,
        isMonthEnd: idx === weeks.length - 1,
      });
    });
  } else {
    relevantRecords.forEach((record) => {
      compoundPort *= 1.0 + record.portfolioReturn / 100.0;
      const bReturn = getBenchmarkReturn(record, benchmarkId);
      compoundBench *= 1.0 + bReturn / 100.0;

      const targetPortReturnPct = (compoundPort - 1.0) * 100;
      const targetBenchReturnPct = (compoundBench - 1.0) * 100;

      points.push({
        index: points.length,
        dateKey: record.month,
        dateLabel: record.label,
        displayDate: record.label,
        portfolioReturnPct: targetPortReturnPct,
        benchmarkReturnPct: benchmarkId === 'none' ? 0 : targetBenchReturnPct,
        isMonthEnd: true,
      });
    });
  }

  // Calculate percentage min/max with padding, ensuring 0% baseline is included
  let rawMin = 0.0;
  let rawMax = 0.0;

  points.forEach((p) => {
    rawMin = Math.min(rawMin, p.portfolioReturnPct);
    rawMax = Math.max(rawMax, p.portfolioReturnPct);
    if (benchmarkId !== 'none') {
      rawMin = Math.min(rawMin, p.benchmarkReturnPct);
      rawMax = Math.max(rawMax, p.benchmarkReturnPct);
    }
  });

  const span = rawMax - rawMin;
  const pad = Math.max(span * 0.15, 3.0);
  let minPct = rawMin - pad;
  let maxPct = rawMax + pad;

  // Round ticks to friendly step (5% or 10% or 2%)
  let tickStep = 5;
  if (span <= 8) tickStep = 2;
  else if (span >= 40) tickStep = 10;
  else tickStep = 5;

  minPct = Math.floor(minPct / tickStep) * tickStep;
  maxPct = Math.ceil(maxPct / tickStep) * tickStep;

  // Make sure 0% is strictly on the tick grid
  const yTicks: number[] = [];
  for (let t = minPct; t <= maxPct; t += tickStep) {
    yTicks.push(t);
  }
  if (!yTicks.includes(0)) {
    yTicks.push(0);
    yTicks.sort((a, b) => a - b);
  }

  const lastPoint = points[points.length - 1];

  return {
    points,
    minPct,
    maxPct,
    yTicks,
    startDateLabel: config.startDateLabel,
    endDateLabel: config.endDateLabel,
    endPortfolioReturn: lastPoint.portfolioReturnPct,
    endBenchmarkReturn: lastPoint.benchmarkReturnPct,
  };
}
