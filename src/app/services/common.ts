import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserModel } from '@shared/models/user.model';
import { OperationClaimsModel } from '@shared/models/operation-claims.model';

@Injectable({
  providedIn: 'root'
})
export class Common {
  private router = inject(Router);
  
  user = signal<UserModel | undefined>(undefined);

  // Login başarılı olduğunda çağır
  loginSuccess(token: string): void {
    localStorage.setItem('token', token);
    
    const userInfo = this.getUserFromToken();
    if (userInfo) {
      this.user.set(userInfo);
      console.log('🟢 User login başarılı:', userInfo);
    }
  }

  // Logout
  logout(): void {
    console.log('🔴 Logout yapılıyor...');
    localStorage.removeItem('token');
    localStorage.removeItem('response');
    this.user.set(undefined);
    console.log('🔴 Logout tamamlandı, login sayfasına yönlendiriliyor');
    this.router.navigateByUrl('/login');
  }

  // Token var mı kontrol et
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  // Token al
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // JWT decode et
  decodeJWT(token: string): any {
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
      console.error('JWT decode hatası:', error);
      return null;
    }
  }

  // Token'dan user bilgilerini al
  getUserFromToken(): UserModel | undefined {
    const token = this.getToken();
    if (!token) return undefined;
    
    const decoded = this.decodeJWT(token);
    if (!decoded) return undefined;

    // Role'leri OperationClaims'e çevir
    const operationClaims: OperationClaimsModel[] = [];
    const roles = decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || [];
    
    if (Array.isArray(roles)) {
      roles.forEach((roleName: string, index: number) => {
        operationClaims.push({
          id: `${index + 1}`,
          name: roleName
        });
      });
    }

    const user: UserModel = {
      id: decoded.id || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || '',
      name: decoded.name || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || '',
      firstName: decoded.firstName || '',
      lastName: decoded.lastName || '',
      email: decoded.email || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || '',
      operationClaims: operationClaims,
      status: 'active'
    };

    console.log('🟡 Token\'dan user bilgisi alındı:', user);
    return user;
  }

  // Role kontrolü
  hasRole(role: string): boolean {
    const currentUser = this.user();
    if (!currentUser) return false;
    
    return currentUser.operationClaims.some(claim => claim.name === role);
  }

  // Admin mi?
  isAdmin(): boolean {
    return this.hasRole('Admin') || this.hasRole('Auth.Admin');
  }

  // Mevcut user'ı al
  getCurrentUser(): UserModel | undefined {
    return this.user();
  }
}