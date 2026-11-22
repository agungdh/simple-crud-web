import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { PangkatGolonganRequest, PangkatGolonganResponse } from '../../core/models/pangkat-golongan.model';

export interface PangkatGolonganDialogData {
  readonly isEdit: boolean;
  readonly initialData?: PangkatGolonganResponse;
}

@Component({
  selector: 'app-pangkat-golongan-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.isEdit ? 'Ubah Pangkat & Golongan' : 'Tambah Pangkat & Golongan' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form" (ngSubmit)="save()">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Jenjang</mat-label>
          <input
            matInput
            formControlName="jenjang"
            placeholder="Contoh: Penata"
            required
            maxlength="255"
            cdkFocusInitial
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
      min-width: 340px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .w-full {
      width: 100%;
    }
    .form-row {
      display: flex;
      gap: 12px;
    }
    .w-half {
      flex: 1;
    }
    mat-dialog-actions {
      gap: 8px;
    }
  `,
})
export class PangkatGolonganDialog {
  private readonly fb = inject(FormBuilder);
  protected readonly dialogRef = inject(MatDialogRef<PangkatGolonganDialog>);
  protected readonly data = inject<PangkatGolonganDialogData>(MAT_DIALOG_DATA);

  protected readonly form = this.fb.nonNullable.group({
    jenjang: [this.data.initialData?.jenjang ?? '', [Validators.required, Validators.maxLength(255)]],
    pangkat: [this.data.initialData?.pangkat ?? '', [Validators.required, Validators.maxLength(255)]],
    golongan: [this.data.initialData?.golongan ?? '', [Validators.required, Validators.maxLength(255)]],
    ruang: [this.data.initialData?.ruang ?? '', [Validators.required, Validators.maxLength(255)]],
  });

  protected cancel(): void {
    this.dialogRef.close(null);
  }

  protected save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const req: PangkatGolonganRequest = {
      jenjang: v.jenjang.trim(),
      pangkat: v.pangkat.trim(),
      golongan: v.golongan.trim(),
      ruang: v.ruang.trim(),
    };
    this.dialogRef.close(req);
  }
}
