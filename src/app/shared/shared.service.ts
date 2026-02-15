import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { baseUrl } from '../services/allurls';
import { environment } from 'environments/environment.prod';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StateService } from '../services/state.service';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  baseUrl = environment.baseUrl;

  constructor(private http: HttpClient, private snackBar: MatSnackBar, private stateService: StateService) { }

  // Expose StateService Cart Observable directly
  cartCount$ = this.stateService.cartCount$;

  updateCartCount(count: number) {
    console.log('[SharedService] Cart count update request:', count);
    this.stateService.updateCartCount(count);
  }

  getOrderAS(customIdentifier: any, token: any) {
    const headers = {
      Authorization: `Bearer ${token}`
    };

    // Create an HTTP request with headers
    const options = { headers: new HttpHeaders(headers) };
    return this.http.get<any>(`${this.baseUrl}/order/${customIdentifier}`, options);
  }

  searchProducts(query: string, start: number = 0, limit: number = 10, token: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const params = new HttpParams()
      .set('query', query)
      .set('start', start.toString())
      .set('limit', limit.toString());

    // Pass both params and headers inside options
    const options = { headers, params };

    return this.http.get(`${this.baseUrl}/products/search`, options);
  }

  showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [`notification-${type}`]
    });
  }
}
