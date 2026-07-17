import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'customers', loadComponent: () => import('./pages/customers/customer-list/customer-list.component').then(m => m.CustomerListComponent) },
      { path: 'customers/new', loadComponent: () => import('./pages/customers/customer-form/customer-form.component').then(m => m.CustomerFormComponent) },
      { path: 'customers/:id', loadComponent: () => import('./pages/customers/customer-detail/customer-detail.component').then(m => m.CustomerDetailComponent) },
      { path: 'customers/:id/edit', loadComponent: () => import('./pages/customers/customer-form/customer-form.component').then(m => m.CustomerFormComponent) },
      { path: 'accounts', loadComponent: () => import('./pages/accounts/account-list/account-list.component').then(m => m.AccountListComponent) },
      { path: 'accounts/new', loadComponent: () => import('./pages/accounts/account-form/account-form.component').then(m => m.AccountFormComponent) },
      { path: 'accounts/:id', loadComponent: () => import('./pages/accounts/account-detail/account-detail.component').then(m => m.AccountDetailComponent) },
      { path: 'accounts/:id/edit', loadComponent: () => import('./pages/accounts/account-form/account-form.component').then(m => m.AccountFormComponent) },
      { path: 'payments', loadComponent: () => import('./pages/payments/payment-list/payment-list.component').then(m => m.PaymentListComponent) },
      { path: 'payments/new', loadComponent: () => import('./pages/payments/payment-form/payment-form.component').then(m => m.PaymentFormComponent) },
      { path: 'reports', loadComponent: () => import('./pages/reports/reports.component').then(m => m.ReportsComponent) },
      { path: 'settings', loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent) },
    ],
  },
  { path: '**', redirectTo: '/dashboard' },
];
