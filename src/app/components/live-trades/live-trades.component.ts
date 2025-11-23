import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TradingService } from '../../services/trading.service';

@Component({
  selector: 'app-live-trades',
  imports: [CommonModule],
  templateUrl: './live-trades.component.html',
  styleUrl: './live-trades.component.css'
})
export class LiveTradesComponent {
  private tradingService = inject(TradingService);
  
  protected allTrades = this.tradingService.trades$;
  protected models = this.tradingService.models$;
  
  protected openTrades = computed(() => 
    this.allTrades().filter(t => t.status === 'OPEN')
  );
  
  protected closedTrades = computed(() => 
    this.allTrades().filter(t => t.status === 'CLOSED')
  );
  
  protected totalPnL = computed(() => 
    this.openTrades().reduce((sum, t) => sum + t.pnl, 0)
  );
  
  protected winningTrades = computed(() => 
    this.openTrades().filter(t => t.pnl > 0).length
  );
  
  protected losingTrades = computed(() => 
    this.openTrades().filter(t => t.pnl < 0).length
  );

  protected getModelName(modelId: string): string {
    const model = this.models().find(m => m.id === modelId);
    return model?.name || 'Unknown';
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
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  }

  protected formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
}

