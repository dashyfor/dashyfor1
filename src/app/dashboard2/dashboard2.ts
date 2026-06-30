import { Component, OnInit } from '@angular/core';

import { Sidebar } from '../sidebar/sidebar';
import { Footer } from '../footer/footer';
import { Header } from '../header/header';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard2',
  standalone: true,
  imports: [Sidebar, Footer, Header, RouterModule],
  templateUrl: './dashboard2.html',
  styleUrl: './dashboard2.css',
})

export class Dashboard2 implements OnInit {

  ngOnInit(): void {

    // REFRESH SEKALI SAJA
    if (!sessionStorage.getItem('dashboardRefreshed')) {

      sessionStorage.setItem('dashboardRefreshed', 'true');

      window.location.reload();

    }

  }

}