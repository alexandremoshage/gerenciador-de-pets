import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  items = [
    { label: 'Pets', route: '/pets' },
    { label: 'Tutor', route: '/tutor' },
    { label: 'Logout', action: 'logout' },
  ];

  constructor(
    private router: Router,
    private auth: AuthService,
  ) {}

  handle(item: { label: string; route?: string; action?: string }): void {
    if (item.action === 'logout') {
      this.auth.logout();
      this.router.navigate(['/login']);
      return;
    }

    if (item.label === 'Pets') {
      this.auth.logout();
      this.router.navigate(['/pets']);
      return;
    }
    if (item.route) {
      this.router.navigate([item.route]);
    }
  }
}
