import { Component, computed, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TradingService } from '../../services/trading.service';
import { Trade } from '../../models/trade.model';
import { TradeMetricsComponent } from '../trade-metrics/trade-metrics.component';

@Component({
  selector: 'app-live-trades',
  imports: [CommonModule, FormsModule, TradeMetricsComponent],
  templateUrl: './live-trades.component.html',
  styleUrl: './live-trades.component.css'
})
export class LiveTradesComponent {
  private tradingService = inject(TradingService);
  
  protected allTrades = this.tradingService.trades$;
  protected models = this.tradingService.models$;
  
  // Filter state
  protected filterStatus = signal<'ALL' | 'OPEN' | 'CLOSED'>('ALL');
  protected filterSide = signal<'ALL' | 'BUY' | 'SELL'>('ALL');
  protected filterModel = signal<string>('ALL');
  protected searchTerm = signal<string>('');
  
  // Date filter state - default to past week
  private getDefaultStartDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    date.setHours(0, 0, 0, 0);
    return date;
  }
  
  protected startDate = signal<Date>(this.getDefaultStartDate());
  protected endDate = signal<Date>(new Date());
  
  // Pagination state
  protected pageSize = signal<number>(10);
  protected currentPage = signal<number>(1);
  
  protected openTrades = computed(() => 
    this.allTrades().filter(t => t.status === 'OPEN')
  );
  
  protected closedTrades = computed(() => 
    this.allTrades().filter(t => t.status === 'CLOSED')
  );
  
  // Filtered trades based on all filters
  protected filteredTrades = computed(() => {
    let trades = this.allTrades();
    
    // Filter by date range OR open status
    // Always show open positions regardless of date
    const start = this.startDate();
    const end = new Date(this.endDate());
    end.setHours(23, 59, 59, 999); // Include entire end date
    
    trades = trades.filter(t => 
      t.status === 'OPEN' || // Always include open positions
      (t.timestamp >= start && t.timestamp <= end) // Or within date range
    );
    
    // Filter by status
    if (this.filterStatus() !== 'ALL') {
      trades = trades.filter(t => t.status === this.filterStatus());
    }
    
    // Filter by side
    if (this.filterSide() !== 'ALL') {
      trades = trades.filter(t => t.side === this.filterSide());
    }
    
    // Filter by model
    if (this.filterModel() !== 'ALL') {
      trades = trades.filter(t => t.modelId === this.filterModel());
    }
    
    // Filter by search term (symbol)
    if (this.searchTerm().trim()) {
      const term = this.searchTerm().toLowerCase();
      trades = trades.filter(t => t.symbol.toLowerCase().includes(term));
    }
    
    return trades;
  });
  
  // Paginated trades
  protected paginatedTrades = computed(() => {
    const filtered = this.filteredTrades();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    const end = start + size;
    return filtered.slice(start, end);
  });
  
  protected totalPages = computed(() => 
    Math.ceil(this.filteredTrades().length / this.pageSize())
  );
  
  protected allTradesForList = computed(() => this.paginatedTrades());
  
  protected selectedTradeSignal = signal<Trade | null>(null);
  protected selectedTrade = computed(() => this.selectedTradeSignal());

  constructor() {
    // Auto-select first trade when list changes
    effect(() => {
      const trades = this.allTradesForList();
      if (trades.length > 0 && !this.selectedTrade()) {
        this.selectedTradeSignal.set(trades[0]);
      }
    });
  }

  protected selectTrade(trade: Trade): void {
    this.selectedTradeSignal.set(trade);
  }

  protected isTradeSelected(trade: Trade): boolean {
    return this.selectedTrade()?.id === trade.id;
  }

  protected tradeMetrics = computed(() => {
    const trade = this.selectedTrade();
    if (!trade) return null;
    return this.tradingService.getTradeMetrics(trade.id);
  });

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

  // Filter methods
  protected onFilterStatusChange(status: 'ALL' | 'OPEN' | 'CLOSED'): void {
    this.filterStatus.set(status);
    this.currentPage.set(1); // Reset to first page
  }

  protected onFilterSideChange(side: 'ALL' | 'BUY' | 'SELL'): void {
    this.filterSide.set(side);
    this.currentPage.set(1);
  }

  protected onFilterModelChange(modelId: string): void {
    this.filterModel.set(modelId);
    this.currentPage.set(1);
  }

  protected onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(1);
  }

  protected onStartDateChange(dateStr: string): void {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    this.startDate.set(date);
    this.currentPage.set(1);
  }

  protected onEndDateChange(dateStr: string): void {
    const date = new Date(dateStr);
    date.setHours(23, 59, 59, 999);
    this.endDate.set(date);
    this.currentPage.set(1);
  }

  protected clearFilters(): void {
    this.filterStatus.set('ALL');
    this.filterSide.set('ALL');
    this.filterModel.set('ALL');
    this.searchTerm.set('');
    this.startDate.set(this.getDefaultStartDate());
    this.endDate.set(new Date());
    this.currentPage.set(1);
  }

  protected formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
}

