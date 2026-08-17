import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then((m) => m.Home) },
  { path: 'login', loadComponent: () => import('./pages/login/login').then((m) => m.Login) },
  { path: 'register', loadComponent: () => import('./pages/register/register').then((m) => m.Register) },
  {
    path: 'product/:id',
    loadComponent: () => import('./pages/product-detail/product-detail').then((m) => m.ProductDetail)
  },
  {
    path: 'cart',
    canActivate: [authGuard, roleGuard(['BUYER'])],
    loadComponent: () => import('./pages/cart/cart').then((m) => m.Cart)
  },
  {
    path: 'payment/:orderId',
    canActivate: [authGuard, roleGuard(['BUYER'])],
    loadComponent: () => import('./pages/payment/payment').then((m) => m.Payment)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard, roleGuard(['SELLER'])],
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard)
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/settings/settings').then((m) => m.Settings)
  },
  {
    path: 'orders',
    canActivate: [authGuard, roleGuard(['BUYER', 'SELLER'])],
    loadComponent: () => import('./pages/orders/orders').then((m) => m.Orders)
  },
  {
    path: 'products/new',
    canActivate: [authGuard, roleGuard(['SELLER'])],
    loadComponent: () => import('./pages/product-form/product-form').then((m) => m.ProductForm)
  },
  {
    path: 'product/:id/edit',
    canActivate: [authGuard, roleGuard(['SELLER'])],
    loadComponent: () => import('./pages/product-form/product-form').then((m) => m.ProductForm)
  },
  { path: '**', redirectTo: '/' }
];