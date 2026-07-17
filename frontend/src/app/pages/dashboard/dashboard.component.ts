import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { StatsCardComponent } from '../../shared/components/stats-card/stats-card.component';
import { ReportService } from '../../services/report.service';
import { DashboardStats } from '../../models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatTableModule, MatChipsModule, StatsCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  stats = signal<DashboardStats | null>(null);
  loading = signal(true);

  paymentsColumns = ['receipt_no', 'customer', 'amount', 'date'];
  customersColumns = ['code', 'name', 'phone', 'date'];
  dueColumns = ['account', 'customer', 'product', 'remaining', 'due_date', 'status'];

  constructor(private reportService: ReportService) {}

  get timeOfDay(): string {
    const h = new Date().getHours();
    return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  }

  get todayLabel(): string {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading.set(true);
    this.reportService.getDashboard().subscribe({
      next: (res) => {
        this.stats.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  formatCurrency(amount: number): string {
    return `PKR ${(amount || 0).toLocaleString()}`;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      active: 'badge-active',
      completed: 'badge-completed',
      overdue: 'badge-overdue',
      cancelled: 'badge-cancelled',
    };
    return 'badge ' + (map[status] || 'badge-cancelled');
  }
}
