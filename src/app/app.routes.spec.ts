import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { Router, provideRouter, TitleStrategy } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { AppTitleStrategy, PageTitle } from './layout/page-title';
import { AuthService } from './core/services/auth.service';

describe('app routing', () => {
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        AuthService,
        { provide: TitleStrategy, useClass: AppTitleStrategy },
      ],
    });
    authService = TestBed.inject(AuthService);
  });

  it('should redirect unauthenticated users to /login', async () => {
    authService.clearSession();
    const harness = await RouterTestingHarness.create('/');

    expect(TestBed.inject(Router).url).toBe('/login');
    expect(TestBed.inject(PageTitle).text()).toBe('Login');
    expect(harness.fixture.nativeElement.querySelector('app-login')).toBeTruthy();
  });

  it('should allow access to dashboard when authenticated', async () => {
    authService.setToken('test-token');
    authService.currentUser.set({
      uuid: '019352a1-7b40-7000-8000-000000000030',
      userUuid: '019352a1-7b40-7000-8000-000000000001',
      bidangUuid: '019352a1-7b40-7000-8000-000000000010',
      pangkatGolonganUuid: null,
      tipe: 'admin',
      status: 'aktif',
      nip: '199701012022031001',
      nama: 'Agung Sapto Margono',
      jabatan: 'Auditor Ahli Pertama',
      kategoriJabatan: null,
      peran: null,
      kategoriKebutuhanJamPelatihan: null,
      user: { uuid: '019352a1-7b40-7000-8000-000000000001', username: '199701012022031001' },
      bidang: { uuid: '019352a1-7b40-7000-8000-000000000010', bidang: 'Inspektorat' },
      pangkatGolongan: null,
    });

    const harness = await RouterTestingHarness.create('/');
    expect(TestBed.inject(Router).url).toBe('/dashboard');
    expect(TestBed.inject(PageTitle).text()).toBe('Dashboard');
    expect(harness.fixture.nativeElement.querySelector('app-dashboard')).toBeTruthy();
  });

  it('should sync document title on navigation', async () => {
    authService.setToken('test-token');
    authService.currentUser.set({
      uuid: 'test',
      userUuid: 'test',
      bidangUuid: 'test',
      pangkatGolonganUuid: null,
      tipe: 'admin',
      status: 'aktif',
      nip: '123',
      nama: 'Tester',
      jabatan: null,
      kategoriJabatan: null,
      peran: null,
      kategoriKebutuhanJamPelatihan: null,
      user: { uuid: 'test', username: 'tester' },
      bidang: { uuid: 'test', bidang: 'Test' },
      pangkatGolongan: null,
    });

    const harness = await RouterTestingHarness.create('/bidang');
    expect(TestBed.inject(PageTitle).text()).toBe('Data Bidang');
    expect(TestBed.inject(Title).getTitle()).toBe('Data Bidang');

    await harness.navigateByUrl('/pangkat-golongan');
    expect(TestBed.inject(PageTitle).text()).toBe('Pangkat & Golongan');
    expect(TestBed.inject(Title).getTitle()).toBe('Pangkat & Golongan');
  });
});
