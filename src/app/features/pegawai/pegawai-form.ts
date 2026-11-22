import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PegawaiService } from '../../core/services/pegawai.service';
import { BidangService } from '../../core/services/bidang.service';
import { PangkatGolonganService } from '../../core/services/pangkat-golongan.service';
import { BidangResponse } from '../../core/models/bidang.model';
import { PangkatGolonganResponse } from '../../core/models/pangkat-golongan.model';
import {
  CreatePegawaiRequest,
  KategoriJabatan,
  KategoriKebutuhanJamPelatihan,
  PegawaiStatus,
  PegawaiTipe,
  UpdatePegawaiRequest,
} from '../../core/models/pegawai.model';

@Component({
  selector: 'app-pegawai-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-left">
          <a mat-icon-button routerLink="/pegawai" aria-label="Kembali ke daftar pegawai" title="Kembali">
            <mat-icon aria-hidden="true">arrow_back</mat-icon>
          </a>
          <div>
            <h1 class="page-title">{{ isEdit() ? 'Ubah Data Pegawai' : 'Tambah Pegawai Baru' }}</h1>
            <p class="page-subtitle">
              {{ isEdit() ? 'Perbarui data pegawai dan akun login' : 'Daftarkan pegawai baru beserta akun user relasi 1-to-1' }}
            </p>
          </div>
        </div>
      </div>

      <mat-card appearance="outlined" class="form-card">
        @if (isLoading()) {
          <div class="loading-state">
            <mat-spinner diameter="36" />
            <span>Memuat data...</span>
          </div>
        } @else {
          <form [formGroup]="form" (ngSubmit)="save()" class="form-content">
            <!-- Akun Pengguna -->
            <div class="form-section">
              <h2 class="section-title">
                <mat-icon aria-hidden="true">account_circle</mat-icon>
                <span>Informasi Akun Pengguna</span>
              </h2>
              <div class="form-grid">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Username Akun</mat-label>
                  <input
                    matInput
                    formControlName="username"
                    placeholder="Contoh: 199701012022031001"
                    required
                    autocomplete="off"
                  />
                  @if (form.controls.username.hasError('required') && form.controls.username.touched) {
                    <mat-error>Username wajib diisi</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>{{ isEdit() ? 'Password Baru (Opsional)' : 'Password' }}</mat-label>
                  <input
                    matInput
                    [type]="hidePassword() ? 'password' : 'text'"
                    formControlName="password"
                    placeholder="{{ isEdit() ? 'Kosongkan bila tidak diubah' : 'Minimal 8 karakter' }}"
                    autocomplete="new-password"
                  />
                  <button
                    mat-icon-button
                    matSuffix
                    type="button"
                    (click)="hidePassword.set(!hidePassword())"
                    [attr.aria-label]="hidePassword() ? 'Tampilkan password' : 'Sembunyikan password'"
                  >
                    <mat-icon aria-hidden="true">{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                  @if (form.controls.password.hasError('required') && form.controls.password.touched) {
                    <mat-error>Password wajib diisi</mat-error>
                  }
                  @if (form.controls.password.hasError('minlength')) {
                    <mat-error>Password minimal 8 karakter</mat-error>
                  }
                </mat-form-field>
              </div>
            </div>

            <!-- Identitas Pegawai -->
            <div class="form-section">
              <h2 class="section-title">
                <mat-icon aria-hidden="true">badge</mat-icon>
                <span>Identitas Pegawai</span>
              </h2>
              <div class="form-grid">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>NIP</mat-label>
                  <input
                    matInput
                    formControlName="nip"
                    placeholder="Contoh: 199701012022031001"
                    required
                  />
                  @if (form.controls.nip.hasError('required') && form.controls.nip.touched) {
                    <mat-error>NIP wajib diisi</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Nama Lengkap</mat-label>
                  <input
                    matInput
                    formControlName="nama"
                    placeholder="Contoh: Agung Sapto Margono, S.Kom."
                    required
                  />
                  @if (form.controls.nama.hasError('required') && form.controls.nama.touched) {
                    <mat-error>Nama lengkap wajib diisi</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Tipe Akun</mat-label>
                  <mat-select formControlName="tipe" required>
                    <mat-option value="pegawai">Pegawai</mat-option>
                    <mat-option value="admin">Administrator</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Status Keaktifan</mat-label>
                  <mat-select formControlName="status" required>
                    <mat-option value="aktif">Aktif</mat-option>
                    <mat-option value="non aktif">Non Aktif</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </div>

            <!-- Penempatan & Kepangkatan -->
            <div class="form-section">
              <h2 class="section-title">
                <mat-icon aria-hidden="true">corporate_fare</mat-icon>
                <span>Penempatan & Kepangkatan</span>
              </h2>
              <div class="form-grid">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Bidang / Unit Kerja</mat-label>
                  <mat-select formControlName="bidangUuid" required>
                    @for (b of bidangList(); track b.uuid) {
                      <mat-option [value]="b.uuid">{{ b.bidang }}</mat-option>
                    }
                  </mat-select>
                  @if (form.controls.bidangUuid.hasError('required') && form.controls.bidangUuid.touched) {
                    <mat-error>Bidang wajib dipilih</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Pangkat / Golongan</mat-label>
                  <mat-select formControlName="pangkatGolonganUuid">
                    <mat-option [value]="null">-- Tidak Ada --</mat-option>
                    @for (p of pangkatList(); track p.uuid) {
                      <mat-option [value]="p.uuid">
                        {{ p.pangkat }} ({{ p.golongan }}/{{ p.ruang }})
                      </mat-option>
                    }
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Jabatan</mat-label>
                  <input
                    matInput
                    formControlName="jabatan"
                    placeholder="Contoh: Auditor Ahli Pertama"
                  />
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Kategori Jabatan</mat-label>
                  <mat-select formControlName="kategoriJabatan">
                    <mat-option [value]="null">-- Tidak Ada --</mat-option>
                    <mat-option value="struktural">Struktural</mat-option>
                    <mat-option value="fungsional auditor">Fungsional Auditor</mat-option>
                    <mat-option value="fungsional tertentu">Fungsional Tertentu</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Peran dalam Tim</mat-label>
                  <input
                    matInput
                    formControlName="peran"
                    placeholder="Contoh: Ketua Tim / Anggota Tim"
                  />
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Kebutuhan Jam Pelatihan</mat-label>
                  <mat-select formControlName="kategoriKebutuhanJamPelatihan">
                    <mat-option [value]="null">-- Tidak Ada --</mat-option>
                    <mat-option value="auditor">Auditor</mat-option>
                    <mat-option value="pejabat">Pejabat</mat-option>
                    <mat-option value="admin">Admin</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </div>

            <div class="form-actions">
              <a mat-button routerLink="/pegawai">Batal</a>
              <button
                mat-flat-button
                color="primary"
                type="submit"
                [disabled]="form.invalid || isSaving()"
              >
                @if (isSaving()) {
                  <mat-spinner diameter="18" class="spinner-inline" />
                  <span>Menyimpan...</span>
                } @else {
                  <span>{{ isEdit() ? 'Simpan Perubahan' : 'Tambah Pegawai' }}</span>
                }
              </button>
            </div>
          </form>
        }
      </mat-card>
    </div>
  `,
  styles: `
    .page-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 860px;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .page-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
    }
    .page-subtitle {
      margin: 2px 0 0 0;
      color: #5f6368;
      font-size: 0.875rem;
    }
    .form-card {
      border-radius: 12px;
      padding: 24px;
      background-color: #ffffff;
    }
    .form-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .form-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: #fafbfc;
      border: 1px solid #eef1f4;
      border-radius: 10px;
      padding: 18px;
    }
    .section-title {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: #1a73e8;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
    }
    .w-full {
      width: 100%;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 8px;
    }
    .spinner-inline {
      display: inline-block;
      margin-right: 6px;
    }
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      gap: 12px;
      color: #5f6368;
    }
    @media (max-width: 680px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class PegawaiForm implements OnInit {
  readonly uuid = input<string | undefined>();

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly pegawaiService = inject(PegawaiService);
  private readonly bidangService = inject(BidangService);
  private readonly pangkatService = inject(PangkatGolonganService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly isEdit = signal<boolean>(false);
  protected readonly isLoading = signal<boolean>(true);
  protected readonly isSaving = signal<boolean>(false);
  protected readonly hidePassword = signal<boolean>(true);

  protected readonly bidangList = signal<BidangResponse[]>([]);
  protected readonly pangkatList = signal<PangkatGolonganResponse[]>([]);

  protected readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    bidangUuid: ['', [Validators.required]],
    pangkatGolonganUuid: [null as string | null],
    tipe: ['pegawai' as PegawaiTipe, [Validators.required]],
    status: ['aktif' as PegawaiStatus, [Validators.required]],
    nip: ['', [Validators.required]],
    nama: ['', [Validators.required]],
    jabatan: [''],
    kategoriJabatan: [null as KategoriJabatan | null],
    peran: [''],
    kategoriKebutuhanJamPelatihan: [null as KategoriKebutuhanJamPelatihan | null],
  });

  ngOnInit(): void {
    const currentUuid = this.uuid();
    if (currentUuid) {
      this.isEdit.set(true);
      // In edit mode, password is optional
      this.form.controls.password.clearValidators();
      this.form.controls.password.addValidators([Validators.minLength(8)]);
      this.form.controls.password.updateValueAndValidity();
    }

    this.loadDependenciesAndItem(currentUuid);
  }

  private loadDependenciesAndItem(id?: string): void {
    forkJoin({
      bidang: this.bidangService.list(),
      pangkat: this.pangkatService.list(),
      ...(id ? { pegawai: this.pegawaiService.getById(id) } : {}),
    }).subscribe({
      next: (res) => {
        this.bidangList.set(res.bidang);
        this.pangkatList.set(res.pangkat);

        if (!id && res.bidang.length > 0) {
          this.form.patchValue({ bidangUuid: res.bidang[0].uuid });
        }

        if ('pegawai' in res && res.pegawai) {
          const p = res.pegawai;
          this.form.patchValue({
            username: p.user.username,
            bidangUuid: p.bidangUuid,
            pangkatGolonganUuid: p.pangkatGolonganUuid,
            tipe: p.tipe,
            status: p.status,
            nip: p.nip,
            nama: p.nama,
            jabatan: p.jabatan || '',
            kategoriJabatan: p.kategoriJabatan,
            peran: p.peran || '',
            kategoriKebutuhanJamPelatihan: p.kategoriKebutuhanJamPelatihan,
          });
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Gagal memuat data formulir', 'Tutup', { duration: 3000 });
        this.router.navigate(['/pegawai']);
      },
    });
  }

  protected save(): void {
    if (this.form.invalid || this.isSaving()) return;

    this.isSaving.set(true);
    const v = this.form.getRawValue();
    const currentUuid = this.uuid();

    if (this.isEdit() && currentUuid) {
      const updateReq: UpdatePegawaiRequest = {
        username: v.username.trim(),
        password: v.password ? v.password : null,
        bidangUuid: v.bidangUuid,
        pangkatGolonganUuid: v.pangkatGolonganUuid || null,
        tipe: v.tipe,
        status: v.status,
        nip: v.nip.trim(),
        nama: v.nama.trim(),
        jabatan: v.jabatan ? v.jabatan.trim() : null,
        kategoriJabatan: v.kategoriJabatan,
        peran: v.peran ? v.peran.trim() : null,
        kategoriKebutuhanJamPelatihan: v.kategoriKebutuhanJamPelatihan,
      };

      this.pegawaiService.update(currentUuid, updateReq).subscribe({
        next: () => {
          this.snackBar.open('Data pegawai berhasil diperbarui', 'Tutup', { duration: 3000 });
          this.router.navigate(['/pegawai']);
        },
        error: (err: { error?: { message?: string } }) => {
          this.isSaving.set(false);
          this.snackBar.open(err.error?.message || 'Gagal memperbarui data pegawai', 'Tutup', { duration: 3000 });
        },
      });
    } else {
      const createReq: CreatePegawaiRequest = {
        username: v.username.trim(),
        password: v.password,
        bidangUuid: v.bidangUuid,
        pangkatGolonganUuid: v.pangkatGolonganUuid || null,
        tipe: v.tipe,
        status: v.status,
        nip: v.nip.trim(),
        nama: v.nama.trim(),
        jabatan: v.jabatan ? v.jabatan.trim() : null,
        kategoriJabatan: v.kategoriJabatan,
        peran: v.peran ? v.peran.trim() : null,
        kategoriKebutuhanJamPelatihan: v.kategoriKebutuhanJamPelatihan,
      };

      this.pegawaiService.create(createReq).subscribe({
        next: () => {
          this.snackBar.open('Pegawai dan akun berhasil ditambahkan', 'Tutup', { duration: 3000 });
          this.router.navigate(['/pegawai']);
        },
        error: (err: { error?: { message?: string } }) => {
          this.isSaving.set(false);
          this.snackBar.open(err.error?.message || 'Gagal menambahkan pegawai', 'Tutup', { duration: 3000 });
        },
      });
    }
  }
}
