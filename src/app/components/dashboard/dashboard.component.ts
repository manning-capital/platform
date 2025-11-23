import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TradingService } from '../../services/trading.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  private tradingService = inject(TradingService);
  
  protected stats = computed(() => this.tradingService.getDashboardStats());
  protected models = this.tradingService.models$;
  protected recentTrades = computed(() => {
    const trades = this.tradingService.trades$();
    return trades.slice(0, 5).sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  });

  protected isCompoundTrade(trade: any): boolean {
    return this.tradingService.isCompoundTrade(trade);
  }

  protected getTradeDisplaySymbol(trade: any): string {
    return this.tradingService.getTradeDisplaySymbol(trade);
  }

  protected getPrimaryPosition(trade: any) {
    return this.tradingService.getPrimaryPosition(trade);
  }

  protected toggleModel(modelId: string): void {
    this.tradingService.toggleModelStatus(modelId);
  }

  protected formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  protected formatPercent(value: number): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  }

  protected formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }
}

