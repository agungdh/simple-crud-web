import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { PangkatGolonganService } from './pangkat-golongan.service';
import { AuthService } from './auth.service';
import { authInterceptor } from '../interceptors/auth.interceptor';
import { mockBackendInterceptor } from '../mock/mock-backend.interceptor';

describe('PangkatGolonganService', () => {
  let service: PangkatGolonganService;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PangkatGolonganService,
        AuthService,
        provideHttpClient(withInterceptors([authInterceptor, mockBackendInterceptor])),
      ],
    });
    service = TestBed.inject(PangkatGolonganService);
    authService = TestBed.inject(AuthService);
    authService.setToken('simon-token-admin-test');
  });

  it('should list pangkat golongan items', async () => {
    const list = await new Promise<any[]>((resolve, reject) => {
      service.list().subscribe({ next: resolve, error: reject });
    });
    expect(list.length).toBeGreaterThan(0);
    expect(list[0].pangkat).toBeDefined();
    expect(list[0].golongan).toBeDefined();
  });

  it('should create and delete a pangkat golongan record', async () => {
    const created = await new Promise<any>((resolve, reject) => {
      service
        .create({
          jenjang: 'Pratama',
          pangkat: 'Pengatur Muda',
          golongan: 'II',
          ruang: 'a',
        })
        .subscribe({ next: resolve, error: reject });
    });

    expect(created.uuid).toBeDefined();
    expect(created.jenjang).toBe('Pratama');

    await new Promise<void>((resolve, reject) => {
      service.delete(created.uuid).subscribe({ next: resolve, error: reject });
    });
  });
});
