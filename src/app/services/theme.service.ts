import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_STORAGE_KEY = 'app-theme';
  private themeSignal = signal<Theme>(this.getInitialTheme());

  readonly theme = this.themeSignal.asReadonly();

  constructor() {
    // Apply theme whenever it changes
    effect(() => {
      const currentTheme = this.themeSignal();
      this.applyTheme(currentTheme);
    });
  }

  private getInitialTheme(): Theme {
    const storedTheme = localStorage.getItem(this.THEME_STORAGE_KEY);
    return (storedTheme === 'light' || storedTheme === 'dark') ? storedTheme : 'dark';
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.THEME_STORAGE_KEY, theme);
  }

  toggleTheme(): void {
    const newTheme: Theme = this.themeSignal() === 'dark' ? 'light' : 'dark';
    this.themeSignal.set(newTheme);
  }

  setTheme(theme: Theme): void {
    this.themeSignal.set(theme);
  }
}

