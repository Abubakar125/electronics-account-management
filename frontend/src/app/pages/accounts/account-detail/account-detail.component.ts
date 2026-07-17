import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountService } from '../../../services/account.service';
import { PaymentService } from '../../../services/payment.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Account, Payment } from '../../../models';

@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatTableModule],
  templateUrl: './account-detail.component.html',
  styleUrl: './account-detail.component.scss',
})
export class AccountDetailComponent implements OnInit {
  account = signal<Account | null>(null);
  payments = signal<Payment[]>([]);
  loading = signal(true);

  paymentsColumns = ['receipt_no', 'date', 'amount', 'remaining', 'remarks', 'actions'];

  constructor(
    private accountService: AccountService,
    private paymentService: PaymentService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snack: MatSnackBar,
  ) {}

  ngOnInit() {
    const id = parseInt(this.route.snapshot.paramMap.get('id')!);
    this.loadAccount(id);
  }

  loadAccount(id: number) {
    this.loading.set(true);
    this.accountService.getById(id).subscribe({
      next: (res) => {
        this.account.set(res.data);
        this.payments.set(res.data.payments || []);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.router.navigate(['/accounts']); },
    });
  }

  get progressPercent(): number {
    const a = this.account();
    if (!a) return 0;
    const paid = parseFloat(String(a.total_price)) - parseFloat(String(a.remaining));
    return Math.round((paid / parseFloat(String(a.total_price))) * 100);
  }

  onOpenReceiptUrl(paymentId: number) {
    window.open(this.paymentService.getReceiptUrl(paymentId), '_blank');
  }

  onDelete() {
    const a = this.account();
    if (!a) return;
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Account', message: `Delete account ${a.account_number}? All payments will also be deleted.`, type: 'danger' },
      width: '400px',
    }).afterClosed().subscribe(ok => {
      if (!ok) return;
      this.accountService.delete(a.id).subscribe({
        next: () => { this.snack.open('Account deleted', 'Close', { duration: 3000, panelClass: 'success-snack' }); this.router.navigate(['/accounts']); },
        error: (err) => this.snack.open(err?.error?.message || 'Delete failed', 'Close', { duration: 4000, panelClass: 'error-snack' }),
      });
    });
  }

  getStatusClass(s: string) { return 'badge badge-' + s; }
  formatCurrency(n: number) { return `PKR ${(n || 0).toLocaleString()}`; }
}
