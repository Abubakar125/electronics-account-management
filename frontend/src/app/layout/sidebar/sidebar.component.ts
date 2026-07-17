import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule, MatTooltipModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  @Input() open = true;
  @Output() toggleSidebar = new EventEmitter<void>();

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Customers', icon: 'people', route: '/customers' },
    { label: 'Accounts', icon: 'account_balance_wallet', route: '/accounts' },
    { label: 'Payments', icon: 'payments', route: '/payments' },
    { label: 'Reports', icon: 'bar_chart', route: '/reports' },
    { label: 'Settings', icon: 'settings', route: '/settings' },
  ];

  constructor(public auth: AuthService) {}

  onToggle() {
    this.toggleSidebar.emit();
  }
}
