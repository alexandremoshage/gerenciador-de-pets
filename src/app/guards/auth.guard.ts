import { CanActivateFn, CanMatchFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

const authCheck = (auth: AuthService, router: Router): boolean | Observable<boolean> | ReturnType<Router['createUrlTree']> => {
  const token = auth.getAccessToken();
  if (token) return true;

  const refresh = auth.getRefreshToken();
  if (!refresh) {
    return router.createUrlTree(['/login']);
  }

  return auth.refreshToken().pipe(
    map(() => true),
    catchError(() => {
      router.navigate(['/login']);
      return of(false);
    })
  );
};

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return authCheck(auth, router);
};

export const authMatchGuard: CanMatchFn = (route, segments) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return authCheck(auth, router);
};
