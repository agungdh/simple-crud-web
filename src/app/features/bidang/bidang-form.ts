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
import { BidangService } from '../../core/services/bidang.service';
import { BidangRequest } from '../../core/models/bidang.model';

@Component({
  selector: 'app-bidang-form',
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
          <a mat-icon-button routerLink="/bidang" aria-label="Kembali ke daftar bidang" title="Kembali">
            <mat-icon aria-hidden="true">arrow_back</mat-icon>
          </a>
          <div>
            <h1 class="page-title">{{ isEdit() ? 'Ubah Data Bidang' : 'Tambah Bidang Baru' }}</h1>
            <p class="page-subtitle">
              {{ isEdit() ? 'Perbarui informasi bidang atau unit kerja' : 'Daftarkan nama bidang atau unit kerja baru' }}
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
              <mat-label>Nama Bidang</mat-label>
              <input
                matInput
                formControlName="bidang"
                placeholder="Contoh: Inspektorat Pembantu Wilayah I"
                required
                maxlength="255"
              />
              @if (form.controls.bidang.hasError('required') && form.controls.bidang.touched) {
                <mat-error>Nama bidang wajib diisi</mat-error>
              }
              @if (form.controls.bidang.hasError('maxlength')) {
                <mat-error>Maksimal 255 karakter</mat-error>
              }
            </mat-form-field>

            <div class="form-actions">
              <a mat-button routerLink="/bidang">Batal</a>
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
                  <span>{{ isEdit() ? 'Simpan Perubahan' : 'Tambah Bidang' }}</span>
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
      gap: 16px;
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
  `,
})
export class BidangForm implements OnInit {
  readonly uuid = input<string | undefined>();

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly bidangService = inject(BidangService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly isEdit = signal<boolean>(false);
  protected readonly isLoading = signal<boolean>(false);
  protected readonly isSaving = signal<boolean>(false);

  protected readonly form = this.fb.nonNullable.group({
    bidang: ['', [Validators.required, Validators.maxLength(255)]],
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
    this.bidangService.getById(id).subscribe({
      next: (item) => {
        this.form.patchValue({ bidang: item.bidang });
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Gagal memuat data bidang', 'Tutup', { duration: 3000 });
        this.router.navigate(['/bidang']);
      },
    });
  }

  protected save(): void {
    if (this.form.invalid || this.isSaving()) return;

    this.isSaving.set(true);
    const req: BidangRequest = {
      bidang: this.form.getRawValue().bidang.trim(),
    };

    const currentUuid = this.uuid();
    if (this.isEdit() && currentUuid) {
      this.bidangService.update(currentUuid, req).subscribe({
        next: () => {
          this.snackBar.open('Bidang berhasil diperbarui', 'Tutup', { duration: 3000 });
          this.router.navigate(['/bidang']);
        },
        error: (err: { error?: { message?: string } }) => {
          this.isSaving.set(false);
          this.snackBar.open(err.error?.message || 'Gagal memperbarui bidang', 'Tutup', { duration: 3000 });
        },
      });
    } else {
      this.bidangService.create(req).subscribe({
        next: () => {
          this.snackBar.open('Bidang berhasil ditambahkan', 'Tutup', { duration: 3000 });
          this.router.navigate(['/bidang']);
        },
        error: (err: { error?: { message?: string } }) => {
          this.isSaving.set(false);
          this.snackBar.open(err.error?.message || 'Gagal menambahkan bidang', 'Tutup', { duration: 3000 });
        },
      });
    }
  }
}
