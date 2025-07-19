import { Injectable, signal, computed } from '@angular/core';
import { UserModel } from '@shared/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class Common {
  // Sadece user state'i tut
  user = signal<UserModel | undefined>(undefined);

  // Computed değerler
  readonly isLoggedIn = computed(() => !!this.user());
  readonly currentUserName = computed(() => this.user()?.name || '');
  readonly currentUserEmail = computed(() => this.user()?.email || '');

  // User set et
  setUser(user: UserModel): void {
    this.user.set(user);
  }

  // User temizle
  clearUser(): void {
    this.user.set(undefined);
  }

  // Mevcut user'ı al
  getCurrentUser(): UserModel | undefined {
    return this.user();
  }

  // Role kontrolü
  hasRole(role: string): boolean {
    const currentUser = this.user();
    if (!currentUser) return false;

    return currentUser.operationClaims.some((claim) => claim.name === role);
  }

  // Admin mi kontrol et
  isAdmin(): boolean {
    return this.hasRole('Admin') || this.hasRole('Auth.Admin');
  }

  // Birden fazla rolden birine sahip mi
  hasAnyRole(roles: string[]): boolean {
    return roles.some((role) => this.hasRole(role));
  }

  // Tüm rollere sahip mi
  hasAllRoles(roles: string[]): boolean {
    return roles.every((role) => this.hasRole(role));
  }

  // User'ın tüm rollerini al
  getUserRoles(): string[] {
    const currentUser = this.user();
    if (!currentUser) return [];

    return currentUser.operationClaims.map((claim) => claim.name);
  }

  // User'ın tam adını al
  getFullName(): string {
    const currentUser = this.user();
    if (!currentUser) return '';

    if (currentUser.firstName && currentUser.lastName) {
      return `${currentUser.firstName} ${currentUser.lastName}`;
    }

    return currentUser.name || '';
  }

  // User'ın baş harflerini al (avatar için)
  getUserInitials(): string {
    const currentUser = this.user();
    if (!currentUser) return '';

    if (currentUser.firstName && currentUser.lastName) {
      return `${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(
        0
      )}`.toUpperCase();
    }

    if (currentUser.name) {
      const nameParts = currentUser.name.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0].charAt(0)}${nameParts[1].charAt(
          0
        )}`.toUpperCase();
      }
      return currentUser.name.charAt(0).toUpperCase();
    }

    return '';
  }
}
