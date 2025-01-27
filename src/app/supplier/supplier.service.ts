import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { baseUrl } from '../services/allurls';
import { LocalStorageService } from '../auth/login/local-storage.service';
import { AuthService } from '../auth/auth.service';
import { environment } from 'environments/environment.prod';
@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  baseUrl = environment.baseUrl;

  constructor(private http: HttpClient, private lService:LocalStorageService, public authService: AuthService    ) {}



  // Method to fetch supplier products with optional filters
  getSupplierSearched(
    query: string = '',
    minPrice: number | null = null,
    maxPrice: number | null = null,
    start: number = 0,
    limit: number = 10,
    token: any
  ): Observable<any> {
    let params = new HttpParams()
      .set('query', query)
      .set('start', start.toString())
      .set('limit', limit.toString());

    if (minPrice !== null) params = params.set('minPrice', minPrice.toString());
    if (maxPrice !== null) params = params.set('maxPrice', maxPrice.toString());

    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const options = { headers: new HttpHeaders(headers) };

    return this.http.get<any>(`${this.baseUrl}/supplier/products/search`, { params, ...options });
  
  }


  getItems(start: number, limit: number,token:any):Observable<{ totalProducts: number, products: any[] }>{
    const headers = {
      Authorization: `Bearer ${token}`
    };
  
    // Create an HTTP request with headers
    const options = { headers: new HttpHeaders(headers) };
         return this.http.get<{ totalProducts: number, products: any[] }>(`${this.baseUrl}/supplier/items?start=${start}&limit=${limit}`, options);
  }

  // getProducts(start: number, limit: number, token:any): Observable<{ totalProducts: number, products: any[] }> {
  //   const headers = new HttpHeaders({
  //     'Authorization': `Bearer ${token}`
  //   });
  
  //   const options = { headers: headers };
  //   return this.http.get<{ totalProducts: number, products: any[] }>(`${this.baseUrl}/products?start=${start}&limit=${limit}`, options);
  // }
  getProducts(start: number, limit: number): Observable<{ totalProducts: number, products: any[] }> {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('Token is missing');
        return throwError('Token is missing');
    }

    const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
    });

    return this.http.get<{ totalProducts: number, products: any[] }>(
        `${this.baseUrl}/products?start=${start}&limit=${limit}`, 
        { headers }
    );
}
deleteProduct(productId: string, token: string): Observable<any> {
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json' // Set Content-Type to application/json
  });

  // Construct the body with the productId
  const body = { _id: productId };

  return this.http.request<any>('DELETE', `${this.baseUrl}/product/delete`, {
    body: body,
    headers: headers
  });
}

  getProductByCustomIdentifier(customIdentifier: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/product/${customIdentifier}`);
  }
  // Method to update a product by customIdentifier
  // updateProduct(customIdentifier: string, productData: any, files: File[], token:any): Observable<any> {
  //   const formData = new FormData();

  //   // Append product data
  //   Object.keys(productData).forEach(key => {
  //     formData.append(key, productData[key]);
  //   });

  //   // Append files if any
  //   files.forEach(file => {
  //     formData.append('files', file);
  //   });
  //   const headers = {
  //     Authorization: `Bearer ${token}`
  //   };
  
  //   // Create an HTTP request with headers
  //   const options = { headers: new HttpHeaders(headers) };
  //   return this.http.put(`${this.baseUrl}/product/${customIdentifier}`, formData, options);
  // }

  // updateProduct(customIdentifier: string, formData: FormData, token: string | null): Observable<any> {
  //   const headers = new HttpHeaders({
  //     'Authorization': `Bearer ${token}`
  //   });
  
  //   const options = { headers: headers };
  
  //   return this.http.put<any>(`${this.baseUrl}/product/${customIdentifier}`, formData, options);
  // }
  createProduct(productData:FormData, token:any): Observable<any>{
        const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    const options = { headers: headers };
    return this.http.post<any>(`${this.baseUrl}/product`, productData, options);
  }
  updateProduct(productData: FormData, customIdentifier: string, token:any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    const options = { headers: headers };
    return this.http.put<any>(`${this.baseUrl}/product/${customIdentifier}`, productData, options);
  }
  getCategories():Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/categories`)
 }

 getCategory(categoryId:string):Observable<any> {
   return this.http.get<any>(`${this.baseUrl}/${categoryId}`)
}
getPlacedOrders(start: number, limit: number,token:any, status?:any, ):Observable<any>{
      const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    let params = new HttpParams()
    .set('start', start.toString())
    .set('limit', limit.toString());
    const options = { headers: headers, params };
    
    if(this.authService.isAdmin()){
      return this.http.get<any>(`${this.baseUrl}/admin/allorders/Pending?start=${start}&limit=${limit}`, options)

    }
    else{
      return this.http.get<any>(`${this.baseUrl}/supplier/orders/pending?start=${start}&limit=${limit}`, options)

    }
}
getOrdersCount(token:any):Observable<any>{
  const headers = new HttpHeaders({
  'Authorization': `Bearer ${token}`
});

const options = { headers: headers };

  return this.http.get<any>(`${this.baseUrl}/supplier/orderscount`, options)


}
getProductsCount(token:any):Observable<any>{
  const headers = new HttpHeaders({
  'Authorization': `Bearer ${token}`
});

const options = { headers: headers };

  return this.http.get<any>(`${this.baseUrl}/supplier/productscount`, options)


}
getDeliveredOrders(token:any):Observable<any>{
      const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    const options = { headers: headers };
    if(this.authService.isAdmin()){
      return this.http.get<any>(`${this.baseUrl}/admin/allorders/Delivered`, options)
    }
  return this.http.get<any>(`${this.baseUrl}/supplier/orders/delivered`, options)
}
getApprovedOrders(token:any):Observable<any>{
      const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    const options = { headers: headers };
    if(this.authService.isAdmin()){
      return this.http.get<any>(`${this.baseUrl}/admin/allorders/Approved`, options)

    }
  return this.http.get<any>(`${this.baseUrl}/supplier/orders/approved`, options)
} 
getCancelledOrders(token:any):Observable<any>{
  const headers = new HttpHeaders({
  'Authorization': `Bearer ${token}`
});

const options = { headers: headers };
if(this.authService.isAdmin()){
  return this.http.get<any>(`${this.baseUrl}/admin/allorders/Cancelled`, options)

}
return this.http.get<any>(`${this.baseUrl}/supplier/orders/cancelled`, options)
} 
updateOrderStatus(orderId: string,userId: string, newStatus: string, token:any): Observable<any> {
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  const options = { headers: headers };
  return this.http.put(`${this.baseUrl}/supplier/orders/${orderId}/status`, {userId, newStatus }, options);
}
}
