import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { mockBackendInterceptor } from './mock-backend.interceptor';
import { authInterceptor } from '../interceptors/auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('mockBackendInterceptor', () => {
  let http: HttpClient;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(withInterceptors([authInterceptor, mockBackendInterceptor])),
      ],
    });
    http = TestBed.inject(HttpClient);
    authService = TestBed.inject(AuthService);
    authService.clearSession();
  });

  it('should return 401 when accessing protected /api/bidang without token', async () => {
    let status = 0;
    try {
      await new Promise((resolve, reject) => {
        http.get('/api/bidang').subscribe({ next: resolve, error: reject });
      });
    } catch (err: any) {
      status = err.status;
    }
    expect(status).toBe(401);
  });

  it('should return 422 when creating bidang with empty body', async () => {
    authService.setToken('simon-token-test');
    let status = 0;
    let errorBody: any;
    try {
      await new Promise((resolve, reject) => {
        http.post('/api/bidang', { bidang: '' }).subscribe({ next: resolve, error: reject });
      });
    } catch (err: any) {
      status = err.status;
      errorBody = err.error;
    }
    expect(status).toBe(422);
    expect(errorBody.errors).toBeDefined();
    expect(errorBody.errors.some((e: any) => e.field === 'bidang')).toBe(true);
  });

  it('should return 404 when querying non-existent bidang UUID', async () => {
    authService.setToken('simon-token-test');
    let status = 0;
    try {
      await new Promise((resolve, reject) => {
        http.get('/api/bidang/non-existent-uuid-12345').subscribe({ next: resolve, error: reject });
      });
    } catch (err: any) {
      status = err.status;
    }
    expect(status).toBe(404);
  });

  it('should return 422 when creating pegawai with password less than 8 characters', async () => {
    authService.setToken('simon-token-test');
    let status = 0;
    let errorBody: any;
    try {
      await new Promise((resolve, reject) => {
        http.post('/api/pegawai', {
          username: 'tester',
          password: '123', // less than 8 chars
          bidangUuid: 'test',
          tipe: 'pegawai',
          status: 'aktif',
          nip: '123',
          nama: 'Tester',
        }).subscribe({ next: resolve, error: reject });
      });
    } catch (err: any) {
      status = err.status;
      errorBody = err.error;
    }
    expect(status).toBe(422);
    expect(errorBody.errors.some((e: any) => e.field === 'password')).toBe(true);
  });
});
