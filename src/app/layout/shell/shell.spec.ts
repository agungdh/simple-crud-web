import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from '../../app.routes';
import { Shell } from './shell';
import { PageTitle } from '../page-title';
import { AuthService } from '../../core/services/auth.service';

describe('Shell', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Shell],
      providers: [provideRouter(routes), provideHttpClient(), AuthService],
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
      '/pegawai',
      '/bidang',
      '/pangkat-golongan',
    ]);
  });

  it('should show the current page title from the title strategy', async () => {
    const fixture = TestBed.createComponent(Shell);
    const pageTitle = TestBed.inject(PageTitle);
    pageTitle.set('Data Pegawai');
    await fixture.whenStable();

    const title = (fixture.nativeElement as HTMLElement).querySelector('.shell__title');
    expect(title?.textContent?.trim()).toBe('Data Pegawai');
  });
});
