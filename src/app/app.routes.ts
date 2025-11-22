import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ModelPerformanceComponent } from './components/model-performance/model-performance.component';
import { LiveTradesComponent } from './components/live-trades/live-trades.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'models', component: ModelPerformanceComponent },
  { path: 'live-trades', component: LiveTradesComponent },
];
