import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TradingService } from '../../services/trading.service';

@Component({
  selector: 'app-model-performance',
  imports: [CommonModule],
  templateUrl: './model-performance.component.html',
  styleUrl: './model-performance.component.css'
})
export class ModelPerformanceComponent {
  private tradingService = inject(TradingService);
  
  protected models = this.tradingService.models$;
  protected selectedModelId = computed(() => this.models()[0]?.id || '');
  protected selectedModel = computed(() => 
    this.tradingService.getModelById(this.selectedModelId())
  );
  protected modelTrades = computed(() => 
    this.tradingService.getTradesByModel(this.selectedModelId())
  );

  protected selectModel(modelId: string): void {
    // In a real app, this would update a signal
    console.log('Selected model:', modelId);
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

  protected getWinLossRatio(model: any): string {
    const ratio = model.avgWin / Math.abs(model.avgLoss);
    return ratio.toFixed(2);
  }

  protected getExpectancy(model: any): number {
    const winRate = model.winRate / 100;
    const lossRate = 1 - winRate;
    return (winRate * model.avgWin) - (lossRate * Math.abs(model.avgLoss));
  }

  protected getProfitFactor(model: any): number {
    const winAmount = model.avgWin * (model.winRate / 100);
    const lossAmount = Math.abs(model.avgLoss) * (1 - model.winRate / 100);
    return winAmount / lossAmount;
  }
}

