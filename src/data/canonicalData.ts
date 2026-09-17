import { BenchmarkId, BenchmarkOption, MonthlyRecord, RangeSummary, TimeRange } from '../types';

export const BENCHMARK_OPTIONS: BenchmarkOption[] = [
  {
    id: 'sp500',
    name: 'S&P 500',
    subtitle: 'Large U.S. companies',
  },
  {
    id: 'totalUS',
    name: 'Total US Market',
    subtitle: 'U.S. large, mid, and small companies',
  },
  {
    id: 'nasdaq',
    name: 'Nasdaq Composite',
    subtitle: 'Technology-focused U.S. companies',
  },
  {
    id: 'bond',
    name: 'U.S. Aggregate Bond Market',
    subtitle: 'Investment grade U.S. bonds',
  },
  {
    id: 'none',
    name: 'No benchmark',
    subtitle: 'Show only your investments',
  },
];

const RAW_MONTHS = [
  "2023-10","2023-11","2023-12",
  "2024-01","2024-02","2024-03","2024-04","2024-05","2024-06","2024-07","2024-08","2024-09",
  "2024-10","2024-11","2024-12",
  "2025-01","2025-02","2025-03","2025-04","2025-05","2025-06","2025-07","2025-08","2025-09",
  "2025-10","2025-11","2025-12",
  "2026-01","2026-02","2026-03","2026-04","2026-05","2026-06","2026-07","2026-08","2026-09"
];

const PORTFOLIO_RETURNS = [
  2.6089, 4.5918, 3.0787, 2.0652, 4.0502, 1.5380, -7.0000, 8.0000, 3.4973, 2.4846, -5.5000, 4.9601,
  1.9464, 10.0000, 3.9244, 2.9131, 0.9008, -8.5000, 5.8846, 9.0000, 3.8623, 2.3508, 4.8454, 1.3312,
  4.3276, -6.5000, 5.8134, 3.8016, -7.5000, 0.0000, 10.0000, 4.8276, 3.3176, -3.5000, 8.0000, 4.2978
];

const SP500_RETURNS = [
  -2.3, 7.1, 4.2, 2.0, 3.1, 2.0, -3.2, 4.2, 3.0, 1.4, 1.9, 2.0,
  -1.3, 5.0, 2.2, 2.6, -1.5, -3.5, 2.0, 4.2, 2.5, 1.6, -1.0, 3.1,
  1.8, -2.4, 3.5, 2.0, -2.8, -4.2, 4.3, 3.4, 2.8, -1.2, 3.2, 1.4
];

const TOTAL_US_RETURNS = [
  -2.0, 6.3, 3.8, 1.8, 2.8, 1.7, -2.8, 3.8, 2.7, 1.2, 1.7, 1.8,
  -1.1, 4.5, 2.0, 2.3, -1.3, -3.1, 1.8, 3.8, 2.2, 1.4, -0.9, 2.8,
  1.6, -2.2, 3.1, 1.8, -2.5, -3.8, 3.9, 3.1, 2.5, -1.0, 2.9, 1.3
];

const BOND_RETURNS = [
  0.3, 1.1, 0.8, 0.4, 0.6, 0.5, -0.7, 0.9, 0.4, 0.3, 0.5, 0.6,
  -0.2, 1.0, 0.5, 0.4, -0.3, -0.8, 0.6, 0.8, 0.5, 0.3, -0.2, 0.7,
  0.4, -0.5, 0.8, 0.5, -0.6, -0.9, 0.9, 0.6, 0.5, -0.3, 0.7, 0.4
];

const NASDAQ_RETURNS = [
  -2.8, 8.5, 5.1, 2.4, 3.6, 2.2, -3.9, 5.2, 3.8, 1.6, 2.3, 2.4,
  -1.5, 6.1, 2.6, 3.1, -1.8, -4.2, 2.4, 5.1, 3.0, 1.9, -1.2, 3.8,
  2.1, -2.9, 4.2, 2.4, -3.4, -4.9, 5.1, 4.0, 3.2, -1.4, 3.8, 1.6
];

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const INITIAL_SNAPSHOT = {
  date: '2023-09-30',
  dateLabel: 'Sep 30, 2023',
  portfolioValue: 5433.71,
  cumulativeNetContributions: 5000,
};

// Build canonical monthly records
export const CANONICAL_MONTHLY_RECORDS: MonthlyRecord[] = [];

let runningPortfolioValue = INITIAL_SNAPSHOT.portfolioValue;
let runningContributions = INITIAL_SNAPSHOT.cumulativeNetContributions;

for (let i = 0; i < RAW_MONTHS.length; i++) {
  const mStr = RAW_MONTHS[i];
  const [yearStr, monthNumStr] = mStr.split('-');
  const monthIdx = parseInt(monthNumStr, 10) - 1;
  const monthName = MONTH_NAMES[monthIdx];
  const label = `${monthName} ${yearStr}`;
  const dateLabel = `${monthName} 30, ${yearStr}`;

  const deposit = 300;
  const withdrawal = mStr === '2026-03' ? 2000 : 0;
  const netCashFlow = deposit - withdrawal;

  runningContributions += netCashFlow;

  const portReturn = PORTFOLIO_RETURNS[i];
  runningPortfolioValue = (runningPortfolioValue + deposit - withdrawal) * (1 + portReturn / 100);

  CANONICAL_MONTHLY_RECORDS.push({
    month: mStr,
    label,
    dateLabel,
    deposit,
    withdrawal,
    netCashFlow,
    portfolioReturn: portReturn,
    sp500Return: SP500_RETURNS[i],
    totalUSReturn: TOTAL_US_RETURNS[i],
    nasdaqReturn: NASDAQ_RETURNS[i],
    bondReturn: BOND_RETURNS[i],
    cumulativeNetContributions: runningContributions,
    endingPortfolioValue: runningPortfolioValue,
  });
}

// Canonical ending validation targets
export const CURRENT_PORTFOLIO_VALUE = 27435.74;
export const CURRENT_CONTRIBUTIONS = 13800;

export interface RangeConfig {
  range: TimeRange;
  startMonthIndex: number;
  startDateLabel: string;
  endDateLabel: string;
  startingValue: number;
  startingContributions: number;
}

export function getRangeConfig(range: TimeRange): RangeConfig {
  switch (range) {
    case '1M':
      // Sep 2026, anchored to Aug 31, 2026
      return {
        range: '1M',
        startMonthIndex: 35,
        startDateLabel: 'Aug 31, 2026',
        endDateLabel: 'Sep 16, 2026',
        startingValue: 26005.19,
        startingContributions: 13500,
      };
    case 'YTD':
      // Jan 2026 - Sep 2026, anchored to Dec 31, 2025
      return {
        range: 'YTD',
        startMonthIndex: 27,
        startDateLabel: 'Dec 31, 2025',
        endDateLabel: 'Sep 16, 2026',
        startingValue: 21593.30,
        startingContributions: 13100,
      };
    case '1Y':
      // Oct 2025 - Sep 2026, anchored to Sep 30, 2025
      return {
        range: '1Y',
        startMonthIndex: 24,
        startDateLabel: 'Sep 30, 2025',
        endDateLabel: 'Sep 16, 2026',
        startingValue: 20025.18,
        startingContributions: 12200,
      };
    case '3Y':
      // Oct 2023 - Sep 2026, anchored to Sep 30, 2023
      return {
        range: '3Y',
        startMonthIndex: 0,
        startDateLabel: 'Sep 30, 2023',
        endDateLabel: 'Sep 16, 2026',
        startingValue: 5433.71,
        startingContributions: 5000,
      };
  }
}

export function getRangeSummary(range: TimeRange): RangeSummary {
  const config = getRangeConfig(range);
  const relevantRecords = CANONICAL_MONTHLY_RECORDS.slice(config.startMonthIndex);

  let totalDeposits = 0;
  let totalWithdrawals = 0;
  let compoundPort = 1;
  let compoundSp500 = 1;
  let compoundTotalUS = 1;
  let compoundNasdaq = 1;
  let compoundBond = 1;

  for (const r of relevantRecords) {
    totalDeposits += r.deposit;
    totalWithdrawals += r.withdrawal;
    compoundPort *= 1 + r.portfolioReturn / 100;
    compoundSp500 *= 1 + r.sp500Return / 100;
    compoundTotalUS *= 1 + r.totalUSReturn / 100;
    compoundNasdaq *= 1 + r.nasdaqReturn / 100;
    compoundBond *= 1 + r.bondReturn / 100;
  }

  const endingValue = CURRENT_PORTFOLIO_VALUE;
  const netCashFlow = totalDeposits - totalWithdrawals;
  // Investment gain = Ending value - Starting value - Deposits + Withdrawals
  const investmentGainDollars = endingValue - config.startingValue - totalDeposits + totalWithdrawals;

  return {
    startingDateLabel: config.startDateLabel,
    endingDateLabel: config.endDateLabel,
    startingValue: config.startingValue,
    endingValue,
    startingContributions: config.startingContributions,
    endingContributions: CURRENT_CONTRIBUTIONS,
    totalDeposits,
    totalWithdrawals,
    netCashFlow,
    investmentGainDollars,
    portfolioCumulativeReturn: (compoundPort - 1) * 100,
    sp500CumulativeReturn: (compoundSp500 - 1) * 100,
    totalUSCumulativeReturn: (compoundTotalUS - 1) * 100,
    nasdaqCumulativeReturn: (compoundNasdaq - 1) * 100,
    bondCumulativeReturn: (compoundBond - 1) * 100,
  };
}

export function getBenchmarkReturn(record: MonthlyRecord, benchmarkId: BenchmarkId): number {
  switch (benchmarkId) {
    case 'sp500':
      return record.sp500Return;
    case 'totalUS':
      return record.totalUSReturn;
    case 'nasdaq':
      return record.nasdaqReturn;
    case 'bond':
      return record.bondReturn;
    case 'none':
      return 0;
  }
}
