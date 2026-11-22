import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';
import { PegawaiService } from '../../core/services/pegawai.service';
import { BidangService } from '../../core/services/bidang.service';
import { PangkatGolonganService } from '../../core/services/pangkat-golongan.service';
import { PegawaiResponse } from '../../core/models/pegawai.model';
import { BidangResponse } from '../../core/models/bidang.model';
import { PangkatGolonganResponse } from '../../core/models/pangkat-golongan.model';
import { StatusChip } from '../../shared/components/status-chip/status-chip';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    StatusChip,
  ],
  template: `
    <div class="dashboard-container">
      <div class="welcome-banner">
        <div class="welcome-text">
          <h1 class="welcome-title">
            Selamat Datang, {{ authService.currentUser()?.nama || 'Pengguna' }}!
          </h1>
          <p class="welcome-subtitle">
            Sistem Informasi Monitoring Jam Pelatihan (SIMON-JP) &bull; Panel Manajemen Master Data
          </p>
        </div>
        <div class="quick-actions">
          <a mat-flat-button color="primary" routerLink="/pegawai">
            <mat-icon aria-hidden="true">person_add</mat-icon>
            <span>Kelola Pegawai</span>
          </a>
        </div>
      </div>

      @if (isLoading()) {
        <div class="loading-state">
          <mat-spinner diameter="36" />
          <span>Memuat ringkasan data...</span>
        </div>
      } @else {
        <!-- Metrics Row -->
        <div class="metrics-grid">
          <mat-card appearance="outlined" class="metric-card">
            <div class="metric-icon metric-icon--blue">
              <mat-icon aria-hidden="true">people</mat-icon>
            </div>
            <div class="metric-info">
              <span class="metric-label">Total Pegawai</span>
              <span class="metric-value">{{ totalPegawai() }}</span>
              <span class="metric-sub">{{ totalPegawaiAktif() }} aktif &bull; {{ totalPegawaiNonAktif() }} non-aktif</span>
            </div>
          </mat-card>

          <mat-card appearance="outlined" class="metric-card">
            <div class="metric-icon metric-icon--green">
              <mat-icon aria-hidden="true">corporate_fare</mat-icon>
            </div>
            <div class="metric-info">
              <span class="metric-label">Unit Kerja / Bidang</span>
              <span class="metric-value">{{ totalBidang() }}</span>
              <span class="metric-sub">Terdaftar dalam struktur</span>
            </div>
          </mat-card>

          <mat-card appearance="outlined" class="metric-card">
            <div class="metric-icon metric-icon--purple">
              <mat-icon aria-hidden="true">military_tech</mat-icon>
            </div>
            <div class="metric-info">
              <span class="metric-label">Pangkat & Golongan</span>
              <span class="metric-value">{{ totalPangkat() }}</span>
              <span class="metric-sub">Klasifikasi kepangkatan</span>
            </div>
          </mat-card>
        </div>

        <!-- Recent Records -->
        <mat-card appearance="outlined" class="recent-card">
          <div class="recent-header">
            <div>
              <h2 class="card-title">Daftar Pegawai Terbaru</h2>
              <p class="card-subtitle">Pegawai yang baru saja didaftarkan ke sistem</p>
            </div>
            <a mat-button color="primary" routerLink="/pegawai">
              <span>Lihat Semua</span>
              <mat-icon aria-hidden="true">arrow_forward</mat-icon>
            </a>
          </div>

          <table mat-table [dataSource]="recentPegawai()" class="w-full" aria-label="Tabel Pegawai Terbaru">
            <ng-container matColumnDef="nip">
              <th mat-header-cell *matHeaderCellDef>NIP</th>
              <td mat-cell *matCellDef="let element">{{ element.nip }}</td>
            </ng-container>

            <ng-container matColumnDef="nama">
              <th mat-header-cell *matHeaderCellDef>Nama</th>
              <td mat-cell *matCellDef="let element">
                <strong>{{ element.nama }}</strong>
              </td>
            </ng-container>

            <ng-container matColumnDef="bidang">
              <th mat-header-cell *matHeaderCellDef>Bidang</th>
              <td mat-cell *matCellDef="let element">{{ element.bidang.bidang }}</td>
            </ng-container>

            <ng-container matColumnDef="jabatan">
              <th mat-header-cell *matHeaderCellDef>Jabatan</th>
              <td mat-cell *matCellDef="let element">{{ element.jabatan || '-' }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let element">
                <app-status-chip [status]="element.status" />
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns"></tr>
          </table>
        </mat-card>
      }
    </div>
  `,
  styles: `
    .dashboard-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .welcome-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(135deg, #1a73e8 0%, #0b57d0 100%);
      color: #ffffff;
      padding: 24px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(26, 115, 232, 0.2);
      flex-wrap: wrap;
      gap: 16px;
    }
    .welcome-title {
      margin: 0;
      font-size: 1.6rem;
      font-weight: 700;
    }
    .welcome-subtitle {
      margin: 6px 0 0 0;
      color: #e8f0fe;
      font-size: 0.95rem;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
    }
    .metric-card {
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 20px;
      gap: 16px;
      border-radius: 12px;
      background-color: #ffffff;
    }
    .metric-icon {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .metric-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
    .metric-icon--blue {
      background-color: #e8f0fe;
      color: #1a73e8;
    }
    .metric-icon--green {
      background-color: #e6f4ea;
      color: #137333;
    }
    .metric-icon--purple {
      background-color: #f3e8fd;
      color: #8430ce;
    }
    .metric-info {
      display: flex;
      flex-direction: column;
    }
    .metric-label {
      font-size: 0.85rem;
      color: #5f6368;
      font-weight: 500;
    }
    .metric-value {
      font-size: 1.8rem;
      font-weight: 700;
      color: #202124;
      line-height: 1.2;
      margin: 2px 0;
    }
    .metric-sub {
      font-size: 0.75rem;
      color: #80868b;
    }
    .recent-card {
      border-radius: 12px;
      overflow: hidden;
    }
    .recent-header {
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f1f3f4;
    }
    .card-title {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
    }
    .card-subtitle {
      margin: 2px 0 0 0;
      font-size: 0.825rem;
      color: #5f6368;
    }
    .w-full {
      width: 100%;
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
export class Dashboard {
  protected readonly authService = inject(AuthService);
  private readonly pegawaiService = inject(PegawaiService);
  private readonly bidangService = inject(BidangService);
  private readonly pangkatService = inject(PangkatGolonganService);

  protected readonly isLoading = signal(true);
  protected readonly pegawaiList = signal<PegawaiResponse[]>([]);
  protected readonly bidangList = signal<BidangResponse[]>([]);
  protected readonly pangkatList = signal<PangkatGolonganResponse[]>([]);

  protected readonly columns = ['nip', 'nama', 'bidang', 'jabatan', 'status'];

  protected readonly totalPegawai = computed(() => this.pegawaiList().length);
  protected readonly totalPegawaiAktif = computed(
    () => this.pegawaiList().filter((p) => p.status === 'aktif').length,
  );
  protected readonly totalPegawaiNonAktif = computed(
    () => this.pegawaiList().filter((p) => p.status === 'non aktif').length,
  );
  protected readonly totalBidang = computed(() => this.bidangList().length);
  protected readonly totalPangkat = computed(() => this.pangkatList().length);

  protected readonly recentPegawai = computed(() => this.pegawaiList().slice(0, 5));

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading.set(true);
    forkJoin({
      pegawai: this.pegawaiService.list(),
      bidang: this.bidangService.list(),
      pangkat: this.pangkatService.list(),
    }).subscribe({
      next: ({ pegawai, bidang, pangkat }) => {
        this.pegawaiList.set(pegawai);
        this.bidangList.set(bidang);
        this.pangkatList.set(pangkat);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }
}
