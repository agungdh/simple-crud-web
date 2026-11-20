import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-placeholder',
  template: `
    <h1 class="page-title">{{ heading() }}</h1>
    <p class="page-subtitle">Halaman ini belum diisi.</p>
  `,
  styles: `
    :host {
      display: block;
    }

    .page-title {
      margin: 0 0 8px;
      font: var(--mat-sys-headline-small);
      color: var(--mat-sys-on-surface);
    }

    .page-subtitle {
      margin: 0;
      font: var(--mat-sys-body-medium);
      color: var(--mat-sys-on-surface-variant);
    }
  `,
})
export class PagePlaceholder {
  readonly heading = input.required<string>();
}
