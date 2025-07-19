import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Common } from '../services/common';

export const authGuard: CanActivateFn = (route, state) => {
  const common = inject(Common);
  const router = inject(Router);
  
  // Token kontrolü
  const token = localStorage.getItem("token");
  if (!token) {
    router.navigateByUrl("/login");
    return false;
  }

  // Token geçerlilik kontrolü
  if (!common.isAuthenticated()) {
    router.navigateByUrl("/login");
    return false;
  }
  
  // User bilgisi signal'da yoksa token'dan yükle
  if (!common.getCurrentUser()) {
    const userInfo = common.getUserFromToken();
    if (userInfo) {
      common.setUser(userInfo);
    } else {
      // Token var ama geçersiz
      router.navigateByUrl("/login");
      return false;
    }
  }

  // Route seviyesinde rol kontrolü (opsiyonel)
  const requiredRoles = route.data?.['roles'] as string[];
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => common.hasRole(role));
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
    const hasRole = allowedRoles.some(role => common.hasRole(role));
    if (!hasRole) {
      router.navigateByUrl("/dashboard");
      return false;
    }

    return true;
  };
};