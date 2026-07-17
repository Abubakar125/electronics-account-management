import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'eims_token';
  private readonly USER_KEY = 'eims_user';

  private _token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));
  private _user = signal<User | null>(JSON.parse(localStorage.getItem(this.USER_KEY) || 'null'));

  readonly isAuthenticated = computed(() => !!this._token());
  readonly currentUser = computed(() => this._user());
  readonly token = computed(() => this._token());

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string, rememberMe = false): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, { username, password }).pipe(
      tap(res => {
        if (res.success) {
          this._token.set(res.token);
          this._user.set(res.user);
          localStorage.setItem(this.TOKEN_KEY, res.token);
          localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
          if (!rememberMe) {
            // Token still stored but session awareness
          }
        }
      }),
      catchError(err => throwError(() => err))
    );
  }

  logout(): void {
    this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe();
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/login']);
  }

  changePassword(current_password: string, new_password: string): Observable<any> {
    return this.http.put(`${environment.apiUrl}/auth/change-password`, { current_password, new_password });
  }
}
