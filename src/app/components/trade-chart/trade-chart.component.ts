import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TradeChartData } from '../../models/trade.model';

@Component({
  selector: 'app-trade-chart',
  imports: [CommonModule],
  templateUrl: './trade-chart.component.html',
  styleUrl: './trade-chart.component.css'
})
export class TradeChartComponent {
  @Input() set chartData(data: TradeChartData | null) {
    this.chartDataSignal.set(data);
  }

  private chartDataSignal = signal<TradeChartData | null>(null);
  protected data = this.chartDataSignal.asReadonly();

  protected readonly viewBoxWidth = 1000;
  protected readonly viewBoxHeight = 300;
  protected readonly padding = { top: 20, right: 80, bottom: 40, left: 60 };
  
  protected get viewBox(): string {
    return `0 0 ${this.viewBoxWidth} ${this.viewBoxHeight}`;
  }

  protected chartWidth = computed(() => this.viewBoxWidth - this.padding.left - this.padding.right);
  protected chartHeight = computed(() => this.viewBoxHeight - this.padding.top - this.padding.bottom);

  protected pathData = computed(() => {
    const data = this.data();
    if (!data || data.timeSeries.length === 0) return '';

    const { min, max } = this.getMinMax();
    const points = data.timeSeries.map((point, index) => {
      const x = (index / (data.timeSeries.length - 1)) * this.chartWidth();
      const y = this.chartHeight() - ((point.value - min) / (max - min)) * this.chartHeight();
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  });

  protected signalLinesData = computed(() => {
    const data = this.data();
    if (!data) return [];

    const { min, max } = this.getMinMax();
    return data.signalLevels.map(level => {
      const y = this.chartHeight() - ((level.value - min) / (max - min)) * this.chartHeight();
      return {
        ...level,
        y,
        x1: 0,
        x2: this.chartWidth()
      };
    });
  });

  protected yAxisLabels = computed(() => {
    const { min, max } = this.getMinMax();
    const steps = 5;
    const labels: { value: number; y: number }[] = [];

    for (let i = 0; i <= steps; i++) {
      const value = min + (max - min) * (i / steps);
      const y = this.chartHeight() - (i / steps) * this.chartHeight();
      labels.push({ value, y });
    }

    return labels;
  });

  protected xAxisLabels = computed(() => {
    const data = this.data();
    if (!data || data.timeSeries.length === 0) return [];

    const points = 5;
    const step = Math.floor(data.timeSeries.length / points);
    const labels: { time: string; x: number }[] = [];

    for (let i = 0; i <= points; i++) {
      const index = Math.min(i * step, data.timeSeries.length - 1);
      const point = data.timeSeries[index];
      const x = (index / (data.timeSeries.length - 1)) * this.chartWidth();
      labels.push({
        time: this.formatTime(point.timestamp),
        x
      });
    }

    return labels;
  });

  private getMinMax(): { min: number; max: number } {
    const data = this.data();
    if (!data || data.timeSeries.length === 0) {
      return { min: 0, max: 100 };
    }

    const values = [
      ...data.timeSeries.map(p => p.value),
      ...data.signalLevels.map(l => l.value)
    ];

    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1;

    return {
      min: min - padding,
      max: max + padding
    };
  }

  protected formatValue(value: number): string {
    return value.toFixed(2);
  }

  protected formatTime(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  protected getSignalColor(type: string): string {
    switch (type) {
      case 'entry': return '#a8c4a1'; // color-2
      case 'exit': return '#f6a055'; // color-4
      case 'stopLoss': return '#c16149'; // color-5
      case 'takeProfit': return '#49694c'; // color-1
      default: return '#e9d5a0'; // color-3
    }
  }
}

