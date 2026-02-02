import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, SidebarComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  protected readonly title = signal('gerenciador-de-pets');
  constructor(private router: Router, private auth: AuthService) {}

  get isLogin(): boolean {
    return this.router.url === '/login';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
  
}
