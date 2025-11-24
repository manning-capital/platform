import { Component, Input, OnChanges, SimpleChanges, ViewChild, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, Chart, registerables } from 'chart.js';
import { TradeChartData } from '../../models/trade.model';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-trade-chart',
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './trade-chart.component.html',
  styleUrl: './trade-chart.component.css'
})
export class TradeChartComponent implements OnChanges, OnInit {
  @Input() set chartData(data: TradeChartData | null) {
    this.chartDataSignal.set(data);
    if (data) {
      this.updateChart(data);
    }
  }

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  private chartDataSignal = signal<TradeChartData | null>(null);
  protected data = this.chartDataSignal.asReadonly();

  public chartType: 'line' = 'line';
  public chartJsData: ChartData<'line'> = {
    datasets: []
  };
  public get chartOptions(): ChartConfiguration<'line'>['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      transitions: {
        active: {
          animation: {
            duration: 0
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 15,
            font: {
              size: 12
            },
            filter: (item) => {
              // Only show legend for signal levels, not the main data line
              const data = this.data();
              if (!data) return false;
              return item.text !== data.metricName;
            }
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            title: (items) => {
              const data = this.data();
              if (!data || !data.timeSeries.length) return '';
              const index = items[0].dataIndex;
              if (index >= 0 && index < data.timeSeries.length) {
                return this.formatTime(data.timeSeries[index].timestamp);
              }
              return '';
            },
            label: (context) => {
              const yValue = context.parsed.y;
              if (yValue === null || yValue === undefined) return '';
              return `${context.dataset.label}: ${this.formatValue(yValue)}`;
            }
          }
        }
      },
      scales: {
        x: {
          type: 'linear',
          display: true,
          title: {
            display: false
          },
          ticks: {
            stepSize: 1,
            callback: (value) => {
              const data = this.data();
              if (!data || !data.timeSeries.length) return '';
              const index = value as number;
              if (index >= 0 && index < data.timeSeries.length) {
                return this.formatTime(data.timeSeries[index].timestamp);
              }
              return '';
            },
            maxTicksLimit: 6
          },
          grid: {
            display: true,
            color: 'rgba(128, 128, 128, 0.2)'
          }
        },
        y: {
          display: true,
          title: {
            display: false
          },
          grid: {
            display: true,
            color: 'rgba(128, 128, 128, 0.2)'
          },
          ticks: {
            callback: (value) => {
              return this.formatValue(value as number);
            }
          }
        }
      },
      interaction: {
        mode: 'index',
        intersect: false
      }
    };
  }

  ngOnInit(): void {
    // Component initialization
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chartData'] && this.chartDataSignal()) {
      this.updateChart(this.chartDataSignal()!);
    }
  }

  private updateChart(data: TradeChartData): void {
    if (!data || !data.timeSeries.length) {
      this.chartJsData = { datasets: [] };
      return;
    }

    // Prepare main data line - use index as x value
    const dataPoints = data.timeSeries.map((point, index) => ({ x: index, y: point.value }));

    // Create datasets array
    const datasets: any[] = [
      {
        label: data.metricName,
        data: dataPoints,
        borderColor: 'var(--chart-primary, #43aa8b)',
        backgroundColor: 'transparent',
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBorderWidth: 2,
        pointHoverBackgroundColor: 'var(--chart-primary, #43aa8b)',
        pointHoverBorderColor: '#fff',
        tension: 0.4,
        fill: false,
        order: 1
      }
    ];

    // Add signal levels as horizontal lines
    data.signalLevels.forEach(level => {
      const color = this.getSignalColor(level.type);
      datasets.push({
        label: `${level.label}: ${this.formatValue(level.value)}`,
        data: [
          { x: 0, y: level.value },
          { x: data.timeSeries.length - 1, y: level.value }
        ],
        borderColor: color,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0,
        fill: false,
        order: 0
      });
    });

    this.chartJsData = {
      labels: data.timeSeries.map((_, index) => index),
      datasets: datasets
    };

    // Update chart if it exists (without animation)
    if (this.chart) {
      this.chart.update('none');
    }
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

  private getSignalColor(type: string): string {
    switch (type) {
      case 'entry': return '#43aa8b'; // seagrass - teal for entry
      case 'exit': return '#f8961e'; // carrot-orange - orange for exit
      case 'stopLoss': return '#f94144'; // strawberry-red - red for stop loss
      case 'takeProfit': return '#748da3'; // air-force-blue - blue for take profit
      default: return '#f9c74f'; // tuscan-sun - yellow for other levels
    }
  }
}
