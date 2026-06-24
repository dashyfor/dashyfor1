import { AfterViewInit, Component } from '@angular/core';
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
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements AfterViewInit {

  // Data mahasiswa dari API
  totalLaki = 0;
  totalPerempuan = 0;
  totalSemua = 0;

  // Object chart
  private donutChart: any = null;
  private areaChart: any = null;

  constructor(private http: HttpClient) {}

  ngAfterViewInit(): void {
    $('body')
      .removeClass('sidebar-open')
      .addClass('sidebar-closed sidebar-collapsed');

    this.muatDataDanGrafik();
  }

  private muatDataDanGrafik(): void {

    this.http.get<any>(
      'https://stmikpontianak.cloud/011100862/laporan_bulanLahirMahasiswa.php'
    ).subscribe({
      next: (res) => {

        const lakiLakiData = res.datasets.find(
          (item: any) => item.label === 'Laki-laki'
        );

        const perempuanData = res.datasets.find(
          (item: any) => item.label === 'Perempuan'
        );

        this.totalLaki = lakiLakiData
          ? lakiLakiData.data.reduce(
              (total: number, nilai: number) => total + Number(nilai),
              0
            )
          : 0;

        this.totalPerempuan = perempuanData
          ? perempuanData.data.reduce(
              (total: number, nilai: number) => total + Number(nilai),
              0
            )
          : 0;

        this.totalSemua =
          this.totalLaki + this.totalPerempuan;

        console.log('Total Laki-laki:', this.totalLaki);
        console.log('Total Perempuan:', this.totalPerempuan);
        console.log('Total Mahasiswa:', this.totalSemua);

        this.buatGrafikArea(res);
        this.loadDonutChart();
      },

      error: (err) => {
        console.error('Gagal mengambil data API', err);
      }
    });
  }

  private buatGrafikArea(data: any): void {

    const canvas = document.getElementById(
      'revenue-chart-canvas'
    ) as HTMLCanvasElement;

    if (!canvas) return;

    if (this.areaChart) {
      this.areaChart.destroy();
    }

    const ctx = canvas.getContext('2d');

    this.areaChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: data.datasets.map((ds: any) => ({
          label: ds.label,
          data: ds.data,
          borderColor:
            ds.label === 'Laki-laki'
              ? '#007bff'
              : '#6c757d',
          backgroundColor:
            ds.label === 'Laki-laki'
              ? 'rgba(0,123,255,0.15)'
              : 'rgba(108,117,125,0.15)',
          fill: true,
          tension: 0.4
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

loadDonutChart(): void  {

    const canvas = document.getElementById(
      'sales-chart-canvas'
    ) as HTMLCanvasElement;

    if (!canvas) {
      console.warn('Canvas donut chart tidak ditemukan');
      return;
    }

    if (this.donutChart) {
      this.donutChart.destroy();
    }

    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const total = this.totalSemua;

    this.donutChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Laki-laki', 'Perempuan'],
        datasets: [
          {
            data: [
              this.totalLaki,
              this.totalPerempuan
            ],
            backgroundColor: [
              '#007bff',
              '#ff6b6b'
            ],
            borderColor: '#ffffff',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {

                const value = context.raw;
                const persen = total > 0
                  ? ((value / total) * 100).toFixed(1)
                  : '0';

                return `${context.label}: ${value} orang (${persen}%)`;
              }
            }
          }
        }
      }
    });
  }
}