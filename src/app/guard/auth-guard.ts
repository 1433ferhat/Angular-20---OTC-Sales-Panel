import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Common } from '../services/common';
import { UserModel } from '@shared/models/user.model';

export const authGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem("token");
  const router = inject(Router);
  const common = inject(Common);
  
  if (!token) {
    router.navigateByUrl("/login");
    return false;
  }
  
  // JWT'den user bilgilerini al ve set et
  const userInfo = common.getUserFromToken();
  if (userInfo) {
    common.user.set(userInfo);
    return true;
  }
  
  router.navigateByUrl("/login");
  return false;
};