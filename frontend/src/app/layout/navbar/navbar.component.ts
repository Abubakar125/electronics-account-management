import { Component, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';

interface PageInfo { name: string; icon: string; gradient: string; }

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatMenuModule, MatTooltipModule, MatDividerModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();

  searchQuery = '';
  searchFocused = false;
  currentPage = signal<PageInfo>({ name: 'Dashboard', icon: 'dashboard', gradient: 'linear-gradient(135deg,#1D4ED8,#3B82F6)' });

  private readonly pageMap: Record<string, PageInfo> = {
    '/dashboard':  { name: 'Dashboard',  icon: 'dashboard',              gradient: 'linear-gradient(135deg,#1D4ED8,#3B82F6)' },
    '/customers':  { name: 'Customers',  icon: 'people',                 gradient: 'linear-gradient(135deg,#1D4ED8,#3B82F6)' },
    '/accounts':   { name: 'Accounts',   icon: 'account_balance_wallet', gradient: 'linear-gradient(135deg,#6D28D9,#8B5CF6)' },
    '/payments':   { name: 'Payments',   icon: 'payments',               gradient: 'linear-gradient(135deg,#047857,#10B981)' },
    '/reports':    { name: 'Reports',    icon: 'bar_chart',              gradient: 'linear-gradient(135deg,#B45309,#F59E0B)' },
    '/settings':   { name: 'Settings',   icon: 'settings',               gradient: 'linear-gradient(135deg,#475569,#64748B)' },
  };

  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.updateCurrentPage();
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => this.updateCurrentPage());
  }

  private updateCurrentPage() {
    const url = this.router.url.split('?')[0];
    for (const [path, page] of Object.entries(this.pageMap)) {
      if (url === path || url.startsWith(path + '/')) {
        this.currentPage.set(page);
        return;
      }
    }
  }

  onToggleSidebar() { this.toggleSidebar.emit(); }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/customers'], { queryParams: { search: this.searchQuery.trim() } });
    }
  }
}
