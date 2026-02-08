import { Routes } from '@angular/router';
import { HomePage } from './pages/home.page/home.page';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'app',
    loadChildren: () => import('./pages/main-layout/layout.routes').then((m) => m.layout_routes),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
