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
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './customer-form.component.html',
  styleUrl: './customer-form.component.scss',
})
export class CustomerFormComponent implements OnInit {
  form: FormGroup;
  isEdit = signal(false);
  customerId = signal<number | null>(null);
  loading = signal(false);
  saving = signal(false);
  uploadsUrl = environment.uploadsUrl;

  photoPreview = signal<string | null>(null);
  cnicFrontPreview = signal<string | null>(null);
  cnicBackPreview = signal<string | null>(null);

  private files: { photo?: File; cnic_front?: File; cnic_back?: File } = {};

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
      reference: [''],
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
          occupation: c.occupation, reference: c.reference,
        });
        if (c.photo) this.photoPreview.set(`${this.uploadsUrl}${c.photo}`);
        if (c.cnic_front) this.cnicFrontPreview.set(`${this.uploadsUrl}${c.cnic_front}`);
        if (c.cnic_back) this.cnicBackPreview.set(`${this.uploadsUrl}${c.cnic_back}`);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.router.navigate(['/customers']); },
    });
  }

  onFileChange(event: Event, field: 'photo' | 'cnic_front' | 'cnic_back') {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.files[field] = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (field === 'photo') this.photoPreview.set(result);
      if (field === 'cnic_front') this.cnicFrontPreview.set(result);
      if (field === 'cnic_back') this.cnicBackPreview.set(result);
    };
    reader.readAsDataURL(file);
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);

    const formData = new FormData();
    Object.entries(this.form.value).forEach(([k, v]) => { if (v) formData.append(k, String(v)); });
    if (this.files.photo) formData.append('photo', this.files.photo);
    if (this.files.cnic_front) formData.append('cnic_front', this.files.cnic_front);
    if (this.files.cnic_back) formData.append('cnic_back', this.files.cnic_back);

    const request$ = this.isEdit()
      ? this.customerService.update(this.customerId()!, formData)
      : this.customerService.create(formData);

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
