import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If already authenticated and current user is loaded
  if (authService.isAuthenticated()) {
    return true;
  }

  // If token exists but user not loaded yet (e.g. page refresh)
  const token = authService.token();
  if (token) {
    return authService.fetchCurrentUser().pipe(
      map(() => true),
      catchError(() => {
        router.navigate(['/login']);
        return of(false);
      }),
    );
  }

  router.navigate(['/login']);
  return false;
};
