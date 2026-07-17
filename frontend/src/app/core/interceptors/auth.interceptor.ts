import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const auth = inject(AuthService);
  const token = auth.token();

  if (token) {
    const authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    return next(authReq);
  }
  return next(req);
};
