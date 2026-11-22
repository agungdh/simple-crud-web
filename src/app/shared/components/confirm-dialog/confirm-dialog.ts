import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  readonly title: string;
  readonly message: string;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  readonly isDestructive?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="cancel()">
        {{ data.cancelLabel || 'Batal' }}
      </button>
      <button
        mat-flat-button
        type="button"
        [color]="data.isDestructive ? 'warn' : 'primary'"
        (click)="confirm()"
        cdkFocusInitial
      >
        {{ data.confirmLabel || 'Konfirmasi' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    mat-dialog-actions {
      gap: 8px;
    }
  `,
})
export class ConfirmDialog {
  protected readonly dialogRef = inject(MatDialogRef<ConfirmDialog>);
  protected readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);

  protected cancel(): void {
    this.dialogRef.close(false);
  }

  protected confirm(): void {
    this.dialogRef.close(true);
  }
}
