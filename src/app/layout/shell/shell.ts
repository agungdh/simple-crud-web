import { Component, computed, inject, linkedSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconButton, MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatListItem, MatListItemIcon, MatListItemTitle, MatNavList } from '@angular/material/list';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatToolbar } from '@angular/material/toolbar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { map } from 'rxjs/operators';
import { NAV_ITEMS } from '../nav-items';
import { PageTitle } from '../page-title';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';

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
    MatButtonModule,
    MatNavList,
    MatListItem,
    MatListItemIcon,
    MatListItemTitle,
    MatDialogModule,
  ],
})
export class Shell {
  private readonly breakpoint = inject(BreakpointObserver);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  protected readonly authService = inject(AuthService);
  protected readonly pageTitle = inject(PageTitle);

  protected readonly appName = 'SIMON-JP';
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

  protected onLogout(): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Keluar dari Sistem',
        message: 'Apakah Anda yakin ingin keluar dari SIMON-JP?',
        confirmLabel: 'Keluar',
        isDestructive: false,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.authService.logout().subscribe({
        next: () => this.router.navigate(['/login']),
        error: () => this.router.navigate(['/login']),
      });
    });
  }
}
