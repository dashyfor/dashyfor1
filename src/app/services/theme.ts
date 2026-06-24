import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'  // otomatis terdaftar di root module
})
export class ThemeService {
  private renderer: Renderer2;
  private isDark = new BehaviorSubject<boolean>(false);
  isDarkMode$ = this.isDark.asObservable();

  constructor(rendererFactory: RendererFactory2) {
    // Renderer untuk manipulasi DOM yang aman
    this.renderer = rendererFactory.createRenderer(null, null);
    this.loadTheme();
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    this.setTheme(shouldBeDark);
  }

  toggleTheme(): void {
    this.setTheme(!this.isDark.value);
  }

  private setTheme(dark: boolean): void {
    this.isDark.next(dark);
    if (dark) {
      this.renderer.addClass(document.body, 'dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      this.renderer.removeClass(document.body, 'dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }
}