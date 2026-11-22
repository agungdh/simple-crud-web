import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthService } from './auth.service';
import { mockBackendInterceptor } from '../mock/mock-backend.interceptor';
import { authInterceptor } from '../interceptors/auth.interceptor';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(withInterceptors([authInterceptor, mockBackendInterceptor])),
      ],
    });
    service = TestBed.inject(AuthService);
    service.clearSession();
  });

  it('should successfully log in with valid credentials', async () => {
    const res = await new Promise((resolve, reject) => {
      service.login({ username: '199701012022031001', password: 'password123' }).subscribe({
        next: resolve,
        error: reject,
      });
    });

    expect(res).toBeDefined();
    expect(service.token()).toBeTruthy();
  });

  it('should fail login with invalid credentials', async () => {
    let errorOccurred = false;
    try {
      await new Promise((resolve, reject) => {
        service.login({ username: 'invalid', password: 'wrongpassword' }).subscribe({
          next: resolve,
          error: reject,
        });
      });
    } catch {
      errorOccurred = true;
    }

    expect(errorOccurred).toBe(true);
    expect(service.token()).toBeNull();
  });

  it('should clear session on logout', () => {
    service.setToken('sample-token');
    expect(service.token()).toBe('sample-token');
    service.clearSession();
    expect(service.token()).toBeNull();
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });
});
