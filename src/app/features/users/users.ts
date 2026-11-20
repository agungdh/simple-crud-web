import { Component } from '@angular/core';
import { PagePlaceholder } from '../../shared/page-placeholder/page-placeholder';

@Component({
  selector: 'app-users',
  imports: [PagePlaceholder],
  template: `<app-page-placeholder heading="Users" />`,
})
export class Users {}
