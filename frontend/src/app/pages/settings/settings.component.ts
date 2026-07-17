import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SettingsService } from '../../services/settings.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  form: FormGroup;
  loading = signal(true);
  saving = signal(false);
  logoPreview = signal<string | null>(null);
  uploadsUrl = environment.uploadsUrl;
  private logoFile?: File;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private snack: MatSnackBar,
  ) {
    this.form = this.fb.group({
      company_name: [''],
      phone: [''],
      address: [''],
      currency: ['PKR'],
      receipt_footer: [''],
    });
  }

  ngOnInit() {
    this.settingsService.get().subscribe({
      next: (res) => {
        const s = res.data;
        this.form.patchValue({ company_name: s.company_name, phone: s.phone, address: s.address, currency: s.currency, receipt_footer: s.receipt_footer });
        if (s.logo) this.logoPreview.set(`${this.uploadsUrl}${s.logo}`);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onLogoChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.logoFile = file;
    const reader = new FileReader();
    reader.onload = e => this.logoPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  onSubmit() {
    this.saving.set(true);
    const formData = new FormData();
    Object.entries(this.form.value).forEach(([k, v]) => { if (v) formData.append(k, String(v)); });
    if (this.logoFile) formData.append('logo', this.logoFile);

    this.settingsService.update(formData).subscribe({
      next: () => {
        this.saving.set(false);
        this.snack.open('Settings saved successfully', 'Close', { duration: 3000, panelClass: 'success-snack' });
      },
      error: (err) => {
        this.saving.set(false);
        this.snack.open(err?.error?.message || 'Save failed', 'Close', { duration: 4000, panelClass: 'error-snack' });
      },
    });
  }
}
