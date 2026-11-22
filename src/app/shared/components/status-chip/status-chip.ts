import { Component, input } from '@angular/core';
import { PegawaiStatus } from '../../../core/models/pegawai.model';

@Component({
  selector: 'app-status-chip',
  template: `
    <span
      class="status-chip"
      [class.status-chip--active]="status() === 'aktif'"
      [class.status-chip--inactive]="status() === 'non aktif'"
      [attr.aria-label]="'Status: ' + status()"
    >
      {{ status() }}
    </span>
  `,
  styles: `
    .status-chip {
      display: inline-flex;
      align-items: center;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: capitalize;
      letter-spacing: 0.02em;
    }
    .status-chip--active {
      background-color: #e6f4ea;
      color: #137333;
    }
    .status-chip--inactive {
      background-color: #f1f3f4;
      color: #5f6368;
    }
  `,
})
export class StatusChip {
  readonly status = input.required<PegawaiStatus>();
}
