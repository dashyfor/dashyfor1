import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { Footer } from '../footer/footer';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

declare const $: any;
declare const Chart: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [Header, Sidebar, Footer, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard implements OnInit, AfterViewInit {

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // menghapus Style login di body untuk halaman admin
    document.body.classList.remove('login-page');
  }

  ngAfterViewInit(): void {

    $('body').removeClass('sidebar-open');
    $('body').addClass('sidebar-closed');
    $('body').addClass('sidebar-collapsed');

    // ===========================
    // Line Chart
    // ===========================
    this.http.get<any>('https://stmikpontianak.cloud/011100862/laporan_bulanLahirMahasiswa.php')
      .subscribe(response => {

        const salesChartCanvas = $('#revenue-chart-canvas')[0];

        if (!salesChartCanvas) {
          console.error('Canvas revenue-chart-canvas tidak ditemukan');
          return;
        }

        const ctx = salesChartCanvas.getContext('2d');

        const salesChartData = {
          labels: response.labels,
          datasets: response.datasets.map((dataset: any) => {

            const isMale = dataset.label === 'Laki-laki';

            return {
              ...dataset,
              borderColor: isMale
                ? 'rgba(60,141,188,0.8)'
                : 'rgba(210,214,222,1)',
              pointRadius: false,
              pointColor: isMale
                ? '#3b8bba'
                : 'rgba(210,214,222,1)',
              pointStrokeColor: isMale
                ? 'rgba(60,141,188,1)'
                : '#c1c7d1',
              pointHighlightFill: '#fff',
              pointHighlightStroke: isMale
                ? 'rgba(60,141,188,1)'
                : 'rgba(220,220,220,1)',
            };

          })
        };

        const salesChartOptions = {
          maintainAspectRatio: false,
          responsive: true,
          legend: {
            display: false
          },
          scales: {
            xAxes: [{
              gridLines: {
                display: false
              }
            }],
            yAxes: [{
              gridLines: {
                display: false
              }
            }]
          }
        };

        new Chart(ctx, {
          type: 'line',
          data: salesChartData,
          options: salesChartOptions
        });

      });

    // ===========================
    // Donut Chart
    // ===========================
    this.http.get<any>('https://stmikpontianak.cloud/011100862/laporan_rekapJurusanProdi.php')
      .subscribe(response => {

        const donutCanvas = $('#sales-chart-canvas')[0];

        if (!donutCanvas) {
          console.error('Canvas sales-chart-canvas tidak ditemukan');
          return;
        }

        const donutCtx = donutCanvas.getContext('2d');

        const donutData = {
          labels: response.labels,
          datasets: response.datasets
        };

        const donutOptions = {
          maintainAspectRatio: false,
          responsive: true,
          legend: {
            display: true,
            position: 'right'
          }
        };

        new Chart(donutCtx, {
          type: 'doughnut',
          data: donutData,
          options: donutOptions
        });

      });

  }

}