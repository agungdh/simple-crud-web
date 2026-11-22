import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BidangService } from '../../core/services/bidang.service';
import { BidangResponse } from '../../core/models/bidang.model';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-bidang',
  imports: [
    FormsModule,
    RouterLink,
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
          <h1 class="page-title">Master Data Bidang</h1>
          <p class="page-subtitle">Kelola data bidang struktur organisasi</p>
        </div>
        <a mat-flat-button color="primary" routerLink="/bidang/create">
          <mat-icon aria-hidden="true">add</mat-icon>
          <span>Tambah Bidang</span>
        </a>
      </div>

      <mat-card appearance="outlined" class="content-card">
        <div class="table-toolbar">
          <mat-form-field appearance="outline" class="search-field" subscriptSizing="dynamic">
            <mat-icon matPrefix aria-hidden="true">search</mat-icon>
            <mat-label>Cari Bidang...</mat-label>
            <input
              matInput
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              placeholder="Ketik nama bidang"
              aria-label="Cari nama bidang"
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
            <span>Memuat data bidang...</span>
          </div>
        } @else {
          <div class="table-container">
            <table mat-table [dataSource]="filteredItems()" class="w-full" aria-label="Tabel Data Bidang">
              <ng-container matColumnDef="nomor">
                <th mat-header-cell *matHeaderCellDef class="col-num">No.</th>
                <td mat-cell *matCellDef="let element; let i = index" class="col-num">{{ i + 1 }}</td>
              </ng-container>

              <ng-container matColumnDef="bidang">
                <th mat-header-cell *matHeaderCellDef>Nama Bidang</th>
                <td mat-cell *matCellDef="let element">
                  <strong>{{ element.bidang }}</strong>
                </td>
              </ng-container>

              <ng-container matColumnDef="uuid">
                <th mat-header-cell *matHeaderCellDef>UUID</th>
                <td mat-cell *matCellDef="let element">
                  <code class="uuid-badge">{{ element.uuid }}</code>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="col-actions">Aksi</th>
                <td mat-cell *matCellDef="let element" class="col-actions">
                  <a
                    mat-icon-button
                    color="primary"
                    [routerLink]="['/bidang', element.uuid, 'edit']"
                    aria-label="Edit bidang"
                    title="Ubah"
                  >
                    <mat-icon aria-hidden="true">edit</mat-icon>
                  </a>
                  <button
                    mat-icon-button
                    color="warn"
                    (click)="confirmDelete(element)"
                    aria-label="Hapus bidang"
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
                  Tidak ada data bidang yang sesuai.
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
    .uuid-badge {
      background: #f1f3f4;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.75rem;
      color: #5f6368;
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
export class Bidang {
  private readonly bidangService = inject(BidangService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly items = signal<BidangResponse[]>([]);
  protected readonly isLoading = signal<boolean>(true);
  protected readonly searchQuery = signal<string>('');

  protected readonly displayedColumns: string[] = ['nomor', 'bidang', 'uuid', 'actions'];

  protected readonly filteredItems = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.items();
    return this.items().filter((item) => item.bidang.toLowerCase().includes(q));
  });

  constructor() {
    this.loadData();
  }

  protected loadData(): void {
    this.isLoading.set(true);
    this.bidangService.list().subscribe({
      next: (data) => {
        this.items.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Gagal memuat data bidang', 'Tutup', { duration: 3000 });
      },
    });
  }

  protected confirmDelete(item: BidangResponse): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Hapus Bidang',
        message: `Apakah Anda yakin ingin menghapus bidang "${item.bidang}"?`,
        confirmLabel: 'Hapus',
        isDestructive: true,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.bidangService.delete(item.uuid).subscribe({
        next: () => {
          this.snackBar.open('Bidang berhasil dihapus', 'Tutup', { duration: 3000 });
          this.loadData();
        },
        error: () => {
          this.snackBar.open('Gagal menghapus bidang', 'Tutup', { duration: 3000 });
        },
      });
    });
  }
}
