import { HttpClient } from '@angular/common/http';
import { Service, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { PegawaiResponse } from '../models/pegawai.model';

const TOKEN_KEY = 'simon_token';

@Service()
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly token = signal<string | null>(this.getInitialToken());
  readonly currentUser = signal<PegawaiResponse | null>(null);
  readonly isAuthenticated = computed(() => !!this.token() && !!this.currentUser());
  readonly isInitialized = signal<boolean>(false);

  private getInitialToken(): string | null {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  }

  public login(req: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/login', req).pipe(
      tap((res) => {
        this.setToken(res.token);
      }),
    );
  }

  public setToken(token: string): void {
    this.token.set(token);
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  }

  public fetchCurrentUser(): Observable<PegawaiResponse> {
    return this.http.get<PegawaiResponse>('/api/me').pipe(
      tap({
        next: (user) => {
          this.currentUser.set(user);
          this.isInitialized.set(true);
        },
        error: () => {
          this.clearSession();
          this.isInitialized.set(true);
        },
      }),
    );
  }

  public logout(): Observable<void> {
    return this.http.post<void>('/api/logout', {}).pipe(
      tap({
        next: () => this.clearSession(),
        error: () => this.clearSession(),
      }),
    );
  }

  public clearSession(): void {
    this.token.set(null);
    this.currentUser.set(null);
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  }
}
