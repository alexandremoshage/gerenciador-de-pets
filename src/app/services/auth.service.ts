import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthRequest } from '../models/auth-request.model';
import { AuthResponse } from '../models/auth-response.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/autenticacao`;
  private readonly ACCESS_KEY = 'access_token';
  private readonly REFRESH_KEY = 'refresh_token';
  private readonly ACCESS_EXP = 'access_token_exp';
  private readonly REFRESH_EXP = 'refresh_token_exp';

  constructor(private http: HttpClient) {}

  login(credentials: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(res => this.saveTokens(res))
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const refresh = this.getRefreshToken();
    return this.http.put<AuthResponse>(`${this.API_URL}/refresh`, { refresh_token: refresh }).pipe(
      tap(res => this.saveTokens(res))
    );
  }

  private saveTokens(tokens: AuthResponse): void {
    const now = Date.now();
    localStorage.setItem(this.ACCESS_KEY, tokens.access_token);
    localStorage.setItem(this.REFRESH_KEY, tokens.refresh_token);
    if (tokens.expires_in) {
      localStorage.setItem(this.ACCESS_EXP, String(now + tokens.expires_in * 1000));
    }
    if (tokens.refresh_expires_in) {
      localStorage.setItem(this.REFRESH_EXP, String(now + tokens.refresh_expires_in * 1000));
    }
  }

  getAccessToken(): string | null {
    const token = localStorage.getItem(this.ACCESS_KEY);
    const exp = localStorage.getItem(this.ACCESS_EXP);
    if (!token) return null;
    if (exp) {
      const expNum = Number(exp);
      if (Date.now() > expNum) return null;
    }
    return token;
  }

  getRefreshToken(): string | null {
    const token = localStorage.getItem(this.REFRESH_KEY);
    const exp = localStorage.getItem(this.REFRESH_EXP);
    if (!token) return null;
    if (exp) {
      const expNum = Number(exp);
      if (Date.now() > expNum) return null;
    }
    return token;
  }

  logout(): void {
    localStorage.removeItem(this.ACCESS_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.ACCESS_EXP);
    localStorage.removeItem(this.REFRESH_EXP);
  }
}