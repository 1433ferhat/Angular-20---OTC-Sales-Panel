import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class Common {
  private router = inject(Router);
  
  user = signal<any | null>(null);

  logout(): void {
    localStorage.removeItem('response');
    localStorage.removeItem('token');
    this.user.set(null);
    this.router.navigateByUrl('/login');
  }

  isAuthenticated(): boolean {
    const res = localStorage.getItem('response');
    if (!res) return false;
    
    try {
      const loginResponse = JSON.parse(res);
      return !!(loginResponse.accessToken && loginResponse.accessToken.token);
    } catch {
      return false;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): any | null {
    const res = localStorage.getItem('response');
    if (!res) return null;
    
    try {
      return JSON.parse(res);
    } catch {
      return null;
    }
  }

  // JWT Token'ı decode et
  decodeJWT(token: string): any {
    debugger;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('JWT decode error:', error);
      return null;
    }
  }

  // Token'dan kullanıcı bilgilerini al
  getUserFromToken(): any {
    const token = this.getToken();
    if (!token) return null;
    
    const decoded = this.decodeJWT(token);
    if (!decoded) return null;

    // JWT'de yaygın kullanılan field'lar
    return {
      id: decoded.sub || decoded.userId || decoded.id,
      name: decoded.name || decoded.given_name || decoded.username,
      email: decoded.email,
      role: decoded.role || decoded.roles,
      claims: decoded.claims || decoded.permissions,
      // JWT'deki diğer field'lar
      ...decoded
    };
  }

  // Kullanıcının belirli bir rolü var mı?
  hasRole(role: string): boolean {
    const user = this.getUserFromToken();
    if (!user) return false;

    // Role array olabilir veya string olabilir
    if (Array.isArray(user.role)) {
      return user.role.includes(role);
    }
    
    if (typeof user.role === 'string') {
      return user.role === role;
    }

    // Claims kontrolü (operationClaims gibi)
    if (user.claims && Array.isArray(user.claims)) {
      return user.claims.some((claim: any) => 
        claim.name === role || claim === role
      );
    }

    return false;
  }

  // Kullanıcının belirli bir yetkisi var mı?
  hasPermission(permission: string): boolean {
    return this.hasRole(permission);
  }

  // Admin mi?
  isAdmin(): boolean {
    return this.hasRole('admin') || this.hasRole('Admin');
  }
}