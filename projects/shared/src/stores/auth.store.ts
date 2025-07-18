// auth-store.service.ts
import { Injectable, signal, computed } from '@angular/core';

interface User {
  name: string;
  role: 'admin' | 'cashier' | 'user' | string;
}

@Injectable({ providedIn: 'root' })
export class AuthStore {
  // Giriş yapan kullanıcı bilgisi
  readonly currentUser = signal<User | null>(null);

  // Örnek: kullanıcı admin mi?
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  // Setter fonksiyonları
  setUser(user: User) {
    this.currentUser.set(user);
  }

  clearUser() {
    this.currentUser.set(null);
  }
}
