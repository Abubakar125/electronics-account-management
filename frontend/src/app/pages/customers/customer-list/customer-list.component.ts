import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
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
  imports: [CommonModule, RouterLink, FormsModule, MatTableModule, MatPaginatorModule, MatIconModule, MatButtonModule, MatInputModule, MatFormFieldModule],
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

  displayedColumns = ['photo', 'customer_code', 'name', 'cnic', 'phone1', 'accounts', 'created_at', 'actions'];

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

  onPage(e: PageEvent) {
    this.page.set(e.pageIndex);
    this.pageSize.set(e.pageSize);
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

  getStatusBadge(accounts: any[]): string {
    const active = accounts?.filter(a => ['active', 'overdue'].includes(a.status)).length || 0;
    return `${active} active`;
  }

  photoUrl(path?: string): string {
    return path ? `${this.uploadsUrl}${path}` : '';
  }
}
