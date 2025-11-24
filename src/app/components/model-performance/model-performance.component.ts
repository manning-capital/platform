import { Component, computed, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { TradingService } from '../../services/trading.service';
import { Subject, takeUntil } from 'rxjs';
import { Trade } from '../../models/trade.model';

@Component({
  selector: 'app-model-performance',
  imports: [CommonModule, RouterModule],
  templateUrl: './model-performance.component.html',
  styleUrl: './model-performance.component.css'
})
export class ModelPerformanceComponent implements OnInit, OnDestroy {
  private tradingService = inject(TradingService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();
  
  protected models = this.tradingService.models$;
  protected selectedModelId = signal<string>('');
  
  protected viewMode = computed(() => 
    this.selectedModelId() ? 'detail' : 'list'
  );
  
  protected selectedModel = computed(() => 
    this.tradingService.getModelById(this.selectedModelId())
  );
  protected allModelTrades = computed(() => 
    this.tradingService.getTradesByModel(this.selectedModelId())
  );
  
  // Pagination state
  protected pageSize = signal<number>(10);
  protected currentPage = signal<number>(1);
  
  // Paginated trades
  protected modelTrades = computed(() => {
    const allTrades = this.allModelTrades();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    const end = start + size;
    return allTrades.slice(start, end);
  });
  
  protected totalPages = computed(() => 
    Math.ceil(this.allModelTrades().length / this.pageSize())
  );

  ngOnInit(): void {
    // Read model ID from route params
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const modelId = params['id'] || '';
        this.selectedModelId.set(modelId);
        // Reset pagination when model changes
        if (modelId) {
          this.currentPage.set(1);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected selectModel(modelId: string): void {
    this.router.navigate(['/models', modelId]);
  }

  protected backToList(): void {
    this.router.navigate(['/models']);
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

  protected getTradeSide(trade: Trade): 'BUY' | 'SELL' | 'COMPOUND' {
    return this.tradingService.getTradeSide(trade);
  }

  protected getTradeTags(trade: Trade): string[] {
    const model = this.models().find(m => m.id === trade.modelId);
    return this.tradingService.getTradeTags(trade, model);
  }

  protected getTradeDisplaySymbol(trade: Trade): string {
    return this.tradingService.getTradeDisplaySymbol(trade);
  }

  protected getPrimaryPosition(trade: Trade) {
    return this.tradingService.getPrimaryPosition(trade);
  }

  // Pagination methods
  protected nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  protected previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  protected goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  protected get pageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    
    if (total <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Show smart pagination
      pages.push(1);
      
      if (current > 3) {
        pages.push(-1); // Ellipsis
      }
      
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
      }
      
      if (current < total - 2) {
        pages.push(-1); // Ellipsis
      }
      
      pages.push(total);
    }
    
    return pages;
  }

  // Get view all trades link with query params
  protected getViewAllTradesLink(): string[] {
    return ['/live-trades'];
  }

  protected getViewAllTradesQueryParams(): { [key: string]: string } {
    return {
      model: this.selectedModelId()
    };
  }
}

