import { Component, signal, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, NavbarComponent, CommonModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  sidebarOpen = signal(window.innerWidth > 768);

  isMobile() {
    return window.innerWidth <= 768;
  }

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth <= 768 && this.sidebarOpen()) {
      this.sidebarOpen.set(false);
    }
  }

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }

  onNavClick() {
    if (this.isMobile()) this.sidebarOpen.set(false);
  }
}
