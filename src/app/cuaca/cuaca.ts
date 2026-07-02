import { AfterViewInit, Component, Renderer2, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { Footer } from '../footer/footer';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

declare const $: any;
declare const moment: any;
declare const L: any;

@Component({
  selector: "app-cuaca",
  standalone: true,
  imports: [CommonModule, Header, Sidebar, Footer, RouterModule],
  templateUrl: './cuaca.html',
  styleUrl: './cuaca.css',
})
export class Cuaca implements AfterViewInit {
  private table1: any;
  private map: any;

  public cityData: any;
  public currentWeather: any;
  public forecastList: any[] = [];
  public todayDate: any;

  constructor(
    private renderer: Renderer2,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    this.renderer.removeClass(document.body, "sidebar-open");
    this.renderer.addClass(document.body, "sidebar-closed");
  }

  ngAfterViewInit(): void {
    // DataTable initialization
    this.table1 = $("#table1").DataTable({
      columnDefs: [
        {
          targets: 0,
          render: function (data: string) {
            const waktu = moment(data + " UTC");
            return waktu.local().format("YYYY-MM-DD") + "<br />" + waktu.local().format("HH:mm") + " Local";
          },
        },
        {
          targets: 1,
          render: function (data: string) {
            return "<img src='" + data + "' style='filter: drop-shadow(5px 5px 10px rgba(0, 0, 0, 0.7));' />";
          },
        },
        {
          targets: 2,
          render: function (data: string) {
            const array = data.split("||");
            const cuaca = array[0];
            const description = array[1];
            return "<strong>" + cuaca + "</strong> <br />" + description;
          },
        },
      ],
    });
    
    this.getData('Pontianak');
  }

  handleEnter(event: any) {
    const cityName = event.target.value;
    if (cityName == "") {
      this.table1.clear();
      this.table1.draw(false);
      // Clear data juga
      this.cityData = null;
      this.currentWeather = null;
      this.forecastList = [];
      this.cdr.detectChanges();
    }
    this.getData(cityName);
  }

  getData(city: string): void {
    city = encodeURIComponent(city);
    this.http
      .get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=9253cf14f9239acd1037a885af0b0cc1`)
      .subscribe((data: any) => {
        this.cityData = data.city;
        this.forecastList = data.list;

        if (data.list.length > 0) {
          this.currentWeather = data.list[0];
          this.todayDate = moment(this.currentWeather.dt_txt + ' UTC').local().format('DD MMMM YYYY, HH:mm');

          setTimeout(() => {
            if (this.cityData && this.cityData.coord) {
              this.initMap(this.cityData.coord.lat, this.cityData.coord.lon);
            }
          }, 100);
        }

        // Update DataTable
        let list = data.list;
        this.table1.clear();

        list.forEach((element: any) => {
          const weather = element.weather[0];
          const iconUrl = "https://openweathermap.org/img/wn/" + weather.icon + "@2x.png";
          const cuacaDeskripsi = weather.main + "||" + weather.description;

          const main = element.main;
          const tempMin = this.kelvinToCelcius(main.temp_min);
          const tempMax = this.kelvinToCelcius(main.temp_max);
          const temp = tempMin + "°C - " + tempMax + "°C";

          const row = [element.dt_txt, iconUrl, cuacaDeskripsi, temp];
          this.table1.row.add(row);
        });

        this.table1.draw(false);
        this.cdr.detectChanges();

      }, (error: any) => {
        alert(error.error.message || "Terjadi kesalahan");
        this.table1.clear();
        this.table1.draw(false);
        this.cityData = null;
        this.currentWeather = null;
        this.forecastList = [];
        this.cdr.detectChanges();
      });
  }

  private initMap(lat: number, lon: number): void {
    if (this.map) {
      this.map.remove();
    }
    
    // Cek apakah container map sudah ada
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) {
      console.error('Map container not found');
      return;
    }

    this.map = L.map('map-container').setView([lat, lon], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);
    
    L.marker([lat, lon])
      .addTo(this.map)
      .bindPopup(`<strong>${this.cityData.name}</strong><br>${this.cityData.country}`)
      .openPopup();

    // Refresh map after a short delay
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 200);
  }

  kelvinToCelcius(kelvin: any): number {
    let celcius = kelvin - 273.15;
    return Math.round(celcius * 100) / 100;
  }

  getWeatherIconUrl(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }

  getWindDirection(deg: number): string {
    const directions = ['U', 'TL', 'T', 'TG', 'S', 'BD', 'B', 'BL'];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
  }

  // Method untuk mendapatkan data forecast per jam (8 data pertama / 24 jam)
  getHourlyForecast(): any[] {
    if (!this.forecastList || this.forecastList.length === 0) return [];

    // Ambil 8 data pertama (setiap 3 jam = 24 jam)
    return this.forecastList.slice(0, 8).map((item: any) => {
      const date = new Date(item.dt * 1000);
      const temp = Math.round(this.kelvinToCelcius(item.main.temp));
      const chance = Math.round(item.pop * 100);
      
      return {
        time: date.getHours().toString().padStart(2, '0') + ':00',
        temp: temp,
        icon: this.getWeatherEmoji(item.weather[0].icon),
        chance: chance
      };
    });
  }

  // Method untuk mendapatkan forecast harian (5 hari)
  getDailyForecast(): any[] {
    if (!this.forecastList || this.forecastList.length === 0) return [];

    const days = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];
    const result = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Ambil data untuk 5 hari ke depan
    for (let i = 0; i < 5; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + i);
      
      // Filter forecast untuk tanggal target (cari data sekitar jam 12:00)
      const dayData = this.forecastList.filter((item: any) => {
        const itemDate = new Date(item.dt * 1000);
        return itemDate.getDate() === targetDate.getDate() && 
               itemDate.getMonth() === targetDate.getMonth() &&
               itemDate.getFullYear() === targetDate.getFullYear() &&
               itemDate.getHours() >= 9 && itemDate.getHours() <= 15;
      });

      // Jika tidak ada data di jam 12, ambil data pertama di hari itu
      const selectedData = dayData.length > 0 ? dayData[0] : 
        this.forecastList.find((item: any) => {
          const itemDate = new Date(item.dt * 1000);
          return itemDate.getDate() === targetDate.getDate() && 
                 itemDate.getMonth() === targetDate.getMonth() &&
                 itemDate.getFullYear() === targetDate.getFullYear();
        });

      if (selectedData) {
        const dayName = days[targetDate.getDay()];
        const dayLabel = i === 0 ? 'HARI INI' : dayName;
        
        // Cari suhu max dan min untuk hari itu
        const temps = this.forecastList.filter((item: any) => {
          const itemDate = new Date(item.dt * 1000);
          return itemDate.getDate() === targetDate.getDate() && 
                 itemDate.getMonth() === targetDate.getMonth() &&
                 itemDate.getFullYear() === targetDate.getFullYear();
        });

        let maxTemp = -Infinity;
        let minTemp = Infinity;
        temps.forEach((item: any) => {
          const temp = this.kelvinToCelcius(item.main.temp);
          if (temp > maxTemp) maxTemp = temp;
          if (temp < minTemp) minTemp = temp;
        });

        const weatherDesc = selectedData.weather[0].description;
        let status = 'Cerah berawan';
        if (weatherDesc.includes('rain') || weatherDesc.includes('thunder')) {
          status = 'Berawan';
        } else if (weatherDesc.includes('cloud')) {
          status = 'Sebagian berawan';
        } else if (weatherDesc.includes('clear')) {
          status = 'Cerah berawan';
        }

        result.push({
          day: dayLabel,
          date: (targetDate.getDate()).toString().padStart(2, '0') + '/' + 
                (targetDate.getMonth() + 1).toString().padStart(2, '0'),
          high: Math.round(maxTemp),
          low: Math.round(minTemp),
          icon: this.getWeatherEmoji(selectedData.weather[0].icon),
          weather: this.getWeatherStatus(selectedData.weather[0].icon),
          status: status,
          chance: Math.round(selectedData.pop * 100)
        });
      }
    }

    return result;
  }

  getWeatherEmoji(iconCode: string): string {
    const emojiMap: { [key: string]: string } = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '❄️', '13n': '❄️',
      '50d': '🌫️', '50n': '🌫️'
    };
    return emojiMap[iconCode] || '🌤️';
  }

  getWeatherStatus(iconCode: string): string {
    const statusMap: { [key: string]: string } = {
      '01d': 'Cerah', '01n': 'Cerah',
      '02d': 'Cerah berawan', '02n': 'Berawan',
      '03d': 'Berawan', '03n': 'Berawan',
      '04d': 'Berawan', '04n': 'Berawan',
      '09d': 'Hujan', '09n': 'Hujan',
      '10d': 'Hujan', '10n': 'Hujan',
      '11d': 'Badai petir', '11n': 'Badai petir',
      '13d': 'Salju', '13n': 'Salju',
      '50d': 'Kabut', '50n': 'Kabut'
    };
    return statusMap[iconCode] || 'Cerah berawan';
  }
}
