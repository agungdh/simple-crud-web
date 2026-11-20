import { Component } from '@angular/core';
import { PagePlaceholder } from '../../shared/page-placeholder/page-placeholder';

@Component({
  selector: 'app-products',
  imports: [PagePlaceholder],
  template: `<app-page-placeholder heading="Products" />`,
})
export class Products {}
