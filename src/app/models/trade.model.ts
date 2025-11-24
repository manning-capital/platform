export interface Trade {
  id: string;
  fromAsset: string;
  toAsset: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  exitPrice?: number;
  pnl: number;
  pnlPercent: number;
}

export interface ModelTrade {
  id: string;
  modelId: string;
  trades: Trade[];
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

export interface Model {
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
  paperTrading?: boolean;
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

export interface ModelParameter {
  name: string;
  value: number | string;
  unit?: string;
  description?: string;
}

export interface ModelParameters {
  strategy: string;
  parameters: ModelParameter[];
}

