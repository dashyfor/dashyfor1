import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.html',
  styleUrls: ['./logout.css']
})
export class Logout implements OnInit {

  constructor(
    private cookieService: CookieService,
    private router: Router
  ) {}

  ngOnInit(): void {

    // Hapus semua cookie
    this.cookieService.deleteAll();

    // Redirect ke halaman login
    this.router.navigate(['/login']);
  }

}