import { Component, Output, EventEmitter, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatMenuModule, MatTooltipModule, MatDividerModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  searchQuery = '';
  isDarkMode = signal(false);

  constructor(public auth: AuthService, private router: Router) {
    const saved = localStorage.getItem('dark_mode');
    if (saved === 'true') {
      this.isDarkMode.set(true);
      document.documentElement.classList.add('dark-mode');
    }
  }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/customers'], { queryParams: { search: this.searchQuery.trim() } });
    }
  }

  toggleDarkMode() {
    this.isDarkMode.update(v => !v);
    document.documentElement.classList.toggle('dark-mode', this.isDarkMode());
    localStorage.setItem('dark_mode', String(this.isDarkMode()));
  }
}
