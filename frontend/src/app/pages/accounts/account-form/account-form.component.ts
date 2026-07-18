import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_FORMATS, provideNativeDateAdapter } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { AccountService } from '../../../services/account.service';
import { CustomerService } from '../../../services/customer.service';
import { Customer } from '../../../models';

const DATE_FORMATS = {
  parse: { dateInput: {} as Intl.DateTimeFormatOptions },
  display: {
    dateInput: { day: '2-digit', month: 'short', year: 'numeric' } as Intl.DateTimeFormatOptions,
    monthYearLabel: { month: 'short', year: 'numeric' } as Intl.DateTimeFormatOptions,
    dateA11yLabel: { day: 'numeric', month: 'long', year: 'numeric' } as Intl.DateTimeFormatOptions,
    monthYearA11yLabel: { month: 'long', year: 'numeric' } as Intl.DateTimeFormatOptions,
  },
};

@Component({
  selector: 'app-account-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule, MatAutocompleteModule, MatDatepickerModule],
  providers: [provideNativeDateAdapter(), { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS }],
  templateUrl: './account-form.component.html',
  styleUrl: './account-form.component.scss',
})
export class AccountFormComponent implements OnInit {
  form: FormGroup;
  isEdit = signal(false);
  accountId = signal<number | null>(null);
  loading = signal(false);
  saving = signal(false);
  customers = signal<Customer[]>([]);
  customerSearch = signal('');
  private searchSubject = new Subject<string>();

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private customerService: CustomerService,
    private router: Router,
    private route: ActivatedRoute,
    private snack: MatSnackBar,
  ) {
    this.form = this.fb.group({
      customer_id: ['', Validators.required],
      product_name: ['', [Validators.required, Validators.maxLength(150)]],
      brand: [''],
      model: [''],
      total_price: ['', [Validators.required, Validators.min(1)]],
      advance: [0, Validators.min(0)],
      monthly_installment: ['', [Validators.required, Validators.min(1)]],
      duration: ['', [Validators.required, Validators.min(1)]],
      purchase_date: [new Date(), Validators.required],
      due_date: [null],
    });
  }

  ngOnInit() {
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged(), switchMap(q =>
      this.customerService.getAll({ search: q, limit: 10 })
    )).subscribe(res => this.customers.set(res.data));

    this.loadInitialCustomers();

    const id = this.route.snapshot.paramMap.get('id');
    const customerId = this.route.snapshot.queryParamMap.get('customer_id');

    if (id) {
      this.isEdit.set(true);
      this.accountId.set(parseInt(id));
      this.loadAccount(parseInt(id));
    } else if (customerId) {
      this.form.patchValue({ customer_id: parseInt(customerId) });
    }
  }

  loadInitialCustomers() {
    this.customerService.getAll({ limit: 20 }).subscribe(res => this.customers.set(res.data));
  }

  loadAccount(id: number) {
    this.loading.set(true);
    this.accountService.getById(id).subscribe({
      next: (res) => {
        const a = res.data;
        this.form.patchValue({
          customer_id: a.customer_id, product_name: a.product_name, brand: a.brand,
          model: a.model, total_price: a.total_price, advance: a.advance,
          monthly_installment: a.monthly_installment, duration: a.duration,
          purchase_date: a.purchase_date ? new Date(a.purchase_date + 'T00:00:00') : new Date(),
          due_date: a.due_date ? new Date(a.due_date + 'T00:00:00') : null,
        });
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.router.navigate(['/accounts']); },
    });
  }

  onCustomerSearch(q: string) {
    this.customerSearch.set(q);
    this.searchSubject.next(q);
  }

  displayCustomer(id: number): string {
    const c = this.customers().find(c => c.id === id);
    return c ? `${c.name} (${c.customer_code})` : '';
  }

  get remaining(): number {
    const total = parseFloat(this.form.value.total_price) || 0;
    const advance = parseFloat(this.form.value.advance) || 0;
    return Math.max(0, total - advance);
  }

  private toDateStr(d: Date | string | null | undefined): string {
    if (!d) return '';
    if (typeof d === 'string') return d;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);

    const raw = this.form.value;
    const data = {
      ...raw,
      purchase_date: this.toDateStr(raw.purchase_date),
      due_date: this.toDateStr(raw.due_date),
    };
    const request$ = this.isEdit()
      ? this.accountService.update(this.accountId()!, data)
      : this.accountService.create(data);

    request$.subscribe({
      next: (res) => {
        this.snack.open(this.isEdit() ? 'Account updated' : 'Account created', 'Close', { duration: 3000, panelClass: 'success-snack' });
        this.router.navigate(['/accounts', res.data.id]);
      },
      error: (err) => {
        this.saving.set(false);
        this.snack.open(err?.error?.message || 'Save failed', 'Close', { duration: 4000, panelClass: 'error-snack' });
      },
    });
  }
}
