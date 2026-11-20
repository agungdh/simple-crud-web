import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { routes } from '../../app.routes';
import { Shell } from './shell';
import { PageTitle } from '../page-title';

describe('Shell', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Shell],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should render every navigation item', async () => {
    const fixture = TestBed.createComponent(Shell);
    await fixture.whenStable();
    const links = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLAnchorElement>(
      'mat-nav-list a',
    );

    expect(Array.from(links).map((link) => link.getAttribute('href'))).toEqual([
      '/dashboard',
      '/products',
      '/categories',
      '/users',
    ]);
  });

  it('should show the current page title from the title strategy', async () => {
    const fixture = TestBed.createComponent(Shell);
    const pageTitle = TestBed.inject(PageTitle);
    pageTitle.set('Products');
    await fixture.whenStable();

    const title = (fixture.nativeElement as HTMLElement).querySelector('.shell__title');
    expect(title?.textContent?.trim()).toBe('Products');
  });
});
