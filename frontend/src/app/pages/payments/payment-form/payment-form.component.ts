import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PaymentService } from '../../../services/payment.service';
import { AccountService } from '../../../services/account.service';
import { Account } from '../../../models';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule],
  templateUrl: './payment-form.component.html',
  styleUrl: './payment-form.component.scss',
})
export class PaymentFormComponent implements OnInit {
  form: FormGroup;
  saving = signal(false);
  selectedAccount = signal<Account | null>(null);
  accounts = signal<Account[]>([]);
  loadingAccount = signal(false);

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private accountService: AccountService,
    private router: Router,
    private route: ActivatedRoute,
    private snack: MatSnackBar,
  ) {
    this.form = this.fb.group({
      account_id: ['', Validators.required],
      payment_date: [new Date().toISOString().split('T')[0], Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      remarks: [''],
    });
  }

  ngOnInit() {
    this.accountService.getAll({ status: 'active', limit: 100 }).subscribe(res => this.accounts.set(res.data));

    const accountId = this.route.snapshot.queryParamMap.get('account_id');
    if (accountId) {
      this.form.patchValue({ account_id: parseInt(accountId) });
      this.onAccountChange(parseInt(accountId));
    }

    this.form.get('account_id')!.valueChanges.subscribe(id => {
      if (id) this.onAccountChange(id);
    });
  }

  onAccountChange(id: number) {
    this.loadingAccount.set(true);
    this.accountService.getById(id).subscribe({
      next: (res) => {
        this.selectedAccount.set(res.data);
        this.form.patchValue({ amount: res.data.monthly_installment });
        this.loadingAccount.set(false);
      },
      error: () => this.loadingAccount.set(false),
    });
  }

  get remainingAfterPayment(): number {
    const remaining = parseFloat(String(this.selectedAccount()?.remaining || 0));
    const amount = parseFloat(this.form.value.amount) || 0;
    return Math.max(0, remaining - amount);
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);

    this.paymentService.create(this.form.value).subscribe({
      next: (res) => {
        this.snack.open('Payment recorded successfully', 'Close', { duration: 3000, panelClass: 'success-snack' });
        this.router.navigate(['/accounts', this.form.value.account_id]);
      },
      error: (err) => {
        this.saving.set(false);
        this.snack.open(err?.error?.message || 'Failed to record payment', 'Close', { duration: 4000, panelClass: 'error-snack' });
      },
    });
  }

  formatCurrency(n: number) { return `PKR ${(n || 0).toLocaleString()}`; }
}
