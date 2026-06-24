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
    // Cek class dark-mode di body saat awal
    this.isDarkMode = document.body.classList.contains('dark-mode');

    // Opsional: jika ingin mendeteksi perubahan class body secara real-time
    // Kita gunakan MutationObserver (lebih advanced) atau sederhananya:
    // Karena perubahan class body hanya dilakukan oleh sidebar, dan header akan
    // ikut berubah melalui CSS. Properti isDarkMode hanya untuk keperluan tampilan ikon/dll.
    // Agar isDarkMode selalu sinkron, kita bisa tambahkan interval atau lebih baik pakai service.
    // Namun untuk sederhananya, CSS sudah cukup untuk warna. Jika tetap ingin properti isDarkMode
    // bisa di-update, buat fungsi cek berkala atau panggil dari sidebar via EventEmitter.
    // Tapi karena Anda tidak ingin ribet, abaikan saja sinkronisasi properti ini,
    // dan hanya gunakan CSS untuk mengubah tampilan.
  }

  // Fungsi toggle untuk header (optional, jika ingin tombol di header juga)
  toggleTheme(): void {
    if (document.body.classList.contains('dark-mode')) {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
      this.isDarkMode = false;
    } else {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
      this.isDarkMode = true;
    }
  }
}