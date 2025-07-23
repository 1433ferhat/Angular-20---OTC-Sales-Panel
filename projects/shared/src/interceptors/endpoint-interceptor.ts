import { HttpInterceptorFn } from '@angular/common/http';
import { inject} from '@angular/core';
import { Router} from '@angular/router';
import { catchError, throwError } from 'rxjs';
export const endpointInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('api/')) return next(req);
  
  const token = localStorage.getItem('token');
  const clone = req.clone({
    url: req.url.replace('api/', 'http://localhost:60805/api/'),
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
  const router = inject(Router);
  return next(clone).pipe(
    catchError((err) => {
      if (err.status === 401) {
        // Oturum süresi dolduysa login'e yönlendir
        localStorage.removeItem('token');
        router.navigate(['/giris']);
      } else if (err.status >= 500) {
        console.error('Sunucu hatası:', err);
      } else {
        console.warn('İstek hatası:', err);
      }

      return throwError(() => err);
    })
  );
};
