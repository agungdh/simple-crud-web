import { Component, computed, inject, linkedSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatListItem, MatListItemIcon, MatListItemTitle, MatNavList } from '@angular/material/list';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatToolbar } from '@angular/material/toolbar';
import { map } from 'rxjs/operators';
import { NAV_ITEMS } from '../nav-items';
import { PageTitle } from '../page-title';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavContainer,
    MatSidenav,
    MatSidenavContent,
    MatToolbar,
    MatIcon,
    MatIconButton,
    MatNavList,
    MatListItem,
    MatListItemIcon,
    MatListItemTitle,
  ],
})
export class Shell {
  private readonly breakpoint = inject(BreakpointObserver);

  protected readonly pageTitle = inject(PageTitle);

  protected readonly appName = 'Admin Console';
  protected readonly navItems = NAV_ITEMS;

  protected readonly isHandset = toSignal(
    this.breakpoint.observe(Breakpoints.Handset).pipe(map((state) => state.matches)),
    { initialValue: false },
  );

  protected readonly sidenavMode = computed<'over' | 'side'>(() =>
    this.isHandset() ? 'over' : 'side',
  );

  protected readonly sidenavOpened = linkedSignal(() => !this.isHandset());

  protected toggleSidenav(): void {
    this.sidenavOpened.update((opened) => !opened);
  }

  protected onNavigate(): void {
    if (this.isHandset()) {
      this.sidenavOpened.set(false);
    }
  }
}
