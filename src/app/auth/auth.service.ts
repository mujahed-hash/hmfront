import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subscription, Subject } from 'rxjs';
import { tap, takeUntil } from 'rxjs/operators';
import { environment } from 'environments/environment.prod';
import { NotificationService } from '../notification.service';
import { StateService } from '../services/state.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {

  baseUrl = environment.baseUrl;

  // Expose StateService Observable
  cartCount$ = this.stateService.cartCount$;

  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService,
    private stateService: StateService
  ) {
    // Initial sync check
    if (this.isLoggedIn()) {
      this.fetchCartCount();
      // Ensure socket is connected if logged in
      this.notificationService.connect();
    }
  }

  // Delegate update to StateService
  updateCartCount(count: number) {
    this.stateService.updateCartCount(count);
  }

  /** Optimistically adjust cart count by a delta (e.g. +1 on add, -1 on remove) */
  adjustCartCount(delta: number) {
    this.stateService.adjustCartCount(delta);
  }

  ngOnDestroy(): void {
    this.notificationService.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
  }

  login(email: string, password: string): Observable<any> {
    const credentials = { email, password };
    return this.http.post(`${this.baseUrl}/users/login`, credentials).pipe(
      tap((response: any) => {
        localStorage.setItem('token', response.token);
        this.notificationService.connect();
        this.fetchCartCount(response.token);
      })
    );
  }

  getUserProfile(token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get(`${this.baseUrl}/user/userProfile`, { headers });
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCart(token: any) {
    if (!this.isLoggedIn()) {
      return new Observable(observer => {
        observer.next({ success: true, items: [] });
        observer.complete();
      });
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    const options = { headers: headers };
    return this.http.get<any>(`${this.baseUrl}/cart/items`, options);
  }

  // Fetch from API -> Update StateService
  fetchCartCount(token?: any) {
    const authToken = token || localStorage.getItem('token');

    if (!this.isLoggedIn() || !authToken) {
      this.updateCartCount(0);
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${authToken}`
    });
    const options = { headers: headers };

    this.http.get<{ itemCount: number }>(`${this.baseUrl}/cart/count`, options)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          console.log('[AuthService] Cart count fetched:', response.itemCount);
          this.updateCartCount(response.itemCount);
        },
        (error) => {
          console.error('[AuthService] Failed to fetch cart count', error);
          // Don't overwrite state on error, let it persist
        }
      );
  }

  getCurrentCartCount(): number {
    // Helper to get current value from StateService (requires exposing value or subject)
    // For now, assume components subscribe to cartCount$
    return 0; // Deprecated synchronous access
  }

  getUserRole(): 'user' | 'admin' | 'supplier' | 'superadmin' | 'buyer' | null {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const tokenDecode = JSON.parse(atob(token.split('.')[1]));
        if (tokenDecode) {
          if (tokenDecode.isSuperAdmin) return 'superadmin';
          if (tokenDecode.isAdmin) return 'admin';
          if (tokenDecode.isSupplier) return 'supplier';
          if (tokenDecode.isBuyer) return 'buyer';
          if (tokenDecode.userId) return 'user';
        }
      } catch (e) { console.error('Token decode error', e); }
    }
    return null;
  }

  isSuperAdmin(): boolean {
    const role = this.getUserRole();
    return role === 'superadmin';
  }

  getUserId(): string {
    const token = localStorage.getItem('token');
    if (token) {
      const tokenDecode = this.decodeToken(token);
      if (tokenDecode && tokenDecode.userId) {
        return tokenDecode.userId;
      }
    }
    return '';
  }

  private decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      console.error('Error decoding token:', e);
      return null;
    }
  }
  isAdmin(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const decoded = this.decodeToken(token);
      return !!(decoded && (decoded.isAdmin || decoded.isSuperAdmin));
    } catch (e) {
      return false;
    }
  }

  isSupplier(): boolean {
    return this.getUserRole() === 'supplier';
  }

  isBuyer(): boolean {
    return this.getUserRole() === 'buyer';
  }

  logout() {
    localStorage.removeItem('token');
    this.notificationService.disconnect();
    this.stateService.resetCart(); // Reset state
  }
}
