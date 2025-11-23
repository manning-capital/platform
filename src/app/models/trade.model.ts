export interface Trade {
  id: string;
  modelId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  exitPrice?: number;
  status: 'OPEN' | 'CLOSED' | 'PENDING';
  timestamp: Date;
  pnl: number;
  pnlPercent: number;
}

export interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
}

export interface SignalLevel {
  label: string;
  value: number;
  type: 'entry' | 'exit' | 'stopLoss' | 'takeProfit';
}

export interface TradeChartData {
  tradeId: string;
  timeSeries: TimeSeriesPoint[];
  currentValue: number;
  signalLevels: SignalLevel[];
  metricName: string; // e.g., "Price", "RSI", "Volume"
}

export interface MetricData {
  id: string;
  name: string;
  chartData: TradeChartData;
}

export interface StrategyCondition {
  id: string;
  description: string;
  currentValue: number | string;
  targetValue: number | string;
  operator: 'above' | 'below' | 'equals' | 'between';
  isMet: boolean;
  type: 'entry' | 'exit' | 'stopLoss';
}

export interface TradeMetrics {
  tradeId: string;
  availableMetrics: MetricData[];
  strategyConditions: StrategyCondition[];
}

export interface QuantModel {
  id: string;
  name: string;
  strategy: string;
  status: 'ACTIVE' | 'PAUSED' | 'STOPPED';
  totalTrades: number;
  winRate: number;
  totalPnL: number;
  sharpeRatio: number;
  maxDrawdown: number;
  avgWin: number;
  avgLoss: number;
  createdAt: Date;
  lastTradeAt?: Date;
}

export interface DashboardStats {
  totalModels: number;
  activeModels: number;
  totalTrades: number;
  openTrades: number;
  totalPnL: number;
  todayPnL: number;
  winRate: number;
}

