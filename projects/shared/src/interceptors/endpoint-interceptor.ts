import { HttpInterceptorFn } from '@angular/common/http';
export const endpointInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('api/')) return next(req);
  
  const token = localStorage.getItem('token');
  const clone = req.clone({
    url: req.url.replace('api/', 'http://localhost:60805/api/'),
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
  return next(clone);
};
