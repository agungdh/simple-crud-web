import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { BidangRequest, BidangResponse } from '../../core/models/bidang.model';

export interface BidangDialogData {
  readonly isEdit: boolean;
  readonly initialData?: BidangResponse;
}

@Component({
  selector: 'app-bidang-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.isEdit ? 'Ubah Bidang' : 'Tambah Bidang Baru' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form" (ngSubmit)="save()">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Nama Bidang</mat-label>
          <input
            matInput
            formControlName="bidang"
            placeholder="Contoh: Inspektorat Pembantu Wilayah I"
            required
            maxlength="255"
            cdkFocusInitial
          />
          @if (form.controls.bidang.hasError('required') && form.controls.bidang.touched) {
            <mat-error>Nama bidang wajib diisi</mat-error>
          }
          @if (form.controls.bidang.hasError('maxlength')) {
            <mat-error>Maksimal 255 karakter</mat-error>
          }
        </mat-form-field>
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
        {{ data.isEdit ? 'Simpan Perubahan' : 'Tambah' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .dialog-form {
      padding-top: 8px;
      min-width: 320px;
    }
    .w-full {
      width: 100%;
    }
    mat-dialog-actions {
      gap: 8px;
    }
  `,
})
export class BidangDialog {
  private readonly fb = inject(FormBuilder);
  protected readonly dialogRef = inject(MatDialogRef<BidangDialog>);
  protected readonly data = inject<BidangDialogData>(MAT_DIALOG_DATA);

  protected readonly form = this.fb.nonNullable.group({
    bidang: [this.data.initialData?.bidang ?? '', [Validators.required, Validators.maxLength(255)]],
  });

  protected cancel(): void {
    this.dialogRef.close(null);
  }

  protected save(): void {
    if (this.form.invalid) return;
    const req: BidangRequest = {
      bidang: this.form.getRawValue().bidang.trim(),
    };
    this.dialogRef.close(req);
  }
}
