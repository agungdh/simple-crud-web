import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-page">
      <mat-card class="login-card" appearance="outlined">
        <mat-card-header class="login-card__header">
          <div mat-card-avatar class="login-card__avatar">
            <mat-icon aria-hidden="true">admin_panel_settings</mat-icon>
          </div>
          <mat-card-title>SIMON-JP</mat-card-title>
          <mat-card-subtitle>Sistem Informasi Monitoring Jam Pelatihan</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content class="login-card__content">
          @if (errorMessage()) {
            <div class="login-error" role="alert">
              <mat-icon aria-hidden="true">error_outline</mat-icon>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="login-form">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Username / NIP</mat-label>
              <input
                matInput
                type="text"
                formControlName="username"
                autocomplete="username"
                placeholder="Masukkan username atau NIP"
                required
              />
              <mat-icon matPrefix aria-hidden="true">person</mat-icon>
              @if (form.controls.username.hasError('required') && form.controls.username.touched) {
                <mat-error>Username wajib diisi</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Password</mat-label>
              <input
                matInput
                [type]="hidePassword() ? 'password' : 'text'"
                formControlName="password"
                autocomplete="current-password"
                placeholder="Masukkan password"
                required
              />
              <mat-icon matPrefix aria-hidden="true">lock</mat-icon>
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="hidePassword.set(!hidePassword())"
                [attr.aria-label]="hidePassword() ? 'Tampilkan password' : 'Sembunyikan password'"
              >
                <mat-icon aria-hidden="true">{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.controls.password.hasError('required') && form.controls.password.touched) {
                <mat-error>Password wajib diisi</mat-error>
              }
            </mat-form-field>

            <button
              mat-flat-button
              color="primary"
              type="submit"
              class="login-submit"
              [disabled]="form.invalid || isLoading()"
            >
              @if (isLoading()) {
                <mat-spinner diameter="20" class="login-spinner" />
                <span>Memproses...</span>
              } @else {
                <span>Masuk</span>
              }
            </button>
          </form>

          <div class="demo-box">
            <div class="demo-box__header">
              <mat-icon aria-hidden="true">info</mat-icon>
              <strong>Kredensial Demo:</strong>
            </div>
            <p>Username: <code>199701012022031001</code> / <code>admin</code></p>
            <p>Password: <code>password123</code></p>
            <button mat-stroked-button type="button" (click)="fillDemoCredentials()" class="demo-box__btn">
              Gunakan Akun Demo
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    .login-page {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 16px;
      background: linear-gradient(135deg, #f0f4f9 0%, #e2ebf6 100%);
    }
    .login-card {
      width: 100%;
      max-width: 420px;
      border-radius: 16px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
      padding: 12px;
      background-color: #ffffff;
    }
    .login-card__header {
      margin-bottom: 24px;
      align-items: center;
    }
    .login-card__avatar {
      background-color: #0b57d0;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .w-full {
      width: 100%;
    }
    .login-submit {
      height: 48px;
      font-size: 1rem;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 8px;
    }
    .login-error {
      display: flex;
      align-items: center;
      gap: 8px;
      background-color: #fce8e6;
      color: #c5221f;
      padding: 10px 14px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 0.875rem;
    }
    .demo-box {
      margin-top: 24px;
      padding: 14px;
      background-color: #f8f9fa;
      border: 1px dashed #dadce0;
      border-radius: 8px;
      font-size: 0.825rem;
      color: #3c4043;
    }
    .demo-box__header {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 6px;
      color: #1a73e8;
    }
    .demo-box p {
      margin: 4px 0;
    }
    .demo-box code {
      background: #e8eaed;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
    }
    .demo-box__btn {
      width: 100%;
      margin-top: 8px;
      font-size: 0.8rem;
    }
  `,
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly hidePassword = signal(true);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  protected fillDemoCredentials(): void {
    this.form.patchValue({
      username: '199701012022031001',
      password: 'password123',
    });
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { username, password } = this.form.getRawValue();

    this.authService.login({ username, password }).subscribe({
      next: () => {
        this.authService.fetchCurrentUser().subscribe({
          next: () => {
            this.isLoading.set(false);
            this.router.navigate(['/dashboard']);
          },
          error: () => {
            this.isLoading.set(false);
            this.router.navigate(['/dashboard']);
          },
        });
      },
      error: (err: { error?: { message?: string } }) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Login gagal, periksa kembali username dan password Anda');
      },
    });
  }
}
