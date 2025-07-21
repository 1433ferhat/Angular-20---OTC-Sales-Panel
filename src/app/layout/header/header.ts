// src/app/layout/header/header.ts
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  ViewEncapsulation,
} from '@angular/core';
import { Common } from '../../services/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatMenuModule, 
    MatIconModule, 
    MatDividerModule, 
    MatToolbarModule,
    MatButtonModule
  ],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Header {
  private common = inject(Common);
  private authService = inject(AuthService);

  // Output event for sidebar toggle
  sidebarToggle = output<void>();

  currentUserInitials = computed(() => this.common.getUserInitials());
  currentUserName = computed(() => this.common.getFullName() || 'Kullanıcı');
  currentUser = computed(() => this.common.getCurrentUser());

  toggleSidebar() {
    this.sidebarToggle.emit();
  }

  logout() {
    this.authService.logout();
  }
}