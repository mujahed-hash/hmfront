import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { baseUrl } from '../services/allurls';
import { LocalStorageService } from '../auth/login/local-storage.service';
import { environment } from 'environments/environment.prod';
@Injectable({
  providedIn: 'root'
})
export class BuyerService {

  baseUrl = environment.baseUrl;

  constructor(private http: HttpClient, private lService:LocalStorageService) {}
  getCategories(token:any):Observable<any[]> {
    const headers = {
   Authorization: `Bearer ${token}`
 };

 // Create an HTTP request with headers
 const options = { headers: new HttpHeaders(headers) };
 return this.http.get<any[]>(`${this.baseUrl}/categories`, options)
}
  getProductsByCategory(token:any,customIdentifier: string, start: number, limit: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  
    const options = { headers };
    return this.http.get<any>(`${this.baseUrl}/products/by-category/${customIdentifier}?start=${start}&limit=${limit}`, options);
  }
  getProducts(start: number, limit: number, token:any): Observable<{ totalProducts: number, products: any[] }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  
    const options = { headers };
    return this.http.get<{ totalProducts: number, products: any[] }>(`${this.baseUrl}/products?start=${start}&limit=${limit}`, options);
  }
  
  getProductByCustomIdentifier(customIdentifier: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/product/${customIdentifier}`);
  }

  addToCart(productId: string, quantity: number, token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  
    const body = { productId, quantity };
    const options = { headers };
  
    return this.http.post<any>(`${this.baseUrl}/addtocart`, {productId, quantity}, options);
  }

  getCart(token:any){
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
    return this.http.post(`${this.baseUrl}/cart/checkoutAll`, {notes}, options);
  }

  checkoutSingleItem(productId: string, token: string, notes: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    const options = { headers };
    return this.http.post(`${this.baseUrl}/cart/checkoutSingle`, { productId, notes }, options);
  }

  getUserProfile(token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    const options = { headers };    
    return this.http.get(`${this.baseUrl}/userProfile`, options);
  }
  getPurchases(token:any){
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    const options = { headers };    
    return this.http.get(`${this.baseUrl}/order/items`, options);
  }

  // deleteCartItem(cartItemId: any,, token:any): Observable<any> {
  //   const headers = new HttpHeaders({
  //     Authorization: `Bearer ${token}`
  //   });
  //   const options = { headers };    
  //   return this.http.delete(`${this.baseUrl}/cart/item`, cartItemId, options);    ''
  // }

  deleteCartItem(cartItemId: any, token: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    
    const options = {
      headers: headers,
      body: { cartItemId: cartItemId }
    };
    
    return this.http.delete(`${this.baseUrl}/cart/item`, options);
  }
  
}
