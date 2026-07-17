import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CustomerService } from '../../../services/customer.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Customer, TimelineEvent, CustomerSummary } from '../../../models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './customer-detail.component.html',
  styleUrl: './customer-detail.component.scss',
})
export class CustomerDetailComponent implements OnInit {
  customer = signal<Customer | null>(null);
  timeline = signal<TimelineEvent[]>([]);
  summary = signal<CustomerSummary | null>(null);
  loading = signal(true);
  activeTab = signal<string>('accounts');
  uploadsUrl = environment.uploadsUrl;

  constructor(
    private customerService: CustomerService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snack: MatSnackBar,
  ) {}

  ngOnInit() {
    const id = parseInt(this.route.snapshot.paramMap.get('id')!);
    this.loadCustomer(id);
  }

  loadCustomer(id: number) {
    this.loading.set(true);
    this.customerService.getById(id).subscribe({
      next: (res) => { this.customer.set(res.data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.router.navigate(['/customers']); },
    });
    this.customerService.getTimeline(id).subscribe(res => this.timeline.set(res.data));
    this.customerService.getSummary(id).subscribe(res => this.summary.set(res.data));
  }

  onDelete() {
    const c = this.customer();
    if (!c) return;
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Customer', message: `Delete "${c.name}" and all their records?`, confirmText: 'Delete', type: 'danger' },
      width: '400px',
    }).afterClosed().subscribe(ok => {
      if (!ok) return;
      this.customerService.delete(c.id).subscribe({
        next: () => { this.snack.open('Customer deleted', 'Close', { duration: 3000, panelClass: 'success-snack' }); this.router.navigate(['/customers']); },
        error: (err) => this.snack.open(err?.error?.message || 'Delete failed', 'Close', { duration: 4000, panelClass: 'error-snack' }),
      });
    });
  }

  getStatusClass(status: string) { return 'status-badge status-' + status; }
  photoUrl(path?: string) { return path ? `${this.uploadsUrl}${path}` : null; }
  formatCurrency(n: number) { return `PKR ${(n || 0).toLocaleString()}`; }
}
