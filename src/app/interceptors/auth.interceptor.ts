import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const accessToken = authService.getAccessToken();

  const addTokenHeader = (request: any, token: string) => {
    return request.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  };

  if (req.url.includes('/autenticacao/login') || req.url.includes('/autenticacao/refresh')) {
    return next(req);
  }

  let authReq = req;
  if (accessToken) {
    authReq = addTokenHeader(req, accessToken);
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const refreshToken = authService.getRefreshToken();
        if (refreshToken) {
          return authService.refreshToken().pipe(
            switchMap((newTokens) => next(addTokenHeader(req, newTokens.access_token))),
            catchError((refreshError) => {
              authService.logout();
              return throwError(() => refreshError);
            })
          );
        }
      }

      return throwError(() => error);
    })
  );
};