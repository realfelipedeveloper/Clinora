import { Routes } from '@angular/router';
import { DocPage } from './doc-page';

export const routes: Routes = [
  { path: '', redirectTo: 'constituicao', pathMatch: 'full' },
  { path: ':slug', component: DocPage },
];
