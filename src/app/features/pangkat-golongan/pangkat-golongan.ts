import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PangkatGolonganService } from '../../core/services/pangkat-golongan.service';
import { PangkatGolonganRequest, PangkatGolonganResponse } from '../../core/models/pangkat-golongan.model';
import { PangkatGolonganDialog } from './pangkat-golongan-dialog';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-pangkat-golongan',
  imports: [
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Master Data Pangkat & Golongan</h1>
          <p class="page-subtitle">Kelola klasifikasi kepangkatan, golongan, dan ruang pegawai</p>
        </div>
        <button mat-flat-button color="primary" (click)="openAddDialog()">
          <mat-icon aria-hidden="true">add</mat-icon>
          <span>Tambah Pangkat / Golongan</span>
        </button>
      </div>

      <mat-card appearance="outlined" class="content-card">
        <div class="table-toolbar">
          <mat-form-field appearance="outline" class="search-field" subscriptSizing="dynamic">
            <mat-icon matPrefix aria-hidden="true">search</mat-icon>
            <mat-label>Cari Pangkat / Golongan...</mat-label>
            <input
              matInput
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              placeholder="Cari berdasarkan jenjang, pangkat, atau golongan"
              aria-label="Cari data pangkat atau golongan"
            />
            @if (searchQuery()) {
              <button mat-icon-button matSuffix (click)="searchQuery.set('')" aria-label="Bersihkan pencarian">
                <mat-icon>close</mat-icon>
              </button>
            }
          </mat-form-field>
        </div>

        @if (isLoading()) {
          <div class="loading-state">
            <mat-spinner diameter="36" />
            <span>Memuat data pangkat & golongan...</span>
          </div>
        } @else {
          <div class="table-container">
            <table mat-table [dataSource]="filteredItems()" class="w-full" aria-label="Tabel Data Pangkat Golongan">
              <ng-container matColumnDef="nomor">
                <th mat-header-cell *matHeaderCellDef class="col-num">No.</th>
                <td mat-cell *matCellDef="let element; let i = index" class="col-num">{{ i + 1 }}</td>
              </ng-container>

              <ng-container matColumnDef="jenjang">
                <th mat-header-cell *matHeaderCellDef>Jenjang</th>
                <td mat-cell *matCellDef="let element">{{ element.jenjang }}</td>
              </ng-container>

              <ng-container matColumnDef="pangkat">
                <th mat-header-cell *matHeaderCellDef>Pangkat</th>
                <td mat-cell *matCellDef="let element">
                  <strong>{{ element.pangkat }}</strong>
                </td>
              </ng-container>

              <ng-container matColumnDef="golonganRuang">
                <th mat-header-cell *matHeaderCellDef>Golongan / Ruang</th>
                <td mat-cell *matCellDef="let element">
                  <span class="badge-gol">{{ element.golongan }}/{{ element.ruang }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="col-actions">Aksi</th>
                <td mat-cell *matCellDef="let element" class="col-actions">
                  <button
                    mat-icon-button
                    color="primary"
                    (click)="openEditDialog(element)"
                    aria-label="Edit pangkat golongan"
                    title="Ubah"
                  >
                    <mat-icon aria-hidden="true">edit</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    color="warn"
                    (click)="confirmDelete(element)"
                    aria-label="Hapus pangkat golongan"
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
                  Tidak ada data pangkat & golongan yang sesuai.
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
    }
    .search-field {
      width: 100%;
      max-width: 380px;
    }
    .table-container {
      overflow-x: auto;
    }
    .w-full {
      width: 100%;
    }
    .col-num {
      width: 60px;
      text-align: center;
    }
    .col-actions {
      width: 120px;
      text-align: right;
    }
    .badge-gol {
      display: inline-block;
      padding: 2px 8px;
      background-color: #e8f0fe;
      color: #1a73e8;
      font-weight: 600;
      border-radius: 6px;
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
    .empty-cell {
      padding: 32px;
      text-align: center;
      color: #80868b;
      font-style: italic;
    }
  `,
})
export class PangkatGolongan {
  private readonly pangkatService = inject(PangkatGolonganService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly items = signal<PangkatGolonganResponse[]>([]);
  protected readonly isLoading = signal<boolean>(true);
  protected readonly searchQuery = signal<string>('');

  protected readonly displayedColumns: string[] = ['nomor', 'jenjang', 'pangkat', 'golonganRuang', 'actions'];

  protected readonly filteredItems = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.items();
    return this.items().filter(
      (item) =>
        item.jenjang.toLowerCase().includes(q) ||
        item.pangkat.toLowerCase().includes(q) ||
        item.golongan.toLowerCase().includes(q) ||
        item.ruang.toLowerCase().includes(q) ||
        `${item.golongan}/${item.ruang}`.toLowerCase().includes(q),
    );
  });

  constructor() {
    this.loadData();
  }

  protected loadData(): void {
    this.isLoading.set(true);
    this.pangkatService.list().subscribe({
      next: (data) => {
        this.items.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Gagal memuat data pangkat & golongan', 'Tutup', { duration: 3000 });
      },
    });
  }

  protected openAddDialog(): void {
    const dialogRef = this.dialog.open(PangkatGolonganDialog, {
      data: { isEdit: false },
      width: '450px',
    });

    dialogRef.afterClosed().subscribe((result: PangkatGolonganRequest | null) => {
      if (!result) return;
      this.pangkatService.create(result).subscribe({
        next: () => {
          this.snackBar.open('Pangkat & Golongan berhasil ditambahkan', 'Tutup', { duration: 3000 });
          this.loadData();
        },
        error: () => {
          this.snackBar.open('Gagal menambahkan pangkat & golongan', 'Tutup', { duration: 3000 });
        },
      });
    });
  }

  protected openEditDialog(item: PangkatGolonganResponse): void {
    const dialogRef = this.dialog.open(PangkatGolonganDialog, {
      data: { isEdit: true, initialData: item },
      width: '450px',
    });

    dialogRef.afterClosed().subscribe((result: PangkatGolonganRequest | null) => {
      if (!result) return;
      this.pangkatService.update(item.uuid, result).subscribe({
        next: () => {
          this.snackBar.open('Pangkat & Golongan berhasil diperbarui', 'Tutup', { duration: 3000 });
          this.loadData();
        },
        error: () => {
          this.snackBar.open('Gagal memperbarui pangkat & golongan', 'Tutup', { duration: 3000 });
        },
      });
    });
  }

  protected confirmDelete(item: PangkatGolonganResponse): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Hapus Pangkat & Golongan',
        message: `Apakah Anda yakin ingin menghapus pangkat "${item.pangkat}" (${item.golongan}/${item.ruang})?`,
        confirmLabel: 'Hapus',
        isDestructive: true,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.pangkatService.delete(item.uuid).subscribe({
        next: () => {
          this.snackBar.open('Pangkat & Golongan berhasil dihapus', 'Tutup', { duration: 3000 });
          this.loadData();
        },
        error: () => {
          this.snackBar.open('Gagal menghapus pangkat & golongan', 'Tutup', { duration: 3000 });
        },
      });
    });
  }
}
