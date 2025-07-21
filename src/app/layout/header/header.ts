import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { Common } from '../../services/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth.service';
import { MatToolbar } from '@angular/material/toolbar';

@Component({
  selector:"app-header",
  imports: [MatMenuModule, MatIcon, MatDividerModule, MatToolbar],
  templateUrl: './header.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Header {
  private common = inject(Common);
  private authService = inject(AuthService);

  currentUserInitials = computed(() => this.common.getUserInitials());
  currentUserName = computed(() => this.common.getFullName() || 'Kullanıcı');
  currentUser = computed(() => this.common.getCurrentUser());

  sidebarOpen = signal<boolean>(true);
  toggleSidebar() {
    this.sidebarOpen.update((open) => !open);
  }
  logout() {
    this.authService.logout();
  }
}
