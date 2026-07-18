import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { AccountService } from '../../../services/account.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Account } from '../../../models';

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule, MatButtonModule],
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

  searchFocused = false;
  statusModel = '';
  pageSizeModel = 10;
  min = Math.min;

  private searchSubject = new Subject<string>();

  constructor(
    private accountService: AccountService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged()).subscribe(() => { this.page.set(0); this.load(); });
    this.route.queryParams.subscribe(params => {
      if (params['status']) {
        this.statusFilter.set(params['status']);
        this.statusModel = params['status'];
      }
      this.load();
    });
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

  countByStatus(status: string): number {
    return this.accounts().filter(a => a.status === status).length;
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

  getAvatarGradient(name: string): string {
    const g = ['linear-gradient(135deg,#1d4ed8,#3b82f6)', 'linear-gradient(135deg,#6d28d9,#8b5cf6)', 'linear-gradient(135deg,#047857,#10b981)', 'linear-gradient(135deg,#b45309,#f59e0b)', 'linear-gradient(135deg,#b91c1c,#ef4444)', 'linear-gradient(135deg,#0e7490,#06b6d4)'];
    return g[(name || 'A').charCodeAt(0) % g.length];
  }

  getStatusClass(s: string) { return 'badge badge-' + s; }
  formatCurrency(n: number) { return `PKR ${(n || 0).toLocaleString()}`; }
  isOverdue(a: Account) { return a.due_date && new Date(a.due_date) < new Date() && a.status === 'active'; }
}
