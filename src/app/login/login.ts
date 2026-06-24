import { Component, OnDestroy, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import * as CryptoJS from 'crypto-js';

declare const $: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:mousemove)': 'onMouseMove($event)',
  },
})
export class Login implements OnDestroy {
  private router = inject(Router);
  private httpClient = inject(HttpClient);
  private cookieService = inject(CookieService);
  private hideMaskTimeout: any;

  onMouseMove(event: MouseEvent): void {
    const helmetImage = document.querySelector('.hero__image--helmet') as HTMLElement;

    if (!helmetImage) {
      return;
    }

    helmetImage.style.setProperty('--mouse-x', `${event.clientX}px`);

    helmetImage.style.setProperty('--mouse-y', `${event.clientY}px`);

    helmetImage.classList.add('active-mask');

    clearTimeout(this.hideMaskTimeout);

    this.hideMaskTimeout = setTimeout(() => {
      helmetImage.classList.remove('active-mask');
    }, 2000);
  }

  showPeringatanModal(message: string): void {
    $('#peringatanModal').modal();
    $('#pm_message').html(message);
  }

  ngOnDestroy(): void {
    clearTimeout(this.hideMaskTimeout);
  }

  signIn(): void {
    console.log('signIn()');

    let userId: any = $('#idText').val();
    userId = encodeURIComponent(userId);

    let password: any = $('#passwordText').val();
    password = encodeURIComponent(password);

    const url =
      'https://stmikpontianak.cloud/011100862/login.php' +
      '?id=' +
      userId +
      '&password=' +
      password;

    console.log('url : ' + url);

    this.httpClient.get(url).subscribe((data: any) => {
      console.log(data);

      const row = data[0];

      if (row.idCount !== '1') {
        this.showPeringatanModal('Id atau password tidak cocok');
        return;
      }

      const secretKey = 'rahasia123';

      const encryptedUserId = CryptoJS.AES.encrypt(userId, secretKey).toString();

      this.cookieService.set('userId', encryptedUserId);

      console.log('session data berhasil dibuat');

      this.router.navigate(['/dashboard']);
    });
  }
}
