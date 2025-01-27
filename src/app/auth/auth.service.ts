import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { baseUrl } from '../services/allurls';
import { environment } from 'environments/environment.prod';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  baseUrl = environment.baseUrl;
  private cartCountSubject = new BehaviorSubject<number>(0); // Holds the current cart count
  cartCount$ = this.cartCountSubject.asObservable(); // Expose it as an observable
  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    const credentials = { email, password };
    return this.http.post(`${this.baseUrl}/user/login`, credentials).pipe(
      tap((response: any) => {
        localStorage.setItem('token', response.token);
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

  getCart(token:any){
    const headers = {
      Authorization: `Bearer ${token}`
    };
  
    // Create an HTTP request with headers
    const options = { headers: new HttpHeaders(headers) };
    return this.http.get<any>(`${this.baseUrl}/cart/items`, options);
  }
  fetchCartCount(token:any){
    const headers = {
      Authorization: `Bearer ${token}`
    };
  
    // Create an HTTP request with headers
    const options = { headers: new HttpHeaders(headers) };
    this.http.get<{ itemCount: number }>(`${this.baseUrl}/cart/count`, options).subscribe(
      (response) => {
        this.cartCountSubject.next(response.itemCount); // Update the BehaviorSubject
      },
      (error) => {
        console.error('Failed to fetch cart count', error);
      }
    );
  }

  getUserRole(): string {
    const token = localStorage.getItem('token');
    if (token) {
      const tokenDecode = JSON.parse(atob(token.split('.')[1]));
      if (tokenDecode) {
        if (tokenDecode.isAdmin) return 'admin';
        if (tokenDecode.isSupplier) return 'supplier';
        if (tokenDecode.isBuyer) return 'buyer';
        if(tokenDecode.userId) return tokenDecode.userId;
      }
    }
    return '';
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
    return this.getUserRole() === 'admin';
  }

  isSupplier(): boolean {
    return this.getUserRole() === 'supplier';
  }

  isBuyer(): boolean {
    return this.getUserRole() === 'buyer';
  }

  logout() {
    localStorage.removeItem('token');
  }
}
