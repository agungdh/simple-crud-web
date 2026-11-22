import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { PegawaiResponse } from '../../core/models/pegawai.model';
import { StatusChip } from '../../shared/components/status-chip/status-chip';

@Component({
  selector: 'app-pegawai-detail-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    StatusChip,
  ],
  template: `
    <div class="detail-header">
      <div class="header-avatar">
        <mat-icon aria-hidden="true">person</mat-icon>
      </div>
      <div>
        <h2 mat-dialog-title class="title">{{ data.nama }}</h2>
        <p class="subtitle">{{ data.jabatan || 'Belum ada jabatan' }} &bull; {{ data.nip }}</p>
      </div>
    </div>

    <mat-dialog-content class="detail-content">
      <div class="status-row">
        <app-status-chip [status]="data.status" />
        <span class="role-badge" [class.role-badge--admin]="data.tipe === 'admin'">
          {{ data.tipe === 'admin' ? 'Administrator' : 'Pegawai' }}
        </span>
      </div>

      <mat-divider />

      <dl class="info-list">
        <div class="info-item">
          <dt>Username Akun</dt>
          <dd><code>{{ data.user.username }}</code></dd>
        </div>

        <div class="info-item">
          <dt>Bidang / Unit Kerja</dt>
          <dd><strong>{{ data.bidang.bidang }}</strong></dd>
        </div>

        <div class="info-item">
          <dt>Pangkat & Golongan</dt>
          <dd>
            @if (data.pangkatGolongan) {
              {{ data.pangkatGolongan.pangkat }} ({{ data.pangkatGolongan.golongan }}/{{ data.pangkatGolongan.ruang }}) - {{ data.pangkatGolongan.jenjang }}
            } @else {
              <span class="text-muted">-</span>
            }
          </dd>
        </div>

        <div class="info-item">
          <dt>Kategori Jabatan</dt>
          <dd>{{ data.kategoriJabatan || '-' }}</dd>
        </div>

        <div class="info-item">
          <dt>Peran Tim</dt>
          <dd>{{ data.peran || '-' }}</dd>
        </div>

        <div class="info-item">
          <dt>Kebutuhan Jam Pelatihan</dt>
          <dd>{{ data.kategoriKebutuhanJamPelatihan || '-' }}</dd>
        </div>

        <div class="info-item">
          <dt>UUID Pegawai</dt>
          <dd><small class="text-muted">{{ data.uuid }}</small></dd>
        </div>
      </dl>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-flat-button color="primary" (click)="close()">Tutup</button>
    </mat-dialog-actions>
  `,
  styles: `
    .detail-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 24px 8px 24px;
    }
    .header-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #e8f0fe;
      color: #1a73e8;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .title {
      margin: 0;
      padding: 0;
      font-size: 1.25rem;
      font-weight: 700;
    }
    .subtitle {
      margin: 4px 0 0 0;
      color: #5f6368;
      font-size: 0.875rem;
    }
    .detail-content {
      padding: 12px 24px;
      min-width: 420px;
    }
    .status-row {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 12px;
    }
    .role-badge {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 12px;
      background: #f1f3f4;
      color: #5f6368;
    }
    .role-badge--admin {
      background: #feefe3;
      color: #b06000;
    }
    .info-list {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
      margin-top: 14px;
    }
    .info-item {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px dashed #f1f3f4;
      padding-bottom: 6px;
    }
    .info-item dt {
      color: #5f6368;
      font-size: 0.85rem;
    }
    .info-item dd {
      margin: 0;
      font-size: 0.9rem;
      text-align: right;
    }
    .text-muted {
      color: #80868b;
    }
    code {
      background: #f1f3f4;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.8rem;
    }
    mat-dialog-actions {
      padding: 12px 24px;
    }
  `,
})
export class PegawaiDetailDialog {
  protected readonly dialogRef = inject(MatDialogRef<PegawaiDetailDialog>);
  protected readonly data = inject<PegawaiResponse>(MAT_DIALOG_DATA);

  protected close(): void {
    this.dialogRef.close();
  }
}
