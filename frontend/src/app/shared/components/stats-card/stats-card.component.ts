import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './stats-card.component.html',
  styleUrl: './stats-card.component.scss',
})
export class StatsCardComponent {
  @Input() title = '';
  @Input() value: number | string = 0;
  @Input() icon = 'info';
  @Input() color: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'teal' = 'blue';
  @Input() prefix = '';
  @Input() suffix = '';
  @Input() loading = false;
}
