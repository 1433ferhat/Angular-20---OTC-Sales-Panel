import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Common } from '../services/common';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const common = inject(Common);
  const router = inject(Router);
  
  // Token ve authentication kontrolü
  if (!authService.isAuthenticated()) {
    router.navigateByUrl("/login");
    return false;
  }
  
  // User bilgisi signal'da yoksa token'dan yükle
  if (!common.getCurrentUser()) {
    const userInfo = authService.parseUserFromToken();
    if (userInfo) {
      common.setUser(userInfo);
    } else {
      // Token var ama geçersiz, logout yap
      authService.logout();
      return false;
    }
  }

  // Route seviyesinde rol kontrolü (opsiyonel)
  const requiredRoles = route.data?.['roles'] as string[];
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = common.hasAnyRole(requiredRoles);
    if (!hasRequiredRole) {
      // Yetki yoksa dashboard'a yönlendir
      router.navigateByUrl("/dashboard");
      return false;
    }
  }

  return true;
};

// Admin sayfaları için özel guard
export const adminGuard: CanActivateFn = (route, state) => {
  const common = inject(Common);
  const router = inject(Router);
  
  // Önce authentication kontrolü
  const authResult = authGuard(route, state);
  if (!authResult) return false;

  // Admin kontrolü
  if (!common.isAdmin()) {
    router.navigateByUrl("/dashboard");
    return false;
  }

  return true;
};

// Belirli roller için guard factory
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const common = inject(Common);
    const router = inject(Router);
    
    // Önce authentication kontrolü
    const authResult = authGuard(route, state);
    if (!authResult) return false;

    // Rol kontrolü
    const hasRole = common.hasAnyRole(allowedRoles);
    if (!hasRole) {
      router.navigateByUrl("/dashboard");
      return false;
    }

    return true;
  };
};

// Yetki kontrolü guard (belirli sayfalar için)
export const permissionGuard = (requiredPermissions: string[]): CanActivateFn => {
  return (route, state) => {
    const common = inject(Common);
    const router = inject(Router);
    
    // Önce authentication kontrolü
    const authResult = authGuard(route, state);
    if (!authResult) return false;

    // Permission kontrolü (role ile aynı mantık)
    const hasPermission = common.hasAnyRole(requiredPermissions);
    if (!hasPermission) {
      // Yetki yoksa 403 sayfasına veya dashboard'a yönlendir
      router.navigateByUrl("/dashboard");
      return false;
    }

    return true;
  };
};