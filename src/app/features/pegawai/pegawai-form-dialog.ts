import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BidangResponse } from '../../core/models/bidang.model';
import { PangkatGolonganResponse } from '../../core/models/pangkat-golongan.model';
import {
  CreatePegawaiRequest,
  KategoriJabatan,
  KategoriKebutuhanJamPelatihan,
  PegawaiResponse,
  PegawaiStatus,
  PegawaiTipe,
  UpdatePegawaiRequest,
} from '../../core/models/pegawai.model';

export interface PegawaiFormDialogData {
  readonly isEdit: boolean;
  readonly initialData?: PegawaiResponse;
  readonly bidangList: BidangResponse[];
  readonly pangkatList: PangkatGolonganResponse[];
}

@Component({
  selector: 'app-pegawai-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.isEdit ? 'Ubah Data Pegawai' : 'Tambah Pegawai Baru' }}
    </h2>
    <mat-dialog-content class="dialog-content">
      <form [formGroup]="form" class="pegawai-form" (ngSubmit)="save()">
        <!-- Section: Akun Pengguna -->
        <div class="form-section">
          <h3 class="section-title">
            <mat-icon aria-hidden="true">account_circle</mat-icon>
            <span>Informasi Akun Pengguna</span>
          </h3>
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
              <mat-label>{{ data.isEdit ? 'Password Baru (Opsional)' : 'Password' }}</mat-label>
              <input
                matInput
                [type]="hidePassword() ? 'password' : 'text'"
                formControlName="password"
                placeholder="{{ data.isEdit ? 'Kosongkan bila tidak diubah' : 'Minimal 8 karakter' }}"
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

        <!-- Section: Identitas Pegawai -->
        <div class="form-section">
          <h3 class="section-title">
            <mat-icon aria-hidden="true">badge</mat-icon>
            <span>Identitas Pegawai</span>
          </h3>
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
                <mat-error>Nama wajib diisi</mat-error>
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

        <!-- Section: Penempatan & Jabatan -->
        <div class="form-section">
          <h3 class="section-title">
            <mat-icon aria-hidden="true">corporate_fare</mat-icon>
            <span>Penempatan & Kepangkatan</span>
          </h3>
          <div class="form-grid">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Bidang / Unit Kerja</mat-label>
              <mat-select formControlName="bidangUuid" required>
                @for (b of data.bidangList; track b.uuid) {
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
                @for (p of data.pangkatList; track p.uuid) {
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
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="cancel()">Batal</button>
      <button
        mat-flat-button
        color="primary"
        type="button"
        [disabled]="form.invalid"
        (click)="save()"
      >
        {{ data.isEdit ? 'Simpan Perubahan' : 'Tambah Pegawai' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .dialog-content {
      max-height: 80vh;
      overflow-y: auto;
      padding-top: 8px;
    }
    .pegawai-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
      min-width: 520px;
    }
    .form-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #fdfdfd;
      border: 1px solid #f0f0f0;
      border-radius: 8px;
      padding: 14px;
    }
    .section-title {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 600;
      color: #1a73e8;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    .w-full {
      width: 100%;
    }
    mat-dialog-actions {
      gap: 8px;
    }
    @media (max-width: 600px) {
      .pegawai-form {
        min-width: 100%;
      }
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class PegawaiFormDialog {
  private readonly fb = inject(FormBuilder);
  protected readonly dialogRef = inject(MatDialogRef<PegawaiFormDialog>);
  protected readonly data = inject<PegawaiFormDialogData>(MAT_DIALOG_DATA);

  protected readonly hidePassword = signal(true);

  protected readonly form = this.fb.nonNullable.group({
    username: [this.data.initialData?.user.username ?? '', [Validators.required]],
    password: [
      '',
      this.data.isEdit ? [Validators.minLength(8)] : [Validators.required, Validators.minLength(8)],
    ],
    bidangUuid: [this.data.initialData?.bidangUuid ?? (this.data.bidangList[0]?.uuid ?? ''), [Validators.required]],
    pangkatGolonganUuid: [this.data.initialData?.pangkatGolonganUuid ?? null as string | null],
    tipe: [this.data.initialData?.tipe ?? ('pegawai' as PegawaiTipe), [Validators.required]],
    status: [this.data.initialData?.status ?? ('aktif' as PegawaiStatus), [Validators.required]],
    nip: [this.data.initialData?.nip ?? '', [Validators.required]],
    nama: [this.data.initialData?.nama ?? '', [Validators.required]],
    jabatan: [this.data.initialData?.jabatan ?? ''],
    kategoriJabatan: [this.data.initialData?.kategoriJabatan ?? null as KategoriJabatan | null],
    peran: [this.data.initialData?.peran ?? ''],
    kategoriKebutuhanJamPelatihan: [
      this.data.initialData?.kategoriKebutuhanJamPelatihan ?? null as KategoriKebutuhanJamPelatihan | null,
    ],
  });

  protected cancel(): void {
    this.dialogRef.close(null);
  }

  protected save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();

    if (this.data.isEdit) {
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
      this.dialogRef.close(updateReq);
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
      this.dialogRef.close(createReq);
    }
  }
}
