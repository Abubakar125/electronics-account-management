import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomerService } from '../../../services/customer.service';
import { CnicMaskDirective } from '../../../shared/directives/cnic-mask.directive';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, CnicMaskDirective],
  templateUrl: './customer-form.component.html',
  styleUrl: './customer-form.component.scss',
})
export class CustomerFormComponent implements OnInit {
  form: FormGroup;
  isEdit = signal(false);
  customerId = signal<number | null>(null);
  loading = signal(false);
  saving = signal(false);

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private router: Router,
    private route: ActivatedRoute,
    private snack: MatSnackBar,
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(150)]],
      father_name: ['', Validators.maxLength(150)],
      cnic: ['', [Validators.required, Validators.pattern(/^\d{5}-\d{7}-\d{1}$/)]],
      phone1: ['', [Validators.required, Validators.minLength(10)]],
      phone2: [''],
      address: [''],
      occupation: [''],
      ref_name: [''],
      ref_phone: [''],
      ref_cnic: ['', [Validators.pattern(/^\d{5}-\d{7}-\d{1}$/)]],
      ref_address: [''],
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.customerId.set(parseInt(id));
      this.loadCustomer(parseInt(id));
    }
  }

  loadCustomer(id: number) {
    this.loading.set(true);
    this.customerService.getById(id).subscribe({
      next: (res) => {
        const c = res.data;
        this.form.patchValue({
          name: c.name, father_name: c.father_name, cnic: c.cnic,
          phone1: c.phone1, phone2: c.phone2, address: c.address,
          occupation: c.occupation,
          ref_name: c.ref_name, ref_phone: c.ref_phone,
          ref_cnic: c.ref_cnic, ref_address: c.ref_address,
        });
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.router.navigate(['/customers']); },
    });
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);

    const request$ = this.isEdit()
      ? this.customerService.update(this.customerId()!, this.form.value)
      : this.customerService.create(this.form.value);

    request$.subscribe({
      next: (res) => {
        this.snack.open(this.isEdit() ? 'Customer updated' : 'Customer created', 'Close', { duration: 3000, panelClass: 'success-snack' });
        this.router.navigate(['/customers', res.data.id]);
      },
      error: (err) => {
        this.saving.set(false);
        this.snack.open(err?.error?.message || 'Save failed', 'Close', { duration: 4000, panelClass: 'error-snack' });
      },
    });
  }
}
