import { Injectable, signal } from '@angular/core';
import { Trade, QuantModel, DashboardStats } from '../models/trade.model';

@Injectable({
  providedIn: 'root'
})
export class TradingService {
  private models = signal<QuantModel[]>([]);
  private trades = signal<Trade[]>([]);
  
  readonly models$ = this.models.asReadonly();
  readonly trades$ = this.trades.asReadonly();

  constructor() {
    this.initializeMockData();
    this.startLiveUpdates();
  }

  private initializeMockData(): void {
    // Initialize with mock quantitative models
    const mockModels: QuantModel[] = [
      {
        id: '1',
        name: 'Mean Reversion Alpha',
        strategy: 'Statistical Arbitrage',
        status: 'ACTIVE',
        totalTrades: 342,
        winRate: 64.5,
        totalPnL: 125420.50,
        sharpeRatio: 2.34,
        maxDrawdown: -8.2,
        avgWin: 850.30,
        avgLoss: -420.15,
        createdAt: new Date('2024-01-15'),
        lastTradeAt: new Date()
      },
      {
        id: '2',
        name: 'Momentum Breakout',
        strategy: 'Trend Following',
        status: 'ACTIVE',
        totalTrades: 198,
        winRate: 58.3,
        totalPnL: 89750.25,
        sharpeRatio: 1.87,
        maxDrawdown: -12.5,
        avgWin: 1245.80,
        avgLoss: -630.45,
        createdAt: new Date('2024-02-20'),
        lastTradeAt: new Date()
      },
      {
        id: '3',
        name: 'Volatility Harvester',
        strategy: 'Options Strategy',
        status: 'PAUSED',
        totalTrades: 156,
        winRate: 71.2,
        totalPnL: 67890.75,
        sharpeRatio: 2.91,
        maxDrawdown: -5.8,
        avgWin: 680.20,
        avgLoss: -340.10,
        createdAt: new Date('2024-03-10'),
        lastTradeAt: new Date(Date.now() - 86400000)
      },
      {
        id: '4',
        name: 'Market Maker Bot',
        strategy: 'Market Making',
        status: 'ACTIVE',
        totalTrades: 1247,
        winRate: 55.8,
        totalPnL: 45320.90,
        sharpeRatio: 1.52,
        maxDrawdown: -15.3,
        avgWin: 320.50,
        avgLoss: -280.30,
        createdAt: new Date('2024-01-05'),
        lastTradeAt: new Date()
      }
    ];

    // Initialize with mock trades
    const mockTrades: Trade[] = [
      {
        id: 't1',
        modelId: '1',
        symbol: 'AAPL',
        side: 'BUY',
        quantity: 100,
        entryPrice: 178.50,
        currentPrice: 179.85,
        status: 'OPEN',
        timestamp: new Date(Date.now() - 3600000),
        pnl: 135.00,
        pnlPercent: 0.76
      },
      {
        id: 't2',
        modelId: '2',
        symbol: 'TSLA',
        side: 'BUY',
        quantity: 50,
        entryPrice: 242.30,
        currentPrice: 245.75,
        status: 'OPEN',
        timestamp: new Date(Date.now() - 7200000),
        pnl: 172.50,
        pnlPercent: 1.42
      },
      {
        id: 't3',
        modelId: '1',
        symbol: 'MSFT',
        side: 'SELL',
        quantity: 75,
        entryPrice: 410.20,
        currentPrice: 408.90,
        exitPrice: 408.90,
        status: 'CLOSED',
        timestamp: new Date(Date.now() - 14400000),
        pnl: 97.50,
        pnlPercent: 0.32
      },
      {
        id: 't4',
        modelId: '4',
        symbol: 'NVDA',
        side: 'BUY',
        quantity: 30,
        entryPrice: 495.80,
        currentPrice: 492.15,
        status: 'OPEN',
        timestamp: new Date(Date.now() - 1800000),
        pnl: -109.50,
        pnlPercent: -0.74
      },
      {
        id: 't5',
        modelId: '2',
        symbol: 'META',
        side: 'BUY',
        quantity: 60,
        entryPrice: 485.40,
        currentPrice: 487.90,
        status: 'OPEN',
        timestamp: new Date(Date.now() - 900000),
        pnl: 150.00,
        pnlPercent: 0.52
      },
      {
        id: 't6',
        modelId: '4',
        symbol: 'GOOGL',
        side: 'SELL',
        quantity: 80,
        entryPrice: 139.75,
        currentPrice: 140.20,
        status: 'OPEN',
        timestamp: new Date(Date.now() - 600000),
        pnl: -36.00,
        pnlPercent: -0.32
      }
    ];

    this.models.set(mockModels);
    this.trades.set(mockTrades);
  }

  private startLiveUpdates(): void {
    // Simulate live price updates every 3 seconds
    setInterval(() => {
      this.updateTradePrices();
    }, 3000);
  }

  private updateTradePrices(): void {
    const currentTrades = this.trades();
    const updatedTrades = currentTrades.map(trade => {
      if (trade.status === 'OPEN') {
        // Simulate price movement (-0.5% to +0.5%)
        const priceChange = (Math.random() - 0.5) * trade.currentPrice * 0.01;
        const newPrice = Number((trade.currentPrice + priceChange).toFixed(2));
        const pnl = trade.side === 'BUY' 
          ? (newPrice - trade.entryPrice) * trade.quantity
          : (trade.entryPrice - newPrice) * trade.quantity;
        const pnlPercent = ((pnl / (trade.entryPrice * trade.quantity)) * 100);

        return {
          ...trade,
          currentPrice: newPrice,
          pnl: Number(pnl.toFixed(2)),
          pnlPercent: Number(pnlPercent.toFixed(2))
        };
      }
      return trade;
    });

    this.trades.set(updatedTrades);
  }

  getDashboardStats(): DashboardStats {
    const models = this.models();
    const trades = this.trades();
    const openTrades = trades.filter(t => t.status === 'OPEN');
    
    const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
    const todayTrades = trades.filter(t => {
      const today = new Date().setHours(0, 0, 0, 0);
      return t.timestamp.getTime() >= today;
    });
    const todayPnL = todayTrades.reduce((sum, t) => sum + t.pnl, 0);

    const closedTrades = trades.filter(t => t.status === 'CLOSED');
    const winningTrades = closedTrades.filter(t => t.pnl > 0).length;
    const winRate = closedTrades.length > 0 
      ? (winningTrades / closedTrades.length) * 100 
      : 0;

    return {
      totalModels: models.length,
      activeModels: models.filter(m => m.status === 'ACTIVE').length,
      totalTrades: trades.length,
      openTrades: openTrades.length,
      totalPnL,
      todayPnL,
      winRate
    };
  }

  getModelById(id: string): QuantModel | undefined {
    return this.models().find(m => m.id === id);
  }

  getTradesByModel(modelId: string): Trade[] {
    return this.trades().filter(t => t.modelId === modelId);
  }

  toggleModelStatus(modelId: string): void {
    const models = this.models();
    const updatedModels = models.map(m => {
      if (m.id === modelId) {
        return {
          ...m,
          status: m.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
        } as QuantModel;
      }
      return m;
    });
    this.models.set(updatedModels);
  }
}

