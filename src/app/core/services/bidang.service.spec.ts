import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { BidangService } from './bidang.service';
import { AuthService } from './auth.service';
import { authInterceptor } from '../interceptors/auth.interceptor';
import { mockBackendInterceptor } from '../mock/mock-backend.interceptor';

describe('BidangService', () => {
  let service: BidangService;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BidangService,
        AuthService,
        provideHttpClient(withInterceptors([authInterceptor, mockBackendInterceptor])),
      ],
    });
    service = TestBed.inject(BidangService);
    authService = TestBed.inject(AuthService);
    authService.setToken('simon-token-admin-test');
  });

  it('should list bidang items', async () => {
    const items = await new Promise<any[]>((resolve, reject) => {
      service.list().subscribe({ next: resolve, error: reject });
    });
    expect(items.length).toBeGreaterThan(0);
    expect(items[0].bidang).toBeDefined();
  });

  it('should create, update, and delete a bidang', async () => {
    // 1. Create
    const created = await new Promise<any>((resolve, reject) => {
      service.create({ bidang: 'Bidang Uji Coba' }).subscribe({ next: resolve, error: reject });
    });
    expect(created.uuid).toBeDefined();
    expect(created.bidang).toBe('Bidang Uji Coba');

    // 2. Update
    const updated = await new Promise<any>((resolve, reject) => {
      service.update(created.uuid, { bidang: 'Bidang Uji Coba Updated' }).subscribe({
        next: resolve,
        error: reject,
      });
    });
    expect(updated.bidang).toBe('Bidang Uji Coba Updated');

    // 3. Delete
    await new Promise<void>((resolve, reject) => {
      service.delete(created.uuid).subscribe({ next: resolve, error: reject });
    });

    // 4. Verify Not Found
    let notFound = false;
    try {
      await new Promise((resolve, reject) => {
        service.getById(created.uuid).subscribe({ next: resolve, error: reject });
      });
    } catch {
      notFound = true;
    }
    expect(notFound).toBe(true);
  });
});
