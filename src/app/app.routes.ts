import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Dashboard2 } from './dashboard2/dashboard2';
import { Dashboard3 } from './dashboard3/dashboard3';
import { Login } from './login/login';
import { Register } from './register/register';
import { Admin } from './admin/admin';
import { Mahasiswa } from './mahasiswa/mahasiswa';
import { otentikasiGuard } from './otentikasi-guard';
import { Forex } from './forex/forex';
import { Logout } from './logout/logout';
import { Cuaca } from './cuaca/cuaca';
import { Sudoku } from './sudoku/sudoku';

export const routes: Routes = [
  { path: 'dashboard', component: Dashboard, canActivate: [otentikasiGuard] },
  { path: 'dashboard2', component: Dashboard2, canActivate: [otentikasiGuard] },
  { path: 'dashboard3', component: Dashboard3, canActivate: [otentikasiGuard] },
  { path: 'forex', component: Forex, canActivate: [otentikasiGuard] },
  { path: 'login', component: Login },
  { path: 'logout', component: Logout },
  { path: 'register', component: Register },
  { path: 'admin', component: Admin },
  { path: 'mahasiswa', component: Mahasiswa, canActivate: [otentikasiGuard] },
  { path: 'cuaca', component: Cuaca, canActivate: [otentikasiGuard] },
  { path: 'sudoku', component: Sudoku, canActivate: [otentikasiGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
