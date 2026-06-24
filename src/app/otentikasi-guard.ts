import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import * as CryptoJS from 'crypto-js';

export const otentikasiGuard: CanActivateFn = (route, state) => {

  console.log("Otentikasi dimulai");

  const secretKey = "rahasia123";

  const encryptedUserId =
    inject(CookieService).get("userId");

  let userId = "";

  if (encryptedUserId) {

    const bytes = CryptoJS.AES.decrypt(
      encryptedUserId,
      secretKey
    );

    userId = bytes.toString(
      CryptoJS.enc.Utf8
    );
  }

  console.log("userId: " + userId);

  if (userId !== "") {
    return true;
  }

  inject(Router).navigate(["/login"]);
  return false;
};