import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { AccountService } from '../../../services/account.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Account } from '../../../models';

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatTableModule, MatPaginatorModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './account-list.component.html',
  styleUrl: './account-list.component.scss',
})
export class AccountListComponent implements OnInit {
  accounts = signal<Account[]>([]);
  loading = signal(true);
  total = signal(0);
  page = signal(0);
  pageSize = signal(10);
  searchQuery = signal('');
  statusFilter = signal('');

  displayedColumns = ['account_number', 'customer', 'product', 'total_price', 'remaining', 'monthly', 'due_date', 'status', 'actions'];
  private searchSubject = new Subject<string>();

  constructor(
    private accountService: AccountService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged()).subscribe(() => { this.page.set(0); this.load(); });
    this.route.queryParams.subscribe(() => this.load());
  }

  load() {
    this.loading.set(true);
    const params: any = { page: this.page() + 1, limit: this.pageSize() };
    if (this.searchQuery()) params.search = this.searchQuery();
    if (this.statusFilter()) params.status = this.statusFilter();

    this.accountService.getAll(params).subscribe({
      next: (res) => { this.accounts.set(res.data); this.total.set(res.total); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onSearch(q: string) { this.searchQuery.set(q); this.searchSubject.next(q); }
  onStatusChange(s: string) { this.statusFilter.set(s); this.page.set(0); this.load(); }
  onPage(e: PageEvent) { this.page.set(e.pageIndex); this.pageSize.set(e.pageSize); this.load(); }

  onDelete(account: Account) {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Account', message: `Delete account "${account.account_number}"? All payments will also be deleted.`, type: 'danger' },
      width: '400px',
    }).afterClosed().subscribe(ok => {
      if (!ok) return;
      this.accountService.delete(account.id).subscribe({
        next: () => { this.snack.open('Account deleted', 'Close', { duration: 3000, panelClass: 'success-snack' }); this.load(); },
        error: (err) => this.snack.open(err?.error?.message || 'Delete failed', 'Close', { duration: 4000, panelClass: 'error-snack' }),
      });
    });
  }

  getStatusClass(s: string) { return 'badge badge-' + s; }
  formatCurrency(n: number) { return `PKR ${(n || 0).toLocaleString()}`; }
  isOverdue(account: Account) { return account.due_date && new Date(account.due_date) < new Date() && account.status === 'active'; }
}
