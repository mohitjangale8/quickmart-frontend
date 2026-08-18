import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then((m) => m.Home) },
  { path: 'login', loadComponent: () => import('./pages/login/login').then((m) => m.Login) },
  { path: 'register', loadComponent: () => import('./pages/register/register').then((m) => m.Register) },
  { path: 'merchant', loadComponent: () => import('./pages/merchant/merchant').then((m) => m.Merchant) },
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
    path: 'checkout',
    canActivate: [authGuard, roleGuard(['BUYER'])],
    loadComponent: () => import('./pages/checkout/checkout').then((m) => m.Checkout)
  },
  {
    path: 'payment/result',
    canActivate: [authGuard, roleGuard(['BUYER'])],
    loadComponent: () => import('./pages/payment-result/payment-result').then((m) => m.PaymentResult)
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
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile').then((m) => m.Profile)
  },
  {
    path: 'wishlist',
    canActivate: [authGuard, roleGuard(['BUYER'])],
    loadComponent: () => import('./pages/wishlist/wishlist').then((m) => m.Wishlist)
  },
  {
    path: 'orders',
    canActivate: [authGuard, roleGuard(['BUYER', 'SELLER'])],
    loadComponent: () => import('./pages/orders/orders').then((m) => m.Orders)
  },
  {
    path: 'orders/:id/tracking',
    canActivate: [authGuard, roleGuard(['BUYER', 'SELLER'])],
    loadComponent: () => import('./pages/tracking/tracking').then((m) => m.Tracking)
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