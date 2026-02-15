import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { baseUrl } from '../services/allurls';
import { LocalStorageService } from '../auth/login/local-storage.service';
import { environment } from 'environments/environment.prod';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class BuyerService {

  baseUrl = environment.baseUrl;

  constructor(
    private http: HttpClient,
    private lService: LocalStorageService,
    private authService: AuthService
  ) { }

  getCategories(token: any): Observable<any[]> {
    const headers = {
      Authorization: `Bearer ${token}`
    };

    // Create an HTTP request with headers
    const options = { headers: new HttpHeaders(headers) };
    return this.http.get<any[]>(`${this.baseUrl}/categories`, options)
  }
  getProductsByCategory(token: any, customIdentifier: string, start: number, limit: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const options = { headers };
    return this.http.get<any>(`${this.baseUrl}/products/by-category/${customIdentifier}?start=${start}&limit=${limit}`, options);
  }
  getProducts(start: number, limit: number, token: any): Observable<{ totalProducts: number, products: any[] }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const options = { headers };
    return this.http.get<{ totalProducts: number, products: any[] }>(`${this.baseUrl}/products?start=${start}&limit=${limit}`, options);
  }

  getProductByCustomIdentifier(customIdentifier: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/product/${customIdentifier}`);
  }

  addProductToCart(productId: string, quantity: number, token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const options = { headers };

    // Optimistic update: instantly reflect the change in the UI
    this.authService.adjustCartCount(quantity);

    return this.http.post<any>(`${this.baseUrl}/addtocart`, { productId, quantity }, options).pipe(
      tap((response: any) => {
        // Correct with actual count from backend response
        if (response && response.items) {
          const itemCount = response.items.reduce((total: number, item: any) => total + item.quantity, 0);
          console.log('[BuyerService] Cart corrected with actual count:', itemCount);
          this.authService.updateCartCount(itemCount);
        } else {
          // Fallback: fetch cart count if response doesn't include items
          console.log('[BuyerService] Fetching cart count as fallback');
          this.authService.fetchCartCount();
        }
      }),
      catchError((error) => {
        // Revert optimistic update on failure
        console.error('[BuyerService] Add to cart failed, reverting optimistic update');
        this.authService.adjustCartCount(-quantity);
        return throwError(() => error);
      })
    );
  }

  getCart(token: any) {
    const headers = {
      Authorization: `Bearer ${token}`
    };

    // Create an HTTP request with headers
    const options = { headers: new HttpHeaders(headers) };
    return this.http.get<any>(`${this.baseUrl}/cart/items`, options);
  }


  checkoutAllItems(token: string, notes: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    const options = { headers };
    return this.http.post(`${this.baseUrl}/cart/checkoutAll`, { notes }, options).pipe(
      tap(() => {
        // Cart is cleared after checkout
        this.authService.updateCartCount(0);
      })
    );
  }

  checkoutSingleItem(productId: string, token: string, notes: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    const options = { headers };
    return this.http.post(`${this.baseUrl}/cart/checkoutSingle`, { productId, notes }, options).pipe(
      tap(() => {
        // Fetch updated cart count after single item checkout
        this.authService.fetchCartCount();
      })
    );
  }

  getUserProfile(token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    const options = { headers };
    return this.http.get(`${this.baseUrl}/userProfile`, options);
  }
  getPurchases(token: any, start: number = 0, limit: number = 20) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    const options = { headers };
    return this.http.get(`${this.baseUrl}/order/items?start=${start}&limit=${limit}`, options);
  }

  deleteCartItem(cartItemId: any, token: any, itemQuantity: number = 1): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const options = {
      headers: headers,
      body: { cartItemId: cartItemId }
    };

    // Optimistic update: instantly reflect the removal in the UI
    this.authService.adjustCartCount(-itemQuantity);

    return this.http.delete(`${this.baseUrl}/cart/item`, options).pipe(
      tap(() => {
        // Confirm with actual count from backend
        console.log('[BuyerService] Cart item deleted, fetching actual count');
        this.authService.fetchCartCount();
      }),
      catchError((error) => {
        // Revert optimistic update on failure
        console.error('[BuyerService] Delete cart item failed, reverting optimistic update');
        this.authService.adjustCartCount(itemQuantity);
        return throwError(() => error);
      })
    );
  }

  // Location API methods (public - no authentication required)
  getAllLocations(): Observable<any> {
    // No authentication headers for public location data
    return this.http.get<any>(`${this.baseUrl}/locations`);
  }

  searchLocations(query: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/locations/search?q=${query}`);
  }

  getCitiesByState(stateCode: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/locations/state/${stateCode}`);
  }

  // Advanced product filtering
  getProductsWithFilters(filters: any, start: number, limit: number, token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    // Build query parameters
    let params = `start=${start}&limit=${limit}`;

    // Always send cities parameter, even if empty (for "All India" filter)
    if (filters.cities !== undefined) {
      if (filters.cities.length > 0) {
        params += `&cities=${filters.cities.join(',')}`;
      } else {
        // Send empty string to indicate "All India" filter
        params += `&cities=`;
      }
    }

    if (filters.states && filters.states.length > 0) {
      params += `&states=${filters.states.join(',')}`;
    }

    if (filters.categories && filters.categories.length > 0) {
      params += `&categories=${filters.categories.join(',')}`;
    }

    if (filters.minPrice !== null && filters.minPrice !== undefined) {
      params += `&minPrice=${filters.minPrice}`;
    }

    if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
      params += `&maxPrice=${filters.maxPrice}`;
    }

    if (filters.condition && filters.condition.length > 0) {
      params += `&condition=${filters.condition.join(',')}`;
    }

    if (filters.brand && filters.brand.length > 0) {
      params += `&brand=${filters.brand.join(',')}`;
    }

    if (filters.businessType && filters.businessType.length > 0) {
      params += `&businessType=${filters.businessType.join(',')}`;
    }

    if (filters.search && filters.search.trim() !== '') {
      params += `&search=${encodeURIComponent(filters.search)}`;
    }

    if (filters.sortBy) {
      params += `&sortBy=${filters.sortBy}`;
    }

    if (filters.sortOrder) {
      params += `&sortOrder=${filters.sortOrder}`;
    }

    // Build query params for product filtering
    const options = { headers };
    return this.http.get<any>(`${this.baseUrl}/products/filter?${params}`, options);
  }

}
