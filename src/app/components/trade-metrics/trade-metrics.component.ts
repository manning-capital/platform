import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TradeMetrics } from '../../models/trade.model';
import { TradeChartComponent } from '../trade-chart/trade-chart.component';

@Component({
  selector: 'app-trade-metrics',
  imports: [CommonModule, TradeChartComponent],
  templateUrl: './trade-metrics.component.html',
  styleUrl: './trade-metrics.component.css'
})
export class TradeMetricsComponent {
  @Input() set metrics(data: TradeMetrics | null) {
    this.metricsSignal.set(data);
    // Reset to first tab when metrics change
    if (data && data.availableMetrics.length > 0) {
      this.selectedMetricId.set(data.availableMetrics[0].id);
    }
  }

  private metricsSignal = signal<TradeMetrics | null>(null);
  protected data = this.metricsSignal.asReadonly();

  protected selectedMetricId = signal<string>('price');
  
  protected selectedMetric = computed(() => {
    const metrics = this.data();
    if (!metrics) return null;
    return metrics.availableMetrics.find(m => m.id === this.selectedMetricId());
  });

  protected selectMetric(metricId: string): void {
    this.selectedMetricId.set(metricId);
  }

  protected getConditionIcon(type: string): string {
    switch (type) {
      case 'entry': return 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';
      case 'exit': return 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z';
      case 'stopLoss': return 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z';
      default: return 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z';
    }
  }
}

