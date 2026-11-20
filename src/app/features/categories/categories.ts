import { Component } from '@angular/core';
import { PagePlaceholder } from '../../shared/page-placeholder/page-placeholder';

@Component({
  selector: 'app-categories',
  imports: [PagePlaceholder],
  template: `<app-page-placeholder heading="Categories" />`,
})
export class Categories {}
