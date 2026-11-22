import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PegawaiService } from '../../core/services/pegawai.service';
import { PegawaiResponse } from '../../core/models/pegawai.model';
import { StatusChip } from '../../shared/components/status-chip/status-chip';

@Component({
  selector: 'app-pegawai-detail',
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    StatusChip,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-left">
          <a mat-icon-button routerLink="/pegawai" aria-label="Kembali ke daftar pegawai" title="Kembali">
            <mat-icon aria-hidden="true">arrow_back</mat-icon>
          </a>
          <div>
            <h1 class="page-title">Detail Pegawai</h1>
            <p class="page-subtitle">Informasi profil lengkap dan relasi akun pengguna</p>
          </div>
        </div>

        @if (pegawai()) {
          <div class="header-actions">
            <a mat-flat-button color="primary" [routerLink]="['/pegawai', pegawai()!.uuid, 'edit']">
              <mat-icon aria-hidden="true">edit</mat-icon>
              <span>Ubah Data</span>
            </a>
          </div>
        }
      </div>

      <mat-card appearance="outlined" class="detail-card">
        @if (isLoading()) {
          <div class="loading-state">
            <mat-spinner diameter="36" />
            <span>Memuat informasi pegawai...</span>
          </div>
        } @else if (pegawai()) {
          <div class="profile-header">
            <div class="avatar">
              <mat-icon aria-hidden="true">person</mat-icon>
            </div>
            <div class="profile-title">
              <h2 class="person-name">{{ pegawai()!.nama }}</h2>
              <p class="person-nip">NIP. {{ pegawai()!.nip }} &bull; {{ pegawai()!.jabatan || 'Belum ada jabatan' }}</p>
              <div class="badges">
                <app-status-chip [status]="pegawai()!.status" />
                <span class="role-badge" [class.role-badge--admin]="pegawai()!.tipe === 'admin'">
                  {{ pegawai()!.tipe === 'admin' ? 'Administrator' : 'Pegawai' }}
                </span>
              </div>
            </div>
          </div>

          <mat-divider />

          <dl class="info-grid">
            <div class="info-item">
              <dt>Username Akun</dt>
              <dd><code>{{ pegawai()!.user.username }}</code></dd>
            </div>

            <div class="info-item">
              <dt>Bidang / Unit Kerja</dt>
              <dd><strong>{{ pegawai()!.bidang.bidang }}</strong></dd>
            </div>

            <div class="info-item">
              <dt>Pangkat & Golongan</dt>
              <dd>
                @if (pegawai()!.pangkatGolongan) {
                  {{ pegawai()!.pangkatGolongan!.pangkat }} ({{ pegawai()!.pangkatGolongan!.golongan }}/{{ pegawai()!.pangkatGolongan!.ruang }}) - {{ pegawai()!.pangkatGolongan!.jenjang }}
                } @else {
                  <span class="text-muted">-</span>
                }
              </dd>
            </div>

            <div class="info-item">
              <dt>Kategori Jabatan</dt>
              <dd>{{ pegawai()!.kategoriJabatan || '-' }}</dd>
            </div>

            <div class="info-item">
              <dt>Peran dalam Tim</dt>
              <dd>{{ pegawai()!.peran || '-' }}</dd>
            </div>

            <div class="info-item">
              <dt>Kebutuhan Jam Pelatihan</dt>
              <dd>{{ pegawai()!.kategoriKebutuhanJamPelatihan || '-' }}</dd>
            </div>

            <div class="info-item">
              <dt>UUID Pegawai</dt>
              <dd><small class="text-muted">{{ pegawai()!.uuid }}</small></dd>
            </div>

            <div class="info-item">
              <dt>UUID User Account</dt>
              <dd><small class="text-muted">{{ pegawai()!.userUuid }}</small></dd>
            </div>
          </dl>
        }
      </mat-card>
    </div>
  `,
  styles: `
    .page-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 800px;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
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
    .detail-card {
      border-radius: 12px;
      padding: 24px;
      background-color: #ffffff;
    }
    .profile-header {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 20px;
    }
    .avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #e8f0fe;
      color: #1a73e8;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .avatar mat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
    }
    .person-name {
      margin: 0;
      font-size: 1.35rem;
      font-weight: 700;
      color: #202124;
    }
    .person-nip {
      margin: 4px 0 8px 0;
      color: #5f6368;
      font-size: 0.9rem;
    }
    .badges {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .role-badge {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 2px 10px;
      border-radius: 12px;
      background: #f1f3f4;
      color: #5f6368;
    }
    .role-badge--admin {
      background: #feefe3;
      color: #b06000;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 18px;
      margin-top: 20px;
    }
    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .info-item dt {
      font-size: 0.8rem;
      color: #5f6368;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .info-item dd {
      margin: 0;
      font-size: 0.95rem;
      color: #202124;
    }
    .text-muted {
      color: #80868b;
    }
    code {
      background: #f1f3f4;
      padding: 3px 8px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 0.85rem;
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
    @media (max-width: 600px) {
      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class PegawaiDetail implements OnInit {
  readonly uuid = input.required<string>();

  private readonly router = inject(Router);
  private readonly pegawaiService = inject(PegawaiService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly pegawai = signal<PegawaiResponse | null>(null);
  protected readonly isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadData(this.uuid());
  }

  private loadData(id: string): void {
    this.isLoading.set(true);
    this.pegawaiService.getById(id).subscribe({
      next: (item) => {
        this.pegawai.set(item);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Gagal memuat detail pegawai', 'Tutup', { duration: 3000 });
        this.router.navigate(['/pegawai']);
      },
    });
  }
}
