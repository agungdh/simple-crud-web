import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, TitleStrategy } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { AppTitleStrategy, PageTitle } from './layout/page-title';

describe('app routing', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), { provide: TitleStrategy, useClass: AppTitleStrategy }],
    });
  });

  it('should redirect the root path to the dashboard', async () => {
    const harness = await RouterTestingHarness.create('/');

    expect(TestBed.inject(PageTitle).text()).toBe('Dashboard');
    expect(harness.routeNativeElement?.querySelector('app-dashboard')).toBeTruthy();
  });

  it('should sync the document title and the shell title on navigation', async () => {
    const harness = await RouterTestingHarness.create('/products');

    expect(TestBed.inject(PageTitle).text()).toBe('Products');
    expect(TestBed.inject(Title).getTitle()).toBe('Products');

    await harness.navigateByUrl('/users');

    expect(TestBed.inject(PageTitle).text()).toBe('Users');
    expect(TestBed.inject(Title).getTitle()).toBe('Users');
  });
});
