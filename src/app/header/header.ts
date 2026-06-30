import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header implements OnInit {
  isDarkMode: boolean = false;

  ngOnInit(): void {
    this.loadTheme();
  }

  // Satu tombol toggle
  toggleTheme(): void {
    if (this.isDarkMode) {
      this.setLightMode();
    } else {
      this.setDarkMode();
    }
  }

  private setDarkMode(): void {
    // Body
    document.body.classList.add('dark-mode');
    document.body.classList.remove('light-mode');

    // Header navbar: ubah class menjadi gelap
    const navbar = document.querySelector('.main-header.navbar');
    if (navbar) {
      navbar.classList.remove('navbar-white', 'navbar-light');
      navbar.classList.add('navbar-dark');
    }

    localStorage.setItem('theme', 'dark');
    this.isDarkMode = true;
  }

  private setLightMode(): void {
    // Body
    document.body.classList.add('light-mode');
    document.body.classList.remove('dark-mode');

    // Header navbar: ubah class menjadi terang
    const navbar = document.querySelector('.main-header.navbar');
    if (navbar) {
      navbar.classList.remove('navbar-dark');
      navbar.classList.add('navbar-white', 'navbar-light');
    }

    localStorage.setItem('theme', 'light');
    this.isDarkMode = false;
  }

  private loadTheme(): void {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      this.setDarkMode();
    } else {
      this.setLightMode();
    }
  }
}