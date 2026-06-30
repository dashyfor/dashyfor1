import { AfterViewInit, Component, Renderer2 } from '@angular/core';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { Footer } from '../footer/footer';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

declare const $: any;

@Component({
  selector: 'app-mahasiswa',
  standalone: true,
  imports: [Header, Sidebar, Footer, RouterModule],
  templateUrl: './mahasiswa.html',
  styleUrl: './mahasiswa.css',
})
export class Mahasiswa implements AfterViewInit {

  data: any;
  table1: any;

  constructor(
    private httpClient: HttpClient,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit(): void {

    this.renderer.removeClass(document.body, 'sidebar-open');
    this.renderer.removeClass(document.body, 'sidebar-collapse');
    this.renderer.addClass(document.body, 'sidebar-closed');

    this.table1 = $('#table1').DataTable();

    this.bindMahasiswa();

  }

  bindMahasiswa(): void {

    this.httpClient
      .get('https://stmikpontianak.cloud/011100862/tampilMahasiswa.php')
      .subscribe((data: any) => {

        console.table(data);

        this.table1.clear();

        data.forEach((element: any) => {

          const tempatTanggalLahir =
            element.TempatLahir + ', ' + element.TanggalLahir;

          const jenisKelaminFormatted =
            element.JenisKelamin +
            ' ' +
            (
              element.JenisKelamin === 'Perempuan' ||
              element.JenisKelamin === 'perempuan'
                ? "<i class='fas fa-venus text-danger'></i>"
                : element.JenisKelamin === 'Laki-laki'
                ? "<i class='fas fa-mars text-primary'></i>"
                : ''
            );

          const row = [
            element.NIM,
            element.Nama,
            jenisKelaminFormatted,
            tempatTanggalLahir,
            element.JP,
            element.Alamat,
            element.StatusNikah,
            element.TahunMasuk
          ];

          this.table1.row.add(row);

        });

        this.table1.draw(false);

      });

  }

  showTambahModal(): void {
    $('#tambahModal').modal();
  }

  postRecord(): void {

    let alamat = $('#alamatText').val();
    let jenisKelamin = $('#jenisKelaminSelect').val();
    let jp = $('#jpSelect').val();
    let nama = $('#namaText').val();
    let nim = $('#nimText').val();
    let statusNikah = $('#statusNikahSelect').val();
    let tahunMasuk = $('#tahunMasukText').val();
    let tanggalLahir = $('#tanggalLahirText').val();
    let tempatLahir = $('#tempatLahirText').val();

    if (!nim || nim.toString().length === 0) {
      alert('NIM belum diisi');
      return;
    }

    if (!nama || nama.toString().length === 0) {
      alert('Nama belum diisi');
      return;
    }

    if (!tempatLahir || tempatLahir.toString().length === 0) {
      alert('Tempat lahir belum diisi');
      return;
    }

    if (!jenisKelamin || jenisKelamin.toString().length === 0) {
      alert('Jenis kelamin belum dipilih');
      return;
    }

    if (!jp || jp.toString().length === 0) {
      alert('Jurusan/Prodi belum dipilih');
      return;
    }

    if (!alamat || alamat.toString().length === 0) {
      alert('Alamat belum diisi');
      return;
    }

    if (!statusNikah || statusNikah.toString().length === 0) {
      alert('Status pernikahan belum dipilih');
      return;
    }

    if (!tahunMasuk || tahunMasuk.toString().length === 0) {
      alert('Tahun masuk belum diisi');
      return;
    }

    if (!tanggalLahir || tanggalLahir.toString().length === 0) {
      alert('Tanggal lahir belum diisi');
      return;
    }

    alamat = encodeURIComponent(alamat);
    jenisKelamin = encodeURIComponent(jenisKelamin);
    jp = encodeURIComponent(jp);
    nama = encodeURIComponent(nama);
    nim = encodeURIComponent(nim);
    statusNikah = encodeURIComponent(statusNikah);
    tahunMasuk = encodeURIComponent(tahunMasuk);
    tanggalLahir = encodeURIComponent(tanggalLahir);
    tempatLahir = encodeURIComponent(tempatLahir);

    const url =
      'https://stmikpontianak.cloud/011100862/tambahMahasiswa.php' +
      '?alamat=' + alamat +
      '&jenisKelamin=' + jenisKelamin +
      '&jp=' + jp +
      '&nama=' + nama +
      '&nim=' + nim +
      '&statusPernikahan=' + statusNikah +
      '&tahunMasuk=' + tahunMasuk +
      '&tanggalLahir=' + tanggalLahir +
      '&tempatLahir=' + tempatLahir;

    this.httpClient.get(url)
      .subscribe((data: any) => {

        console.log(data);

        alert(data.status + ' --> ' + data.message);

        this.bindMahasiswa();

        $('#tambahModal').modal('hide');

      });

  }

}