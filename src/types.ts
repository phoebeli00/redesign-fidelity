export type TabType = 'overview' | 'performance';

export type OverviewView = 'trend' | 'breakdown';

export type TimeRange = '1M' | 'YTD' | '1Y' | '3Y';

export type BenchmarkId = 'sp500' | 'totalUS' | 'nasdaq' | 'bond' | 'none';

export interface BenchmarkOption {
  id: BenchmarkId;
  name: string;
  subtitle: string;
}

export interface MonthlyRecord {
  month: string; // "2023-10"
  label: string; // "Oct 2023"
  dateLabel: string; // "Oct 31, 2023"
  deposit: number;
  withdrawal: number;
  netCashFlow: number;
  portfolioReturn: number; // percentage, e.g. -2.1
  sp500Return: number;
  totalUSReturn: number;
  nasdaqReturn: number;
  bondReturn: number;
  cumulativeNetContributions: number;
  endingPortfolioValue: number;
}

export interface RangeSummary {
  startingDateLabel: string;
  endingDateLabel: string;
  startingValue: number;
  endingValue: number;
  startingContributions: number;
  endingContributions: number;
  totalDeposits: number;
  totalWithdrawals: number;
  netCashFlow: number;
  investmentGainDollars: number;
  portfolioCumulativeReturn: number; // percentage
  sp500CumulativeReturn: number;
  totalUSCumulativeReturn: number;
  nasdaqCumulativeReturn: number;
  bondCumulativeReturn: number;
}

export interface ChartPoint {
  index: number;
  dateKey: string;
  dateLabel: string;
  portfolioValue: number;
  cumulativeNetContributions: number;
  portfolioReturnPct: number;
  benchmarkReturnPct: number;
  deposit?: number;
  withdrawal?: number;
  netCashFlow?: number;
  monthlyReturn?: number;
  isMonthEnd?: boolean;
}
