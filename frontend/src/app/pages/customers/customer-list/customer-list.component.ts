import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { CustomerService } from '../../../services/customer.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Customer } from '../../../models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule, MatButtonModule, MatInputModule, MatFormFieldModule],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.scss',
})
export class CustomerListComponent implements OnInit {
  customers = signal<Customer[]>([]);
  loading = signal(true);
  total = signal(0);
  page = signal(0);
  pageSize = signal(10);
  searchQuery = signal('');
  uploadsUrl = environment.uploadsUrl;

  searchFocused = false;
  pageSizeModel = 10;

  private searchSubject = new Subject<string>();

  constructor(
    private customerService: CustomerService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged()).subscribe(() => {
      this.page.set(0);
      this.load();
    });

    this.route.queryParams.subscribe(p => {
      if (p['search']) {
        this.searchQuery.set(p['search']);
      }
      this.load();
    });
  }

  load() {
    this.loading.set(true);
    const params: any = { page: this.page() + 1, limit: this.pageSize() };
    if (this.searchQuery()) params.search = this.searchQuery();

    this.customerService.getAll(params).subscribe({
      next: (res) => {
        this.customers.set(res.data);
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch(q: string) {
    this.searchQuery.set(q);
    this.searchSubject.next(q);
  }

  min = Math.min;

  get totalPages(): number {
    return Math.ceil(this.total() / this.pageSize());
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const current = this.page();
    const pages: number[] = [];
    if (total <= 7) {
      for (let i = 0; i < total; i++) pages.push(i);
    } else {
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
    this.page.set(p);
    this.load();
  }

  onPageSizeChange(size: number) {
    this.pageSizeModel = size;
    this.pageSize.set(size);
    this.page.set(0);
    this.load();
  }

  onDelete(customer: Customer) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Customer',
        message: `Are you sure you want to delete "${customer.name}"? This will also delete all their accounts and payment history.`,
        confirmText: 'Delete',
        type: 'danger',
      },
      width: '400px',
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.customerService.delete(customer.id).subscribe({
        next: () => {
          this.snack.open('Customer deleted', 'Close', { duration: 3000, panelClass: 'success-snack' });
          this.load();
        },
        error: (err) => {
          this.snack.open(err?.error?.message || 'Delete failed', 'Close', { duration: 4000, panelClass: 'error-snack' });
        },
      });
    });
  }

  activeCount(): number {
    return this.customers().reduce((sum, c) => sum + (c.accounts?.filter((a: any) => ['active','overdue'].includes(a.status)).length || 0), 0);
  }

  newThisMonth(): number {
    const now = new Date();
    return this.customers().filter(c => {
      const d = new Date(c.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }

  getStatusBadge(accounts: any[]): string {
    const active = accounts?.filter(a => ['active', 'overdue'].includes(a.status)).length || 0;
    return `${active} active`;
  }

  photoUrl(path?: string): string {
    return path ? `${this.uploadsUrl}${path}` : '';
  }

  getAvatarGradient(name: string): string {
    const gradients = [
      'linear-gradient(135deg,#1d4ed8,#3b82f6)',
      'linear-gradient(135deg,#6d28d9,#8b5cf6)',
      'linear-gradient(135deg,#047857,#10b981)',
      'linear-gradient(135deg,#b45309,#f59e0b)',
      'linear-gradient(135deg,#b91c1c,#ef4444)',
      'linear-gradient(135deg,#0e7490,#06b6d4)',
    ];
    return gradients[name.charCodeAt(0) % gradients.length];
  }
}
