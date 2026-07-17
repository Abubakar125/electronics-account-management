import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatTabsModule, MatTableModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
})
export class ReportsComponent implements OnInit {
  // Collection
  collectionData = signal<any>(null);
  collectionLoading = signal(false);
  period = signal('monthly');
  dateFrom = signal('');
  dateTo = signal('');

  // Outstanding
  outstandingData = signal<any>(null);
  outstandingLoading = signal(false);

  // Completed
  completedData = signal<any>(null);
  completedLoading = signal(false);

  // Customer
  customerData = signal<any[]>([]);
  customerLoading = signal(false);

  collectionColumns = ['receipt_no', 'date', 'customer', 'account', 'product', 'amount'];
  outstandingColumns = ['account_number', 'customer', 'product', 'total', 'remaining', 'monthly', 'due_date', 'status'];
  completedColumns = ['account_number', 'customer', 'product', 'total', 'purchase_date', 'completed_date'];
  customerColumns = ['code', 'name', 'phone', 'cnic', 'accounts', 'paid', 'outstanding'];

  constructor(private reportService: ReportService) {}

  ngOnInit() {
    this.loadCollection();
    this.loadOutstanding();
    this.loadCompleted();
    this.loadCustomers();
  }

  loadCollection() {
    this.collectionLoading.set(true);
    const params: any = { period: this.period() };
    if (this.dateFrom()) params.from = this.dateFrom();
    if (this.dateTo()) params.to = this.dateTo();

    this.reportService.getCollection(params).subscribe({
      next: (res) => { this.collectionData.set(res); this.collectionLoading.set(false); },
      error: () => this.collectionLoading.set(false),
    });
  }

  loadOutstanding() {
    this.outstandingLoading.set(true);
    this.reportService.getOutstanding().subscribe({
      next: (res) => { this.outstandingData.set(res); this.outstandingLoading.set(false); },
      error: () => this.outstandingLoading.set(false),
    });
  }

  loadCompleted() {
    this.completedLoading.set(true);
    this.reportService.getCompleted().subscribe({
      next: (res) => { this.completedData.set(res); this.completedLoading.set(false); },
      error: () => this.completedLoading.set(false),
    });
  }

  loadCustomers() {
    this.customerLoading.set(true);
    this.reportService.getCustomers().subscribe({
      next: (res) => { this.customerData.set(res.data); this.customerLoading.set(false); },
      error: () => this.customerLoading.set(false),
    });
  }

  exportCollection() {
    const params: any = { period: this.period() };
    if (this.dateFrom()) params.from = this.dateFrom();
    if (this.dateTo()) params.to = this.dateTo();
    window.open(this.reportService.exportCollectionUrl(params), '_blank');
  }

  exportOutstanding() {
    window.open(this.reportService.exportOutstandingUrl(), '_blank');
  }

  formatCurrency(n: number) { return `PKR ${(n || 0).toLocaleString()}`; }
  getStatusClass(s: string) { return 'badge badge-' + s; }
}
