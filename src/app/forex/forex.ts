import { AfterViewInit, Component, Renderer2 } from '@angular/core';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { Footer } from '../footer/footer';
import { HttpClient } from '@angular/common/http';

declare const $: any;

@Component({
  selector: 'app-forex',
  standalone: true,
  imports: [Footer, Header, Sidebar],
  templateUrl: './forex.html',
  styleUrl: './forex.css'
})
export class Forex implements AfterViewInit {

  private _table1: any;

  totalData = 0;
  totalCurrency = 0;
  updateTime = '';

  constructor(
    private renderer: Renderer2,
    private httpClient: HttpClient
  ) {}

  ngAfterViewInit(): void {

    this.renderer.removeClass(document.body, 'sidebar-open');
    this.renderer.addClass(document.body, 'sidebar-closed');
    this.renderer.addClass(document.body, 'sidebar-collapse');

    this._table1 = $('#table1').DataTable({
      responsive: true,
      autoWidth: false,
      pageLength: 10,
      lengthChange: true,
      searching: true,
      ordering: true,
      info: true,

      columnDefs: [
        {
          targets: 0,
          className: 'text-center'
        },
        {
          targets: 3,
          className: 'text-right'
        }
      ]
    });

    this.bindTable1();
  }

  refreshData(): void {
    this.bindTable1();
  }

  bindTable1(): void {

    const ratesUrl =
      'https://openexchangerates.org/api/latest.json?app_id=bc7a3c02ef3f4a87873e6f00edb595b3';

    const currenciesUrl =
      'https://openexchangerates.org/api/currencies.json';

    this._table1.clear().draw();

    this.httpClient.get(currenciesUrl).subscribe({

      next: (currencies: any) => {

        this.httpClient.get(ratesUrl).subscribe({

          next: (data: any) => {

            const updateDate =
              new Date(data.timestamp * 1000);

            this.updateTime =
              this.formatDate(updateDate);

            $('#tanggal').html(
              'Data per tanggal ' +
              this.updateTime
            );

            const rates = data.rates;

            this.totalData =
              Object.keys(rates).length;

            this.totalCurrency =
              Object.keys(rates).length;

            let index = 1;

            for (const currency in rates) {

              const currencyName =
                currencies[currency] || '-';

              // Konversi ke Rupiah
              const rate =
                rates.IDR / rates[currency];

              // Format Rupiah Indonesia
              const formatRate =
                new Intl.NumberFormat(
                  'id-ID',
                  {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }
                ).format(rate);

              const row = [
                index++,
                currency,
                currencyName,
                formatRate
              ];

              this._table1.row.add(row);
            }

            this._table1.draw(false);
          },

          error: (err) => {

            console.error(
              'Gagal mengambil data kurs',
              err
            );

            alert(
              'Gagal mengambil data kurs mata uang.'
            );
          }

        });
      },

      error: (err) => {

        console.error(
          'Gagal mengambil data mata uang',
          err
        );

        alert(
          'Gagal mengambil data mata uang.'
        );
      }

    });
  }

  formatDate(date: Date): string {

    const day =
      String(date.getDate()).padStart(2, '0');

    const month =
      String(date.getMonth() + 1).padStart(2, '0');

    const year =
      date.getFullYear();

    const hours =
      String(date.getHours()).padStart(2, '0');

    const minutes =
      String(date.getMinutes()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}`;
  }

}