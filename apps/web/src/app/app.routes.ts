import { Routes } from '@angular/router';
import { AuthPortal } from './auth-portal';

export const routes: Routes = [
  { path: 'app', component: AuthPortal },
  { path: 'auth/callback', component: AuthPortal },
  { path: 'auth/logout', component: AuthPortal },
];
