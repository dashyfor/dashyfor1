import { AfterViewInit, Component, Renderer2 } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { Footer } from '../footer/footer';

declare const $: any;
declare const moment: any;
declare const L: any;

@Component({
  selector: 'app-cuaca',
  standalone: true,
  imports: [CommonModule, DecimalPipe, Header, Sidebar, Footer, RouterModule],
  templateUrl: './cuaca.html',
  styleUrls: ['./cuaca.css'],
})
export class Cuaca implements AfterViewInit {
  private table1: any;
  private map: any;

  currentWeather: any = null;
  todayDate: string = '';
  cityData: any = null;

  constructor(
    private renderer: Renderer2,
    private http: HttpClient,
  ) {
    this.renderer.removeClass(document.body, 'sidebar-open');
    this.renderer.addClass(document.body, 'sidebar-closed');
  }

  ngAfterViewInit(): void {
    this.table1 = $('#table1').DataTable({
      columnDefs: [
        {
          targets: 0,
          render: function (data: string) {
            const waktu = moment(data + ' UTC');

            return (
              waktu.local().format('YYYY-MM-DD') + '<br />' + waktu.local().format('HH:mm') + ' WIB'
            );
          },
        },
        {
          targets: 1,
          render: function (data: string) {
            return `
              <img
                src="${data}"
                style="filter: drop-shadow(5px 5px 10px rgba(0,0,0,.7));"
              />
            `;
          },
        },
        {
          targets: 2,
          render: function (data: string) {
            const array = data.split('|');

            const cuaca = array[0];
            const description = array[1];

            return `
              <strong>${cuaca}</strong>
              <br>
              ${description}
            `;
          },
        },
        {
          targets: 3,
          render: function (data: string) {
            return `<strong>${data}</strong>`;
          },
        },
      ],
    });

    // Data awal
    this.getData('Pontianak');
  }

  kelvinToCelsius(kelvin: number): number {
    let celsius = kelvin - 273.15;
    celsius = Math.round(celsius * 100) / 100;
    return celsius;
  }

  getWeatherIconUrl(icon: string): string {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
  }

  getData(city: string): void {
    if (!city || city.trim() === '') {
      return;
    }

    city = encodeURIComponent(city);

    this.http
      .get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=6766b5e592dc1db0815f63bc0f9c5831`,
      )
      .subscribe({
        next: (data: any) => {
          try {
            const list = data.list;

            if (!list || list.length === 0) {
              alert('Data cuaca tidak ditemukan untuk kota tersebut');
              this.currentWeather = null;
              this.cityData = null;
              if (this.table1) {
                this.table1.clear();
                this.table1.draw(false);
              }
              return;
            }

            this.cityData = data.city;
            this.table1.clear();

            // Cuaca saat ini
            this.currentWeather = list[0];
            this.todayDate = moment(this.currentWeather.dt_txt + ' UTC')
              .local()
              .format('MMM DD, hh:mma');

            // Peta kota
            if (this.cityData?.coord) {
              setTimeout(() => {
                this.initMap(this.cityData.coord.lat, this.cityData.coord.lon);
              }, 100);
            }

            // Tambah data ke tabel
            list.forEach((element: any) => {
              const weather = element.weather[0];
              const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;
              const cuacaDeskripsi = weather.main + '|' + weather.description;
              const main = element.main;
              const tempMin = this.kelvinToCelsius(main.temp_min);
              const tempMax = this.kelvinToCelsius(main.temp_max);
              const temp = `${tempMin.toFixed(1)}°C - ${tempMax.toFixed(1)}°C`;

              const row = [element.dt_txt, iconUrl, cuacaDeskripsi, temp];

              this.table1.row.add(row);
            });

            this.table1.draw(false);
          } catch (error) {
            console.error('Error processing weather data:', error);
            alert('Terjadi kesalahan saat memproses data cuaca');
          }
        },

        error: (error: any) => {
          const errorMessage =
            error?.error?.message ||
            error?.message ||
            'Kota tidak ditemukan atau terjadi kesalahan';
          alert('Error: ' + errorMessage);

          this.currentWeather = null;
          this.cityData = null;
          if (this.table1) {
            this.table1.clear();
            this.table1.draw(false);
          }
        },
      });
  }

  private initMap(lat: number, lon: number): void {
    try {
      if (!document.getElementById('map-container')) {
        return;
      }

      if (this.map) {
        this.map.remove();
      }

      this.map = L.map('map-container').setView([lat, lon], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(this.map);

      L.marker([lat, lon])
        .addTo(this.map)
        .bindPopup(`<strong>${this.cityData?.name || 'Lokasi'}</strong>`)
        .openPopup();

      // Responsif untuk ukuran layar
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 300);
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  handleEnter(event: any): void {
    const cityName = event.target.value?.trim();

    if (!cityName) {
      this.currentWeather = null;
      this.cityData = null;
      if (this.table1) {
        this.table1.clear();
        this.table1.draw(false);
      }
      return;
    }

    this.getData(cityName);
  }
}
