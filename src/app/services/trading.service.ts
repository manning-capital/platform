import { Injectable, signal } from '@angular/core';
import { Trade, Position, QuantModel, DashboardStats, TradeChartData, TimeSeriesPoint, SignalLevel, TradeMetrics, MetricData, StrategyCondition, ModelParameters, ModelParameter } from '../models/trade.model';

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

  // Helper method to normalize old-format trades to new format
  private normalizeTrade(trade: any): Trade {
    // If already in new format, return as-is
    if (trade.positions && Array.isArray(trade.positions)) {
      return trade as Trade;
    }

    // Convert old format to new format
    const position: Position = {
      id: `${trade.id}-p1`,
      fromAsset: 'USD',
      toAsset: trade.symbol,
      side: trade.side,
      quantity: trade.quantity,
      entryPrice: trade.entryPrice,
      currentPrice: trade.currentPrice,
      exitPrice: trade.exitPrice,
      pnl: trade.pnl,
      pnlPercent: trade.pnlPercent
    };

    return {
      id: trade.id,
      modelId: trade.modelId,
      type: 'simple',
      positions: [position],
      symbol: trade.symbol, // Keep for backward compatibility
      side: trade.side,
      quantity: trade.quantity,
      entryPrice: trade.entryPrice,
      currentPrice: trade.currentPrice,
      exitPrice: trade.exitPrice,
      status: trade.status,
      timestamp: trade.timestamp,
      pnl: trade.pnl,
      pnlPercent: trade.pnlPercent
    };
  }

  // Helper methods for compound trades
  isCompoundTrade(trade: Trade): boolean {
    return trade.type === 'compound' || trade.positions.length > 1;
  }

  getPrimaryPosition(trade: Trade): Position {
    if (!trade.positions || trade.positions.length === 0) {
      throw new Error(`Trade ${trade.id} has no positions`);
    }
    return trade.positions[0];
  }

  getTradeDisplaySymbol(trade: Trade): string {
    if (this.isCompoundTrade(trade)) {
      return trade.positions.map(p => `${p.fromAsset}/${p.toAsset}`).join(' + ');
    }
    const primary = this.getPrimaryPosition(trade);
    return primary.toAsset;
  }

  getTradeTotalPnL(trade: Trade): number {
    return trade.positions.reduce((sum, pos) => sum + pos.pnl, 0);
  }

  getTradeTotalPnLPercent(trade: Trade): number {
    const totalValue = trade.positions.reduce((sum, pos) => sum + (pos.entryPrice * pos.quantity), 0);
    if (totalValue === 0) return 0;
    const totalPnL = this.getTradeTotalPnL(trade);
    return (totalPnL / totalValue) * 100;
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
    const mockTrades: any[] = [
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
      },
      {
        id: 't7',
        modelId: '1',
        symbol: 'AMZN',
        side: 'BUY',
        quantity: 45,
        entryPrice: 178.25,
        currentPrice: 180.50,
        status: 'OPEN',
        timestamp: new Date(Date.now() - 5400000),
        pnl: 101.25,
        pnlPercent: 1.26
      },
      {
        id: 't8',
        modelId: '2',
        symbol: 'AMD',
        side: 'BUY',
        quantity: 120,
        entryPrice: 158.90,
        currentPrice: 157.20,
        exitPrice: 157.20,
        status: 'CLOSED',
        timestamp: new Date(Date.now() - 18000000),
        pnl: -204.00,
        pnlPercent: -1.07
      },
      {
        id: 't9',
        modelId: '4',
        symbol: 'NFLX',
        side: 'BUY',
        quantity: 25,
        entryPrice: 612.40,
        currentPrice: 615.80,
        status: 'OPEN',
        timestamp: new Date(Date.now() - 2700000),
        pnl: 85.00,
        pnlPercent: 0.56
      },
      {
        id: 't10',
        modelId: '1',
        symbol: 'INTC',
        side: 'SELL',
        quantity: 200,
        entryPrice: 42.15,
        currentPrice: 41.80,
        status: 'OPEN',
        timestamp: new Date(Date.now() - 4500000),
        pnl: 70.00,
        pnlPercent: 0.83
      },
      {
        id: 't11',
        modelId: '2',
        symbol: 'BABA',
        side: 'BUY',
        quantity: 85,
        entryPrice: 88.50,
        currentPrice: 90.25,
        status: 'OPEN',
        timestamp: new Date(Date.now() - 3300000),
        pnl: 148.75,
        pnlPercent: 1.98
      },
      {
        id: 't12',
        modelId: '4',
        symbol: 'DIS',
        side: 'BUY',
        quantity: 110,
        entryPrice: 95.30,
        currentPrice: 94.85,
        exitPrice: 94.85,
        status: 'CLOSED',
        timestamp: new Date(Date.now() - 21600000),
        pnl: -49.50,
        pnlPercent: -0.47
      },
      {
        id: 't13',
        modelId: '1',
        symbol: 'PYPL',
        side: 'BUY',
        quantity: 90,
        entryPrice: 62.80,
        currentPrice: 64.20,
        status: 'OPEN',
        timestamp: new Date(Date.now() - 7800000),
        pnl: 126.00,
        pnlPercent: 2.23
      },
      {
        id: 't14',
        modelId: '2',
        symbol: 'SHOP',
        side: 'BUY',
        quantity: 55,
        entryPrice: 78.90,
        currentPrice: 77.50,
        status: 'OPEN',
        timestamp: new Date(Date.now() - 1200000),
        pnl: -77.00,
        pnlPercent: -1.77
      },
      {
        id: 't15',
        modelId: '4',
        symbol: 'SQ',
        side: 'SELL',
        quantity: 140,
        entryPrice: 74.20,
        currentPrice: 73.85,
        status: 'OPEN',
        timestamp: new Date(Date.now() - 6600000),
        pnl: 49.00,
        pnlPercent: 0.47
      },
      {
        id: 't16',
        modelId: '1',
        symbol: 'UBER',
        side: 'BUY',
        quantity: 170,
        entryPrice: 72.50,
        currentPrice: 73.95,
        status: 'OPEN',
        timestamp: new Date(Date.now() - 10800000),
        pnl: 246.50,
        pnlPercent: 2.00
      },
      {
        id: 't17',
        modelId: '2',
        symbol: 'COIN',
        side: 'BUY',
        quantity: 40,
        entryPrice: 245.80,
        currentPrice: 248.30,
        exitPrice: 248.30,
        status: 'CLOSED',
        timestamp: new Date(Date.now() - 25200000),
        pnl: 100.00,
        pnlPercent: 1.02
      },
      {
        id: 't18',
        modelId: '4',
        symbol: 'SNOW',
        side: 'BUY',
        quantity: 65,
        entryPrice: 178.40,
        currentPrice: 175.90,
        status: 'OPEN',
        timestamp: new Date(Date.now() - 9000000),
        pnl: -162.50,
        pnlPercent: -1.40
      },
      {
        id: 't19',
        modelId: '1',
        symbol: 'PLTR',
        side: 'BUY',
        quantity: 250,
        entryPrice: 25.60,
        currentPrice: 26.15,
        status: 'OPEN',
        timestamp: new Date(Date.now() - 12600000),
        pnl: 137.50,
        pnlPercent: 2.15
      },
      {
        id: 't20',
        modelId: '2',
        symbol: 'ROKU',
        side: 'SELL',
        quantity: 95,
        entryPrice: 68.90,
        currentPrice: 69.40,
        status: 'OPEN',
        timestamp: new Date(Date.now() - 4800000),
        pnl: -47.50,
        pnlPercent: -0.73
      },
      {
        id: 't21',
        modelId: '4',
        symbol: 'ZM',
        side: 'BUY',
        quantity: 75,
        entryPrice: 68.25,
        currentPrice: 69.80,
        exitPrice: 69.80,
        status: 'CLOSED',
        timestamp: new Date(Date.now() - 28800000),
        pnl: 116.25,
        pnlPercent: 2.27
      },
      {
        id: 't22',
        modelId: '1',
        symbol: 'SNAP',
        side: 'BUY',
        quantity: 310,
        entryPrice: 11.85,
        currentPrice: 12.20,
        status: 'OPEN',
        timestamp: new Date(Date.now() - 15300000),
        pnl: 108.50,
        pnlPercent: 2.95
      },
      {
        id: 't23',
        modelId: '2',
        symbol: 'SPOT',
        side: 'BUY',
        quantity: 35,
        entryPrice: 312.40,
        currentPrice: 315.80,
        status: 'OPEN',
        timestamp: new Date(Date.now() - 16200000),
        pnl: 119.00,
        pnlPercent: 1.09
      },
      // Compound Trade Examples
      {
        id: 't-compound-1',
        modelId: '1',
        type: 'compound',
        positions: [
          {
            id: 'p1',
            fromAsset: 'USD',
            toAsset: 'BTC',
            side: 'BUY',
            quantity: 0.5,
            entryPrice: 45000,
            currentPrice: 45500,
            pnl: 250,
            pnlPercent: 1.11
          },
          {
            id: 'p2',
            fromAsset: 'USD',
            toAsset: 'ETH',
            side: 'SELL',
            quantity: 10,
            entryPrice: 2800,
            currentPrice: 2750,
            pnl: 500,
            pnlPercent: 1.79
          }
        ],
        status: 'OPEN',
        timestamp: new Date(Date.now() - 5400000),
        pnl: 750,
        pnlPercent: 1.45
      },
      {
        id: 't-compound-2',
        modelId: '2',
        type: 'compound',
        positions: [
          {
            id: 'p3',
            fromAsset: 'USD',
            toAsset: 'AAPL',
            side: 'BUY',
            quantity: 50,
            entryPrice: 178.50,
            currentPrice: 180.20,
            pnl: 85,
            pnlPercent: 0.95
          },
          {
            id: 'p4',
            fromAsset: 'USD',
            toAsset: 'MSFT',
            side: 'SELL',
            quantity: 30,
            entryPrice: 410.00,
            currentPrice: 408.50,
            pnl: 45,
            pnlPercent: 0.37
          }
        ],
        status: 'OPEN',
        timestamp: new Date(Date.now() - 7200000),
        pnl: 130,
        pnlPercent: 0.66
      },
      {
        id: 't-compound-3',
        modelId: '1',
        type: 'compound',
        positions: [
          {
            id: 'p5',
            fromAsset: 'USD',
            toAsset: 'TSLA',
            side: 'BUY',
            quantity: 20,
            entryPrice: 242.30,
            currentPrice: 240.50,
            exitPrice: 240.50,
            pnl: -36,
            pnlPercent: -0.74
          },
          {
            id: 'p6',
            fromAsset: 'USD',
            toAsset: 'NVDA',
            side: 'SELL',
            quantity: 15,
            entryPrice: 495.80,
            currentPrice: 498.20,
            exitPrice: 498.20,
            pnl: -36,
            pnlPercent: -0.48
          }
        ],
        status: 'CLOSED',
        timestamp: new Date(Date.now() - 18000000),
        pnl: -72,
        pnlPercent: -0.61
      },
      {
        id: 't-compound-4',
        modelId: '3',
        type: 'compound',
        positions: [
          {
            id: 'p7',
            fromAsset: 'USD',
            toAsset: 'GOOGL',
            side: 'BUY',
            quantity: 100,
            entryPrice: 140.25,
            currentPrice: 142.80,
            pnl: 255,
            pnlPercent: 1.82
          },
          {
            id: 'p8',
            fromAsset: 'USD',
            toAsset: 'AMZN',
            side: 'BUY',
            quantity: 60,
            entryPrice: 175.50,
            currentPrice: 178.20,
            pnl: 162,
            pnlPercent: 1.54
          },
          {
            id: 'p9',
            fromAsset: 'USD',
            toAsset: 'META',
            side: 'SELL',
            quantity: 40,
            entryPrice: 485.00,
            currentPrice: 482.50,
            pnl: 100,
            pnlPercent: 0.52
          }
        ],
        status: 'OPEN',
        timestamp: new Date(Date.now() - 3600000),
        pnl: 517,
        pnlPercent: 1.63
      },
      {
        id: 't-compound-5',
        modelId: '4',
        type: 'compound',
        positions: [
          {
            id: 'p10',
            fromAsset: 'USD',
            toAsset: 'NFLX',
            side: 'SELL',
            quantity: 35,
            entryPrice: 610.00,
            currentPrice: 612.50,
            pnl: -87.50,
            pnlPercent: -0.41
          },
          {
            id: 'p11',
            fromAsset: 'USD',
            toAsset: 'DIS',
            side: 'BUY',
            quantity: 150,
            entryPrice: 94.20,
            currentPrice: 95.80,
            pnl: 240,
            pnlPercent: 1.70
          }
        ],
        status: 'OPEN',
        timestamp: new Date(Date.now() - 10800000),
        pnl: 152.50,
        pnlPercent: 0.65
      },
      {
        id: 't-compound-6',
        modelId: '1',
        type: 'compound',
        positions: [
          {
            id: 'p12',
            fromAsset: 'USD',
            toAsset: 'PYPL',
            side: 'BUY',
            quantity: 120,
            entryPrice: 63.50,
            currentPrice: 65.20,
            exitPrice: 65.20,
            pnl: 204,
            pnlPercent: 2.68
          },
          {
            id: 'p13',
            fromAsset: 'USD',
            toAsset: 'SQ',
            side: 'SELL',
            quantity: 200,
            entryPrice: 74.80,
            currentPrice: 73.40,
            exitPrice: 73.40,
            pnl: 280,
            pnlPercent: 1.87
          },
          {
            id: 'p14',
            fromAsset: 'USD',
            toAsset: 'SHOP',
            side: 'BUY',
            quantity: 80,
            entryPrice: 79.20,
            currentPrice: 81.50,
            exitPrice: 81.50,
            pnl: 184,
            pnlPercent: 2.90
          }
        ],
        status: 'CLOSED',
        timestamp: new Date(Date.now() - 25200000),
        pnl: 668,
        pnlPercent: 2.48
      },
      {
        id: 't-compound-7',
        modelId: '2',
        type: 'compound',
        positions: [
          {
            id: 'p15',
            fromAsset: 'USD',
            toAsset: 'AMD',
            side: 'BUY',
            quantity: 200,
            entryPrice: 159.50,
            currentPrice: 161.80,
            pnl: 460,
            pnlPercent: 1.44
          },
          {
            id: 'p16',
            fromAsset: 'USD',
            toAsset: 'INTC',
            side: 'SELL',
            quantity: 300,
            entryPrice: 42.30,
            currentPrice: 41.90,
            pnl: 120,
            pnlPercent: 0.95
          }
        ],
        status: 'OPEN',
        timestamp: new Date(Date.now() - 1800000),
        pnl: 580,
        pnlPercent: 1.20
      },
      {
        id: 't-compound-8',
        modelId: '3',
        type: 'compound',
        positions: [
          {
            id: 'p17',
            fromAsset: 'USD',
            toAsset: 'BABA',
            side: 'SELL',
            quantity: 120,
            entryPrice: 89.50,
            currentPrice: 91.20,
            exitPrice: 91.20,
            pnl: -204,
            pnlPercent: -1.90
          },
          {
            id: 'p18',
            fromAsset: 'USD',
            toAsset: 'SPOT',
            side: 'BUY',
            quantity: 50,
            entryPrice: 310.00,
            currentPrice: 308.50,
            exitPrice: 308.50,
            pnl: -75,
            pnlPercent: -0.48
          }
        ],
        status: 'CLOSED',
        timestamp: new Date(Date.now() - 28800000),
        pnl: -279,
        pnlPercent: -1.19
      },
      {
        id: 't-compound-9',
        modelId: '4',
        type: 'compound',
        positions: [
          {
            id: 'p19',
            fromAsset: 'USD',
            toAsset: 'BTC',
            side: 'BUY',
            quantity: 0.25,
            entryPrice: 45200,
            currentPrice: 45600,
            pnl: 100,
            pnlPercent: 0.88
          },
          {
            id: 'p20',
            fromAsset: 'USD',
            toAsset: 'ETH',
            side: 'BUY',
            quantity: 5,
            entryPrice: 2820,
            currentPrice: 2850,
            pnl: 150,
            pnlPercent: 1.06
          },
          {
            id: 'p21',
            fromAsset: 'USD',
            toAsset: 'SOL',
            side: 'SELL',
            quantity: 50,
            entryPrice: 185.00,
            currentPrice: 183.50,
            pnl: 75,
            pnlPercent: 0.81
          }
        ],
        status: 'OPEN',
        timestamp: new Date(Date.now() - 900000),
        pnl: 325,
        pnlPercent: 0.92
      },
      {
        id: 't-compound-10',
        modelId: '1',
        type: 'compound',
        positions: [
          {
            id: 'p22',
            fromAsset: 'USD',
            toAsset: 'TSLA',
            side: 'BUY',
            quantity: 75,
            entryPrice: 241.00,
            currentPrice: 243.80,
            pnl: 210,
            pnlPercent: 1.16
          },
          {
            id: 'p23',
            fromAsset: 'USD',
            toAsset: 'NVDA',
            side: 'BUY',
            quantity: 25,
            entryPrice: 496.00,
            currentPrice: 499.50,
            pnl: 87.50,
            pnlPercent: 0.71
          },
          {
            id: 'p24',
            fromAsset: 'USD',
            toAsset: 'MSFT',
            side: 'SELL',
            quantity: 50,
            entryPrice: 409.50,
            currentPrice: 407.80,
            pnl: 85,
            pnlPercent: 0.42
          }
        ],
        status: 'OPEN',
        timestamp: new Date(Date.now() - 4500000),
        pnl: 382.50,
        pnlPercent: 0.76
      }
    ];

    // Normalize all trades to new format
    const normalizedTrades = mockTrades.map(trade => this.normalizeTrade(trade));

    this.models.set(mockModels);
    this.trades.set(normalizedTrades);
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
        // Update all positions
        const updatedPositions = trade.positions.map(position => {
          // Simulate price movement (-0.5% to +0.5%)
          const priceChange = (Math.random() - 0.5) * position.currentPrice * 0.01;
          const newPrice = Number((position.currentPrice + priceChange).toFixed(2));
          
          const pnl = position.side === 'BUY' 
            ? (newPrice - position.entryPrice) * position.quantity
            : (position.entryPrice - newPrice) * position.quantity;
          const pnlPercent = ((pnl / (position.entryPrice * position.quantity)) * 100);

          return {
            ...position,
            currentPrice: newPrice,
            pnl: Number(pnl.toFixed(2)),
            pnlPercent: Number(pnlPercent.toFixed(2))
          };
        });

        // Calculate trade-level P&L
        const totalPnL = updatedPositions.reduce((sum, pos) => sum + pos.pnl, 0);
        const totalValue = updatedPositions.reduce((sum, pos) => sum + (pos.entryPrice * pos.quantity), 0);
        const totalPnLPercent = totalValue > 0 ? (totalPnL / totalValue) * 100 : 0;

        // Update legacy fields for backward compatibility
        const primaryPosition = updatedPositions[0];
        
        return {
          ...trade,
          positions: updatedPositions,
          pnl: Number(totalPnL.toFixed(2)),
          pnlPercent: Number(totalPnLPercent.toFixed(2)),
          // Legacy fields
          currentPrice: primaryPosition.currentPrice,
          entryPrice: primaryPosition.entryPrice,
          quantity: primaryPosition.quantity,
          side: primaryPosition.side
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

  getTradeChartData(tradeId: string): TradeChartData | null {
    const trade = this.trades().find(t => t.id === tradeId);
    if (!trade) return null;

    const model = this.getModelById(trade.modelId);
    if (!model) return null;

    // Generate time series data based on strategy
    return this.generateChartDataForStrategy(trade, model.strategy, 'Price');
  }

  getTradeMetrics(tradeId: string): TradeMetrics | null {
    const trade = this.trades().find(t => t.id === tradeId);
    if (!trade) return null;

    const model = this.getModelById(trade.modelId);
    if (!model) return null;

    const availableMetrics = this.generateMetricsForStrategy(trade, model.strategy);
    const strategyConditions = this.generateStrategyConditions(trade, model.strategy);

    return {
      tradeId,
      availableMetrics,
      strategyConditions
    };
  }

  getModelParameters(tradeId: string): ModelParameters | null {
    const trade = this.trades().find(t => t.id === tradeId);
    if (!trade) return null;

    const model = this.getModelById(trade.modelId);
    if (!model) return null;

    const primaryPosition = this.getPrimaryPosition(trade);
    return this.generateModelParameters(model.strategy, primaryPosition.entryPrice);
  }

  private generateModelParameters(strategy: string, entryPrice: number): ModelParameters {
    const parameters: ModelParameter[] = [];

    switch (strategy) {
      case 'Statistical Arbitrage':
      case 'Mean Reversion':
        parameters.push(
          { name: 'Spread Ratio', value: 1.25, unit: '', description: 'Ratio of spread to mean' },
          { name: 'Mean-Reversion Rate (μ)', value: 0.15, unit: '', description: 'Speed of mean reversion' },
          { name: 'Long Term Mean (θ)', value: entryPrice * 0.98, unit: '$', description: 'Long-term equilibrium price' },
          { name: 'Variance (σ)', value: 0.08, unit: '', description: 'Price volatility' }
        );
        break;
      case 'Trend Following':
        parameters.push(
          { name: 'Momentum Period', value: 14, unit: 'days', description: 'Lookback period for momentum' },
          { name: 'Entry Threshold', value: 0.02, unit: '', description: 'Minimum momentum to enter' },
          { name: 'Stop Loss', value: 0.05, unit: '', description: 'Maximum loss percentage' },
          { name: 'Trailing Stop', value: 0.03, unit: '', description: 'Trailing stop percentage' }
        );
        break;
      case 'Options Strategy':
        parameters.push(
          { name: 'Implied Volatility', value: 0.22, unit: '', description: 'Expected volatility' },
          { name: 'Delta', value: 0.45, unit: '', description: 'Price sensitivity' },
          { name: 'Gamma', value: 0.12, unit: '', description: 'Delta sensitivity' },
          { name: 'Theta', value: -0.05, unit: '/day', description: 'Time decay rate' }
        );
        break;
      case 'Market Making':
        parameters.push(
          { name: 'Bid-Ask Spread', value: 0.001, unit: '', description: 'Minimum spread' },
          { name: 'Inventory Limit', value: 1000, unit: 'shares', description: 'Maximum position size' },
          { name: 'Risk Aversion', value: 0.5, unit: '', description: 'Risk tolerance parameter' },
          { name: 'Order Size', value: 100, unit: 'shares', description: 'Standard order size' }
        );
        break;
      default:
        parameters.push(
          { name: 'Strategy Type', value: strategy, unit: '', description: 'Trading strategy' }
        );
    }

    return {
      strategy,
      parameters
    };
  }

  private generateChartDataForStrategy(trade: Trade, strategy: string, metricName: string): TradeChartData {
    const primaryPosition = this.getPrimaryPosition(trade);
    const now = Date.now();
    const hourMs = 60 * 60 * 1000;
    const points = 50; // Last 50 data points
    
    const timeSeries: TimeSeriesPoint[] = [];
    const basePrice = primaryPosition.entryPrice;
    const baseValue = metricName === 'Price' ? basePrice : (metricName === 'Volume' ? 1000000 : 50);
    
    // Generate time series with different patterns based on strategy and metric
    for (let i = 0; i < points; i++) {
      const timestamp = new Date(now - (points - i) * hourMs);
      let value: number;

      // Generate values based on metric type and strategy
      if (metricName === 'Price') {
        switch (strategy) {
          case 'Mean Reversion':
            value = basePrice + Math.sin(i / 5) * (basePrice * 0.02) + (Math.random() - 0.5) * (basePrice * 0.01);
            break;
          case 'Trend Following':
            const trend = primaryPosition.side === 'BUY' ? 1 : -1;
            value = basePrice + (i / points) * (basePrice * 0.05) * trend + (Math.random() - 0.5) * (basePrice * 0.01);
            break;
          case 'Options Strategy':
            value = basePrice + Math.sin(i / 3) * (basePrice * 0.03) + (Math.random() - 0.5) * (basePrice * 0.02);
            break;
          case 'Market Making':
            value = basePrice + (Math.random() - 0.5) * (basePrice * 0.005);
            break;
          default:
            value = basePrice + (Math.random() - 0.5) * (basePrice * 0.02);
        }
      } else if (metricName === 'Volume') {
        // Volume patterns
        value = baseValue * (0.7 + Math.random() * 0.6) + Math.sin(i / 8) * baseValue * 0.3;
      } else if (metricName === 'Spread') {
        // Bid-ask spread
        value = baseValue * (0.001 + Math.random() * 0.002);
      } else {
        // Generic oscillator (RSI, momentum, etc.)
        value = baseValue + Math.sin(i / 7) * 20 + (Math.random() - 0.5) * 10;
      }
      
      timeSeries.push({ timestamp, value });
    }
    
    // Add current value as last point
    const currentValue = metricName === 'Price' ? primaryPosition.currentPrice : timeSeries[timeSeries.length - 1].value;
    timeSeries.push({ 
      timestamp: new Date(now), 
      value: currentValue
    });

    // Generate signal levels based on strategy and metric
    const signalLevels = this.generateSignalLevels(trade, strategy, metricName);

    return {
      tradeId: trade.id,
      timeSeries,
      currentValue,
      signalLevels,
      metricName
    };
  }

  private generateMetricsForStrategy(trade: Trade, strategy: string): MetricData[] {
    const metrics: MetricData[] = [];

    // All strategies have Price
    metrics.push({
      id: 'price',
      name: 'Price',
      chartData: this.generateChartDataForStrategy(trade, strategy, 'Price')
    });

    // Strategy-specific metrics
    switch (strategy) {
      case 'Mean Reversion':
        metrics.push({
          id: 'spread',
          name: 'Bid-Ask Spread',
          chartData: this.generateChartDataForStrategy(trade, strategy, 'Spread')
        });
        metrics.push({
          id: 'volume',
          name: 'Volume',
          chartData: this.generateChartDataForStrategy(trade, strategy, 'Volume')
        });
        break;
      case 'Trend Following':
        metrics.push({
          id: 'volume',
          name: 'Volume',
          chartData: this.generateChartDataForStrategy(trade, strategy, 'Volume')
        });
        metrics.push({
          id: 'momentum',
          name: 'Momentum',
          chartData: this.generateChartDataForStrategy(trade, strategy, 'Momentum')
        });
        break;
      case 'Options Strategy':
        metrics.push({
          id: 'volume',
          name: 'Volume',
          chartData: this.generateChartDataForStrategy(trade, strategy, 'Volume')
        });
        metrics.push({
          id: 'volatility',
          name: 'Implied Volatility',
          chartData: this.generateChartDataForStrategy(trade, strategy, 'Volatility')
        });
        break;
      case 'Market Making':
        metrics.push({
          id: 'spread',
          name: 'Bid-Ask Spread',
          chartData: this.generateChartDataForStrategy(trade, strategy, 'Spread')
        });
        metrics.push({
          id: 'volume',
          name: 'Volume',
          chartData: this.generateChartDataForStrategy(trade, strategy, 'Volume')
        });
        break;
    }

    return metrics;
  }

  private generateStrategyConditions(trade: Trade, strategy: string): StrategyCondition[] {
    const conditions: StrategyCondition[] = [];
    const primaryPosition = this.getPrimaryPosition(trade);
    const basePrice = primaryPosition.entryPrice;
    const currentPrice = primaryPosition.currentPrice;

    switch (strategy) {
      case 'Mean Reversion':
        conditions.push({
          id: 'price-revert',
          description: 'Price returns to mean',
          currentValue: currentPrice.toFixed(2),
          targetValue: basePrice.toFixed(2),
          operator: 'equals',
          isMet: Math.abs(currentPrice - basePrice) / basePrice < 0.005,
          type: 'exit'
        });
        conditions.push({
          id: 'spread-narrow',
          description: 'Spread narrows below threshold',
          currentValue: '0.15%',
          targetValue: '< 0.10%',
          operator: 'below',
          isMet: Math.random() > 0.5,
          type: 'exit'
        });
        conditions.push({
          id: 'stop-loss',
          description: 'Stop loss not triggered',
          currentValue: currentPrice.toFixed(2),
          targetValue: (basePrice * (primaryPosition.side === 'BUY' ? 0.97 : 1.03)).toFixed(2),
          operator: primaryPosition.side === 'BUY' ? 'above' : 'below',
          isMet: primaryPosition.side === 'BUY' ? currentPrice > basePrice * 0.97 : currentPrice < basePrice * 1.03,
          type: 'stopLoss'
        });
        break;
      case 'Trend Following':
        conditions.push({
          id: 'trend-reversal',
          description: 'Trend reversal detected',
          currentValue: primaryPosition.side === 'BUY' ? 'Uptrend' : 'Downtrend',
          targetValue: 'Reversal',
          operator: 'equals',
          isMet: false,
          type: 'exit'
        });
        conditions.push({
          id: 'volume-decline',
          description: 'Volume declining for 3 periods',
          currentValue: '2 periods',
          targetValue: '3 periods',
          operator: 'equals',
          isMet: false,
          type: 'exit'
        });
        conditions.push({
          id: 'profit-target',
          description: 'Profit target reached',
          currentValue: ((currentPrice / basePrice - 1) * 100).toFixed(2) + '%',
          targetValue: (primaryPosition.side === 'BUY' ? '+8%' : '-8%'),
          operator: primaryPosition.side === 'BUY' ? 'above' : 'below',
          isMet: primaryPosition.side === 'BUY' ? currentPrice >= basePrice * 1.08 : currentPrice <= basePrice * 0.92,
          type: 'exit'
        });
        break;
      case 'Options Strategy':
        conditions.push({
          id: 'time-decay',
          description: 'Days to expiration',
          currentValue: '15 days',
          targetValue: '< 7 days',
          operator: 'below',
          isMet: false,
          type: 'exit'
        });
        conditions.push({
          id: 'vol-expansion',
          description: 'Implied volatility expanded',
          currentValue: '25%',
          targetValue: '> 30%',
          operator: 'above',
          isMet: false,
          type: 'exit'
        });
        conditions.push({
          id: 'profit-level',
          description: 'Reached exit level 1',
          currentValue: ((currentPrice / basePrice - 1) * 100).toFixed(2) + '%',
          targetValue: '+3%',
          operator: 'above',
          isMet: primaryPosition.side === 'BUY' ? currentPrice >= basePrice * 1.03 : currentPrice <= basePrice * 0.97,
          type: 'exit'
        });
        break;
      case 'Market Making':
        conditions.push({
          id: 'spread-widen',
          description: 'Spread widened beyond range',
          currentValue: '0.05%',
          targetValue: '> 0.20%',
          operator: 'above',
          isMet: false,
          type: 'exit'
        });
        conditions.push({
          id: 'inventory-limit',
          description: 'Inventory within limits',
          currentValue: primaryPosition.quantity.toString(),
          targetValue: '< 150',
          operator: 'below',
          isMet: primaryPosition.quantity < 150,
          type: 'exit'
        });
        conditions.push({
          id: 'price-deviation',
          description: 'Price deviation from fair value',
          currentValue: ((currentPrice / basePrice - 1) * 100).toFixed(2) + '%',
          targetValue: '< 0.2%',
          operator: 'below',
          isMet: Math.abs(currentPrice - basePrice) / basePrice < 0.002,
          type: 'exit'
        });
        break;
    }

    return conditions;
  }

  private generateSignalLevels(trade: Trade, strategy: string, metricName: string): SignalLevel[] {
    if (metricName !== 'Price') {
      // Non-price metrics don't have traditional entry/exit levels
      return [];
    }
    const primaryPosition = this.getPrimaryPosition(trade);
    const levels: SignalLevel[] = [];
    const basePrice = primaryPosition.entryPrice;

    // Entry level (always at entry price)
    levels.push({
      label: 'Entry',
      value: primaryPosition.entryPrice,
      type: 'entry'
    });

    switch (strategy) {
      case 'Mean Reversion':
        // Stop loss further away, take profit closer
        if (primaryPosition.side === 'BUY') {
          levels.push({
            label: 'Stop Loss',
            value: basePrice * 0.97,
            type: 'stopLoss'
          });
          levels.push({
            label: 'Take Profit',
            value: basePrice * 1.02,
            type: 'takeProfit'
          });
        } else {
          levels.push({
            label: 'Stop Loss',
            value: basePrice * 1.03,
            type: 'stopLoss'
          });
          levels.push({
            label: 'Take Profit',
            value: basePrice * 0.98,
            type: 'takeProfit'
          });
        }
        break;
      case 'Trend Following':
        // Wider stop loss, higher take profit
        if (primaryPosition.side === 'BUY') {
          levels.push({
            label: 'Stop Loss',
            value: basePrice * 0.95,
            type: 'stopLoss'
          });
          levels.push({
            label: 'Take Profit',
            value: basePrice * 1.08,
            type: 'takeProfit'
          });
        } else {
          levels.push({
            label: 'Stop Loss',
            value: basePrice * 1.05,
            type: 'stopLoss'
          });
          levels.push({
            label: 'Take Profit',
            value: basePrice * 0.92,
            type: 'takeProfit'
          });
        }
        break;
      case 'Options Strategy':
        // Multiple exit levels
        if (primaryPosition.side === 'BUY') {
          levels.push({
            label: 'Stop Loss',
            value: basePrice * 0.96,
            type: 'stopLoss'
          });
          levels.push({
            label: 'Exit 1',
            value: basePrice * 1.03,
            type: 'exit'
          });
          levels.push({
            label: 'Exit 2',
            value: basePrice * 1.06,
            type: 'exit'
          });
        } else {
          levels.push({
            label: 'Stop Loss',
            value: basePrice * 1.04,
            type: 'stopLoss'
          });
          levels.push({
            label: 'Exit 1',
            value: basePrice * 0.97,
            type: 'exit'
          });
          levels.push({
            label: 'Exit 2',
            value: basePrice * 0.94,
            type: 'exit'
          });
        }
        break;
      case 'Market Making':
        // Tight range
        levels.push({
          label: 'Lower Bound',
          value: basePrice * 0.998,
          type: 'stopLoss'
        });
        levels.push({
          label: 'Upper Bound',
          value: basePrice * 1.002,
          type: 'takeProfit'
        });
        break;
    }

    return levels;
  }
}

