import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'sign-up',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
];
