import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { PegawaiService } from './pegawai.service';
import { AuthService } from './auth.service';
import { authInterceptor } from '../interceptors/auth.interceptor';
import { mockBackendInterceptor } from '../mock/mock-backend.interceptor';

describe('PegawaiService', () => {
  let service: PegawaiService;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PegawaiService,
        AuthService,
        provideHttpClient(withInterceptors([authInterceptor, mockBackendInterceptor])),
      ],
    });
    service = TestBed.inject(PegawaiService);
    authService = TestBed.inject(AuthService);
    authService.setToken('simon-token-admin-test');
  });

  it('should list all pegawai records', async () => {
    const list = await new Promise<any[]>((resolve, reject) => {
      service.list().subscribe({ next: resolve, error: reject });
    });
    expect(list.length).toBeGreaterThan(0);
    expect(list[0].nip).toBeDefined();
    expect(list[0].user).toBeDefined();
    expect(list[0].bidang).toBeDefined();
  });

  it('should create, update, and delete a pegawai', async () => {
    const testNip = '199912312025011099';
    const created = await new Promise<any>((resolve, reject) => {
      service
        .create({
          username: testNip,
          password: 'password123',
          bidangUuid: '019352a1-7b40-7000-8000-000000000010',
          pangkatGolonganUuid: null,
          tipe: 'pegawai',
          status: 'aktif',
          nip: testNip,
          nama: 'Budi Santoso',
          jabatan: 'Auditor Pertama',
          kategoriJabatan: 'fungsional auditor',
          peran: 'Anggota',
          kategoriKebutuhanJamPelatihan: 'auditor',
        })
        .subscribe({ next: resolve, error: reject });
    });

    expect(created.uuid).toBeDefined();
    expect(created.nama).toBe('Budi Santoso');
    expect(created.user.username).toBe(testNip);

    // Update without password change
    const updated = await new Promise<any>((resolve, reject) => {
      service
        .update(created.uuid, {
          username: testNip,
          password: null,
          bidangUuid: '019352a1-7b40-7000-8000-000000000010',
          pangkatGolonganUuid: null,
          tipe: 'pegawai',
          status: 'non aktif',
          nip: testNip,
          nama: 'Budi Santoso, S.T.',
          jabatan: 'Auditor Pertama',
          kategoriJabatan: 'fungsional auditor',
          peran: 'Anggota',
          kategoriKebutuhanJamPelatihan: 'auditor',
        })
        .subscribe({ next: resolve, error: reject });
    });

    expect(updated.nama).toBe('Budi Santoso, S.T.');
    expect(updated.status).toBe('non aktif');

    // Delete
    await new Promise<void>((resolve, reject) => {
      service.delete(created.uuid).subscribe({ next: resolve, error: reject });
    });
  });
});
