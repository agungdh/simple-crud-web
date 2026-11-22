import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PangkatGolonganService } from '../../core/services/pangkat-golongan.service';
import { PangkatGolonganRequest } from '../../core/models/pangkat-golongan.model';

@Component({
  selector: 'app-pangkat-golongan-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-left">
          <a
            mat-icon-button
            routerLink="/pangkat-golongan"
            aria-label="Kembali ke daftar pangkat & golongan"
            title="Kembali"
          >
            <mat-icon aria-hidden="true">arrow_back</mat-icon>
          </a>
          <div>
            <h1 class="page-title">{{ isEdit() ? 'Ubah Pangkat & Golongan' : 'Tambah Pangkat & Golongan' }}</h1>
            <p class="page-subtitle">
              {{ isEdit() ? 'Perbarui informasi kepangkatan dan golongan' : 'Daftarkan klasifikasi jenjang, pangkat, golongan, dan ruang' }}
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
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Jenjang</mat-label>
              <input
                matInput
                formControlName="jenjang"
                placeholder="Contoh: Penata"
                required
                maxlength="255"
              />
              @if (form.controls.jenjang.hasError('required') && form.controls.jenjang.touched) {
                <mat-error>Jenjang wajib diisi</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Nama Pangkat</mat-label>
              <input
                matInput
                formControlName="pangkat"
                placeholder="Contoh: Penata Muda Tingkat I"
                required
                maxlength="255"
              />
              @if (form.controls.pangkat.hasError('required') && form.controls.pangkat.touched) {
                <mat-error>Pangkat wajib diisi</mat-error>
              }
            </mat-form-field>

            <div class="form-row">
              <mat-form-field appearance="outline" class="w-half">
                <mat-label>Golongan</mat-label>
                <input
                  matInput
                  formControlName="golongan"
                  placeholder="Contoh: III"
                  required
                  maxlength="255"
                />
                @if (form.controls.golongan.hasError('required') && form.controls.golongan.touched) {
                  <mat-error>Golongan wajib diisi</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-half">
                <mat-label>Ruang</mat-label>
                <input
                  matInput
                  formControlName="ruang"
                  placeholder="Contoh: b"
                  required
                  maxlength="255"
                />
                @if (form.controls.ruang.hasError('required') && form.controls.ruang.touched) {
                  <mat-error>Ruang wajib diisi</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="form-actions">
              <a mat-button routerLink="/pangkat-golongan">Batal</a>
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
                  <span>{{ isEdit() ? 'Simpan Perubahan' : 'Tambah Pangkat & Golongan' }}</span>
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
      max-width: 720px;
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
      gap: 14px;
    }
    .w-full {
      width: 100%;
    }
    .form-row {
      display: flex;
      gap: 16px;
    }
    .w-half {
      flex: 1;
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
  `,
})
export class PangkatGolonganForm implements OnInit {
  readonly uuid = input<string | undefined>();

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly pangkatService = inject(PangkatGolonganService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly isEdit = signal<boolean>(false);
  protected readonly isLoading = signal<boolean>(false);
  protected readonly isSaving = signal<boolean>(false);

  protected readonly form = this.fb.nonNullable.group({
    jenjang: ['', [Validators.required, Validators.maxLength(255)]],
    pangkat: ['', [Validators.required, Validators.maxLength(255)]],
    golongan: ['', [Validators.required, Validators.maxLength(255)]],
    ruang: ['', [Validators.required, Validators.maxLength(255)]],
  });

  ngOnInit(): void {
    const currentUuid = this.uuid();
    if (currentUuid) {
      this.isEdit.set(true);
      this.loadItem(currentUuid);
    }
  }

  private loadItem(id: string): void {
    this.isLoading.set(true);
    this.pangkatService.getById(id).subscribe({
      next: (item) => {
        this.form.patchValue({
          jenjang: item.jenjang,
          pangkat: item.pangkat,
          golongan: item.golongan,
          ruang: item.ruang,
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Gagal memuat data pangkat & golongan', 'Tutup', { duration: 3000 });
        this.router.navigate(['/pangkat-golongan']);
      },
    });
  }

  protected save(): void {
    if (this.form.invalid || this.isSaving()) return;

    this.isSaving.set(true);
    const v = this.form.getRawValue();
    const req: PangkatGolonganRequest = {
      jenjang: v.jenjang.trim(),
      pangkat: v.pangkat.trim(),
      golongan: v.golongan.trim(),
      ruang: v.ruang.trim(),
    };

    const currentUuid = this.uuid();
    if (this.isEdit() && currentUuid) {
      this.pangkatService.update(currentUuid, req).subscribe({
        next: () => {
          this.snackBar.open('Pangkat & Golongan berhasil diperbarui', 'Tutup', { duration: 3000 });
          this.router.navigate(['/pangkat-golongan']);
        },
        error: (err: { error?: { message?: string } }) => {
          this.isSaving.set(false);
          this.snackBar.open(err.error?.message || 'Gagal memperbarui data', 'Tutup', { duration: 3000 });
        },
      });
    } else {
      this.pangkatService.create(req).subscribe({
        next: () => {
          this.snackBar.open('Pangkat & Golongan berhasil ditambahkan', 'Tutup', { duration: 3000 });
          this.router.navigate(['/pangkat-golongan']);
        },
        error: (err: { error?: { message?: string } }) => {
          this.isSaving.set(false);
          this.snackBar.open(err.error?.message || 'Gagal menambahkan data', 'Tutup', { duration: 3000 });
        },
      });
    }
  }
}
