import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PaymentService } from '../../../services/payment.service';
import { Payment } from '../../../models';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatTableModule, MatPaginatorModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule],
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

  displayedColumns = ['receipt_no', 'customer', 'account', 'amount', 'balance', 'date', 'remarks', 'actions'];

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

  onPage(e: PageEvent) { this.page.set(e.pageIndex); this.pageSize.set(e.pageSize); this.load(); }
  onFilter() { this.page.set(0); this.load(); }

  openReceipt(id: number) {
    window.open(this.paymentService.getReceiptUrl(id), '_blank');
  }

  formatCurrency(n: number) { return `PKR ${(n || 0).toLocaleString()}`; }
}
