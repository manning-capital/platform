import { Component, computed, inject, signal, effect, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, Params, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { TradingService } from '../../services/trading.service';
import { Trade } from '../../models/trade.model';
import { TradeMetricsComponent } from '../trade-metrics/trade-metrics.component';

@Component({
  selector: 'app-live-trades',
  imports: [CommonModule, FormsModule, TradeMetricsComponent],
  templateUrl: './live-trades.component.html',
  styleUrl: './live-trades.component.css'
})
export class LiveTradesComponent implements OnInit, OnDestroy {
  private tradingService = inject(TradingService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  protected allTrades = this.tradingService.trades$;
  protected models = this.tradingService.models$;
  
  private isInitializing = signal<boolean>(true);
  private destroy$ = new Subject<void>();
  
  // Filter state
  protected filterStatus = signal<'ALL' | 'OPEN' | 'CLOSED'>('ALL');
  protected filterSide = signal<'ALL' | 'BUY' | 'SELL' | 'COMPOUND'>('ALL');
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
  
  // Helper methods for compound trades
  protected isCompoundTrade(trade: Trade): boolean {
    return this.tradingService.isCompoundTrade(trade);
  }

  protected getTradeDisplaySymbol(trade: Trade): string {
    return this.tradingService.getTradeDisplaySymbol(trade);
  }

  protected getPrimaryPosition(trade: Trade) {
    return this.tradingService.getPrimaryPosition(trade);
  }

  protected getTotalPositionValue(trade: Trade): number {
    return trade.positions.reduce((sum, p) => sum + (p.currentPrice * p.quantity), 0);
  }

  protected getTotalCostBasis(trade: Trade): number {
    return trade.positions.reduce((sum, p) => sum + (p.entryPrice * p.quantity), 0);
  }

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
    
    // Filter by side (check primary position or any position, or compound)
    if (this.filterSide() !== 'ALL') {
      if (this.filterSide() === 'COMPOUND') {
        trades = trades.filter(t => this.isCompoundTrade(t));
      } else {
        trades = trades.filter(t => {
          const primary = this.getPrimaryPosition(t);
          return primary.side === this.filterSide() || 
                 t.positions.some(p => p.side === this.filterSide());
        });
      }
    }
    
    // Filter by model
    if (this.filterModel() !== 'ALL') {
      trades = trades.filter(t => t.modelId === this.filterModel());
    }
    
    // Filter by search term (search across all positions' assets)
    if (this.searchTerm().trim()) {
      const term = this.searchTerm().toLowerCase();
      trades = trades.filter(t => {
        // Check legacy symbol field
        if (t.symbol && t.symbol.toLowerCase().includes(term)) return true;
        // Check all positions
        return t.positions.some(p => 
          p.fromAsset.toLowerCase().includes(term) || 
          p.toAsset.toLowerCase().includes(term) ||
          `${p.fromAsset}/${p.toAsset}`.toLowerCase().includes(term)
        );
      });
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

  private isSyncingFromUrl = false;

  constructor() {
    // Watch filter signals and sync to URL (but not during initialization or when syncing from URL)
    effect(() => {
      if (this.isInitializing() || this.isSyncingFromUrl) return;
      
      const status = this.filterStatus();
      const side = this.filterSide();
      const model = this.filterModel();
      const search = this.searchTerm();
      const startDate = this.startDate();
      const endDate = this.endDate();
      const page = this.currentPage();
      const pageSize = this.pageSize();
      
      this.syncFiltersToUrl({
        status,
        side,
        model,
        search,
        startDate,
        endDate,
        page,
        pageSize
      });
    });
  }

  ngOnInit(): void {
    // Read initial query params from snapshot (for when navigating from another route)
    const initialParams = this.route.snapshot.queryParams;
    
    // Always sync from URL on init (even if empty, to set defaults)
    this.isSyncingFromUrl = true;
    this.syncUrlToFilters(initialParams);
    this.isSyncingFromUrl = false;
    
    // Subscribe to query param changes (for browser back/forward and navigation)
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        // Only sync if params actually changed (avoid loops)
        const currentParams = this.route.snapshot.queryParams;
        if (JSON.stringify(currentParams) !== JSON.stringify(params)) {
          this.isSyncingFromUrl = true;
          this.syncUrlToFilters(params);
          this.isSyncingFromUrl = false;
        }
      });
    
    // Also listen to navigation events to catch when navigating to this route
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        const params = this.route.snapshot.queryParams;
        this.isSyncingFromUrl = true;
        this.syncUrlToFilters(params);
        this.isSyncingFromUrl = false;
      });
    
    // After initial sync, allow URL updates
    setTimeout(() => {
      this.isInitializing.set(false);
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected selectTrade(trade: Trade): void {
    this.selectedTradeSignal.set(trade);
  }

  protected goBackToList(): void {
    this.selectedTradeSignal.set(null);
  }

  protected isTradeSelected(trade: Trade): boolean {
    return this.selectedTrade()?.id === trade.id;
  }

  protected tradeMetrics = computed(() => {
    const trade = this.selectedTrade();
    if (!trade) return null;
    return this.tradingService.getTradeMetrics(trade.id);
  });

  protected modelParameters = computed(() => {
    const trade = this.selectedTrade();
    if (!trade) return null;
    return this.tradingService.getModelParameters(trade.id);
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
    // URL will be updated by effect
  }

  protected onFilterSideChange(side: 'ALL' | 'BUY' | 'SELL' | 'COMPOUND'): void {
    this.filterSide.set(side);
    this.currentPage.set(1);
    // URL will be updated by effect
  }

  protected onFilterModelChange(modelId: string): void {
    this.filterModel.set(modelId);
    this.currentPage.set(1);
    // URL will be updated by effect
  }

  protected onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(1);
    // URL will be updated by effect
  }

  protected onStartDateChange(dateStr: string): void {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    this.startDate.set(date);
    this.currentPage.set(1);
    // URL will be updated by effect
  }

  protected onEndDateChange(dateStr: string): void {
    const date = new Date(dateStr);
    date.setHours(23, 59, 59, 999);
    this.endDate.set(date);
    this.currentPage.set(1);
    // URL will be updated by effect
  }

  protected clearFilters(): void {
    this.filterStatus.set('ALL');
    this.filterSide.set('ALL');
    this.filterModel.set('ALL');
    this.searchTerm.set('');
    this.startDate.set(this.getDefaultStartDate());
    this.endDate.set(new Date());
    this.currentPage.set(1);
    // URL will be updated by effect
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
      // URL will be updated by effect
    }
  }

  protected previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      // URL will be updated by effect
    }
  }

  protected goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      // URL will be updated by effect
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

  // URL State Management Methods
  private syncFiltersToUrl(params: {
    status?: string;
    side?: string;
    model?: string;
    search?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    pageSize?: number;
    trade?: string;
  }): void {
    const queryParams: Params = {};
    
    // Only add non-default values to URL
    if (params.status && params.status !== 'ALL') {
      queryParams['status'] = params.status;
    }
    if (params.side && params.side !== 'ALL') {
      queryParams['side'] = params.side;
    }
    if (params.model && params.model !== 'ALL') {
      queryParams['model'] = params.model;
    }
    if (params.search && params.search.trim()) {
      queryParams['search'] = params.search;
    }
    if (params.startDate) {
      const defaultStart = this.getDefaultStartDate();
      if (params.startDate.getTime() !== defaultStart.getTime()) {
        queryParams['startDate'] = params.startDate.toISOString().split('T')[0];
      }
    }
    if (params.endDate) {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (params.endDate.getTime() !== today.getTime()) {
        queryParams['endDate'] = params.endDate.toISOString().split('T')[0];
      }
    }
    if (params.page && params.page !== 1) {
      queryParams['page'] = params.page.toString();
    }
    if (params.pageSize && params.pageSize !== 10) {
      queryParams['pageSize'] = params.pageSize.toString();
    }
    
    // Get current URL params to compare
    const currentParams = this.route.snapshot.queryParams;
    
    // Normalize both objects for comparison (remove undefined values)
    const normalizeParams = (p: Params): Params => {
      const normalized: Params = {};
      Object.keys(p).forEach(key => {
        if (p[key] !== undefined && p[key] !== null && p[key] !== '') {
          normalized[key] = p[key];
        }
      });
      return normalized;
    };
    
    const currentNormalized = normalizeParams(currentParams);
    const newNormalized = normalizeParams(queryParams);
    
    // Only update URL if params actually changed
    if (JSON.stringify(currentNormalized) !== JSON.stringify(newNormalized)) {
      // Update URL without triggering navigation
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: newNormalized,
        queryParamsHandling: 'replace',
        replaceUrl: true
      });
    }
  }

  private syncUrlToFilters(params: Params): void {
    // Set filter signals from URL params (use defaults if not in URL)
    this.filterStatus.set((params['status'] as 'ALL' | 'OPEN' | 'CLOSED') || 'ALL');
    this.filterSide.set((params['side'] as 'ALL' | 'BUY' | 'SELL' | 'COMPOUND') || 'ALL');
    this.filterModel.set(params['model'] || 'ALL');
    this.searchTerm.set(params['search'] || '');
    
    if (params['startDate']) {
      const date = new Date(params['startDate']);
      date.setHours(0, 0, 0, 0);
      this.startDate.set(date);
    } else {
      this.startDate.set(this.getDefaultStartDate());
    }
    
    if (params['endDate']) {
      const date = new Date(params['endDate']);
      date.setHours(23, 59, 59, 999);
      this.endDate.set(date);
    } else {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      this.endDate.set(today);
    }
    
    if (params['page']) {
      const page = parseInt(params['page'], 10);
      if (!isNaN(page) && page > 0) {
        this.currentPage.set(page);
      } else {
        this.currentPage.set(1);
      }
    } else {
      this.currentPage.set(1);
    }
    
    if (params['pageSize']) {
      const pageSize = parseInt(params['pageSize'], 10);
      if (!isNaN(pageSize) && pageSize > 0) {
        this.pageSize.set(pageSize);
      } else {
        this.pageSize.set(10);
      }
    } else {
      this.pageSize.set(10);
    }
    
    // Auto-select first trade in filtered list if none selected
    setTimeout(() => {
      if (!this.selectedTrade()) {
        const filteredTrades = this.filteredTrades();
        if (filteredTrades.length > 0) {
          this.selectedTradeSignal.set(filteredTrades[0]);
        }
      }
    }, 0);
  }


  private buildQueryParams(): Params {
    return {
      status: this.filterStatus() !== 'ALL' ? this.filterStatus() : undefined,
      side: this.filterSide() !== 'ALL' ? this.filterSide() : undefined,
      model: this.filterModel() !== 'ALL' ? this.filterModel() : undefined,
      search: this.searchTerm().trim() || undefined,
      startDate: (() => {
        const defaultStart = this.getDefaultStartDate();
        const currentStart = this.startDate();
        defaultStart.setHours(0, 0, 0, 0);
        currentStart.setHours(0, 0, 0, 0);
        return currentStart.getTime() !== defaultStart.getTime()
          ? currentStart.toISOString().split('T')[0]
          : undefined;
      })(),
      endDate: (() => {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const currentEnd = new Date(this.endDate());
        currentEnd.setHours(23, 59, 59, 999);
        return currentEnd.getTime() !== today.getTime()
          ? currentEnd.toISOString().split('T')[0]
          : undefined;
      })(),
      page: this.currentPage() !== 1 ? this.currentPage().toString() : undefined,
      pageSize: this.pageSize() !== 10 ? this.pageSize().toString() : undefined
    };
  }

  private parseQueryParams(params: Params): {
    status: 'ALL' | 'OPEN' | 'CLOSED';
    side: 'ALL' | 'BUY' | 'SELL' | 'COMPOUND';
    model: string;
    search: string;
    startDate: Date;
    endDate: Date;
    page: number;
    pageSize: number;
  } {
    return {
      status: (params['status'] as 'ALL' | 'OPEN' | 'CLOSED') || 'ALL',
      side: (params['side'] as 'ALL' | 'BUY' | 'SELL' | 'COMPOUND') || 'ALL',
      model: params['model'] || 'ALL',
      search: params['search'] || '',
      startDate: params['startDate'] ? new Date(params['startDate']) : this.getDefaultStartDate(),
      endDate: params['endDate'] ? new Date(params['endDate']) : new Date(),
      page: params['page'] ? parseInt(params['page'], 10) : 1,
      pageSize: params['pageSize'] ? parseInt(params['pageSize'], 10) : 10
    };
  }
}

