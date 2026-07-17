import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PaymentService } from '../../../services/payment.service';
import { Payment } from '../../../models';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './payment-list.component.html',
  styleUrl: './payment-list.component.scss',
})
export class PaymentListComponent implements OnInit {
  payments = signal<Payment[]>([]);
  loading = signal(true);
  total = signal(0);
  page = signal(0);
  pageSize = signal(10);
  dateFrom = signal('');
  dateTo = signal('');

  dateFromModel = '';
  dateToModel = '';
  pageSizeModel = 10;
  min = Math.min;

  constructor(private paymentService: PaymentService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    const params: any = { page: this.page() + 1, limit: this.pageSize() };
    if (this.dateFrom()) params.from = this.dateFrom();
    if (this.dateTo()) params.to = this.dateTo();

    this.paymentService.getAll(params).subscribe({
      next: (res) => { this.payments.set(res.data); this.total.set(res.total); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onFilter() { this.page.set(0); this.load(); }

  clearDates() {
    this.dateFromModel = ''; this.dateToModel = '';
    this.dateFrom.set(''); this.dateTo.set('');
    this.onFilter();
  }

  todayTotal(): number {
    const today = new Date().toISOString().split('T')[0];
    return this.payments().filter(p => String(p.payment_date).startsWith(today)).reduce((s, p) => s + Number(p.amount), 0);
  }

  monthTotal(): number {
    const now = new Date();
    return this.payments().filter(p => {
      const d = new Date(p.payment_date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((s, p) => s + Number(p.amount), 0);
  }

  get totalPages(): number { return Math.ceil(this.total() / this.pageSize()); }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const current = this.page();
    const pages: number[] = [];
    if (total <= 7) { for (let i = 0; i < total; i++) pages.push(i); }
    else {
      pages.push(0);
      if (current > 2) pages.push(-1);
      for (let i = Math.max(1, current - 1); i <= Math.min(total - 2, current + 1); i++) pages.push(i);
      if (current < total - 3) pages.push(-1);
      pages.push(total - 1);
    }
    return pages;
  }

  goToPage(p: number) {
    if (p < 0 || p >= this.totalPages || p === this.page()) return;
    this.page.set(p); this.load();
  }

  onPageSizeChange(size: number) {
    this.pageSizeModel = size; this.pageSize.set(size); this.page.set(0); this.load();
  }

  getAvatarGradient(name: string): string {
    const g = ['linear-gradient(135deg,#1d4ed8,#3b82f6)', 'linear-gradient(135deg,#6d28d9,#8b5cf6)', 'linear-gradient(135deg,#047857,#10b981)', 'linear-gradient(135deg,#b45309,#f59e0b)', 'linear-gradient(135deg,#b91c1c,#ef4444)', 'linear-gradient(135deg,#0e7490,#06b6d4)'];
    return g[(name || 'P').charCodeAt(0) % g.length];
  }

  formatCurrency(n: number | string) { return `PKR ${(Number(n) || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
}
