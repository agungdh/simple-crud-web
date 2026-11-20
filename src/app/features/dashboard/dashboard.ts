import { Component } from '@angular/core';
import { PagePlaceholder } from '../../shared/page-placeholder/page-placeholder';

@Component({
  selector: 'app-dashboard',
  imports: [PagePlaceholder],
  template: `<app-page-placeholder heading="Dashboard" />`,
})
export class Dashboard {}
