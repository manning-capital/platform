import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ModelPerformanceComponent } from './components/model-performance/model-performance.component';
import { LiveTradesComponent } from './components/live-trades/live-trades.component';
import { AboutComponent } from './components/about/about.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'models', component: ModelPerformanceComponent },
  { path: 'models/:id', component: ModelPerformanceComponent },
  { path: 'trades', component: LiveTradesComponent },
  { path: 'about', component: AboutComponent },
];
