import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PegawaiService } from '../../core/services/pegawai.service';
import { BidangService } from '../../core/services/bidang.service';
import { PangkatGolonganService } from '../../core/services/pangkat-golongan.service';
import { PegawaiResponse } from '../../core/models/pegawai.model';
import { BidangResponse } from '../../core/models/bidang.model';
import { PangkatGolonganResponse } from '../../core/models/pangkat-golongan.model';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { StatusChip } from '../../shared/components/status-chip/status-chip';

@Component({
  selector: 'app-pegawai',
  imports: [
    FormsModule,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    StatusChip,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Data Pegawai & Akun Pengguna</h1>
          <p class="page-subtitle">Kelola informasi pegawai dan akun pengguna relasi 1-to-1</p>
        </div>
        <a mat-flat-button color="primary" routerLink="/pegawai/create">
          <mat-icon aria-hidden="true">person_add</mat-icon>
          <span>Tambah Pegawai</span>
        </a>
      </div>

      <mat-card appearance="outlined" class="content-card">
        <div class="table-toolbar">
          <mat-form-field appearance="outline" class="search-field" subscriptSizing="dynamic">
            <mat-icon matPrefix aria-hidden="true">search</mat-icon>
            <mat-label>Cari Pegawai...</mat-label>
            <input
              matInput
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              placeholder="Cari berdasarkan NIP, Nama, atau Jabatan"
              aria-label="Cari pegawai"
            />
            @if (searchQuery()) {
              <button mat-icon-button matSuffix (click)="searchQuery.set('')" aria-label="Bersihkan pencarian">
                <mat-icon>close</mat-icon>
              </button>
            }
          </mat-form-field>

          <div class="filter-group">
            <mat-form-field appearance="outline" class="filter-field" subscriptSizing="dynamic">
              <mat-label>Filter Status</mat-label>
              <mat-select [ngModel]="selectedStatus()" (ngModelChange)="selectedStatus.set($event)">
                <mat-option value="all">Semua Status</mat-option>
                <mat-option value="aktif">Aktif</mat-option>
                <mat-option value="non aktif">Non Aktif</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field" subscriptSizing="dynamic">
              <mat-label>Filter Bidang</mat-label>
              <mat-select [ngModel]="selectedBidang()" (ngModelChange)="selectedBidang.set($event)">
                <mat-option value="all">Semua Bidang</mat-option>
                @for (b of bidangList(); track b.uuid) {
                  <mat-option [value]="b.uuid">{{ b.bidang }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>
        </div>

        @if (isLoading()) {
          <div class="loading-state">
            <mat-spinner diameter="36" />
            <span>Memuat data pegawai...</span>
          </div>
        } @else {
          <div class="table-container">
            <table mat-table [dataSource]="filteredItems()" class="w-full" aria-label="Tabel Data Pegawai">
              <ng-container matColumnDef="nipNama">
                <th mat-header-cell *matHeaderCellDef>NIP & Nama</th>
                <td mat-cell *matCellDef="let element">
                  <div class="name-cell">
                    <span class="user-name">{{ element.nama }}</span>
                    <span class="user-nip">NIP. {{ element.nip }}</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="bidang">
                <th mat-header-cell *matHeaderCellDef>Bidang</th>
                <td mat-cell *matCellDef="let element">
                  {{ element.bidang.bidang }}
                </td>
              </ng-container>

              <ng-container matColumnDef="pangkat">
                <th mat-header-cell *matHeaderCellDef>Pangkat / Gol.</th>
                <td mat-cell *matCellDef="let element">
                  @if (element.pangkatGolongan) {
                    {{ element.pangkatGolongan.pangkat }} ({{ element.pangkatGolongan.golongan }}/{{ element.pangkatGolongan.ruang }})
                  } @else {
                    <span class="text-muted">-</span>
                  }
                </td>
              </ng-container>

              <ng-container matColumnDef="jabatan">
                <th mat-header-cell *matHeaderCellDef>Jabatan</th>
                <td mat-cell *matCellDef="let element">
                  {{ element.jabatan || '-' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let element">
                  <app-status-chip [status]="element.status" />
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="col-actions">Aksi</th>
                <td mat-cell *matCellDef="let element" class="col-actions">
                  <a
                    mat-icon-button
                    color="primary"
                    [routerLink]="['/pegawai', element.uuid]"
                    aria-label="Lihat detail pegawai"
                    title="Detail"
                  >
                    <mat-icon aria-hidden="true">visibility</mat-icon>
                  </a>
                  <a
                    mat-icon-button
                    color="primary"
                    [routerLink]="['/pegawai', element.uuid, 'edit']"
                    aria-label="Edit pegawai"
                    title="Ubah"
                  >
                    <mat-icon aria-hidden="true">edit</mat-icon>
                  </a>
                  <button
                    mat-icon-button
                    color="warn"
                    (click)="confirmDelete(element)"
                    aria-label="Hapus pegawai"
                    title="Hapus"
                  >
                    <mat-icon aria-hidden="true">delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>

              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell empty-cell" [attr.colspan]="displayedColumns.length">
                  Tidak ada data pegawai yang sesuai filter atau pencarian.
                </td>
              </tr>
            </table>
          </div>
        }
      </mat-card>
    </div>
  `,
  styles: `
    .page-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .page-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
    }
    .page-subtitle {
      margin: 4px 0 0 0;
      color: #5f6368;
      font-size: 0.875rem;
    }
    .content-card {
      border-radius: 12px;
      overflow: hidden;
    }
    .table-toolbar {
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
    .search-field {
      flex: 1;
      min-width: 260px;
    }
    .filter-group {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .filter-field {
      width: 170px;
    }
    .table-container {
      overflow-x: auto;
    }
    .w-full {
      width: 100%;
    }
    .col-actions {
      width: 150px;
      text-align: right;
    }
    .name-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .user-name {
      font-weight: 600;
      color: #202124;
    }
    .user-nip {
      font-size: 0.8rem;
      color: #5f6368;
    }
    .text-muted {
      color: #80868b;
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
    .empty-cell {
      padding: 32px;
      text-align: center;
      color: #80868b;
      font-style: italic;
    }
  `,
})
export class Pegawai {
  private readonly pegawaiService = inject(PegawaiService);
  private readonly bidangService = inject(BidangService);
  private readonly pangkatService = inject(PangkatGolonganService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly items = signal<PegawaiResponse[]>([]);
  protected readonly bidangList = signal<BidangResponse[]>([]);
  protected readonly pangkatList = signal<PangkatGolonganResponse[]>([]);
  protected readonly isLoading = signal<boolean>(true);
  protected readonly searchQuery = signal<string>('');
  protected readonly selectedStatus = signal<string>('all');
  protected readonly selectedBidang = signal<string>('all');

  protected readonly displayedColumns: string[] = [
    'nipNama',
    'bidang',
    'pangkat',
    'jabatan',
    'status',
    'actions',
  ];

  protected readonly filteredItems = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const status = this.selectedStatus();
    const bidang = this.selectedBidang();

    return this.items().filter((item) => {
      const matchQuery =
        !q ||
        item.nama.toLowerCase().includes(q) ||
        item.nip.toLowerCase().includes(q) ||
        (item.jabatan && item.jabatan.toLowerCase().includes(q)) ||
        item.bidang.bidang.toLowerCase().includes(q);

      const matchStatus = status === 'all' || item.status === status;
      const matchBidang = bidang === 'all' || item.bidangUuid === bidang;

      return matchQuery && matchStatus && matchBidang;
    });
  });

  constructor() {
    this.loadAllData();
  }

  protected loadAllData(): void {
    this.isLoading.set(true);
    forkJoin({
      pegawai: this.pegawaiService.list(),
      bidang: this.bidangService.list(),
      pangkat: this.pangkatService.list(),
    }).subscribe({
      next: ({ pegawai, bidang, pangkat }) => {
        this.items.set(pegawai);
        this.bidangList.set(bidang);
        this.pangkatList.set(pangkat);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Gagal memuat data pegawai', 'Tutup', { duration: 3000 });
      },
    });
  }

  protected confirmDelete(item: PegawaiResponse): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Hapus Data Pegawai',
        message: `Apakah Anda yakin ingin menghapus pegawai "${item.nama}" (NIP: ${item.nip})? Akun user "${item.user.username}" terkait juga akan dihapus permanen.`,
        confirmLabel: 'Hapus Permanen',
        isDestructive: true,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.pegawaiService.delete(item.uuid).subscribe({
        next: () => {
          this.snackBar.open('Pegawai dan akun berhasil dihapus', 'Tutup', { duration: 3000 });
          this.loadAllData();
        },
        error: () => {
          this.snackBar.open('Gagal menghapus pegawai', 'Tutup', { duration: 3000 });
        },
      });
    });
  }
}
