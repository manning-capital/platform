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

