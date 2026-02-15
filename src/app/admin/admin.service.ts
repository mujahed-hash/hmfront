import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { baseUrl } from '../services/allurls';
import { environment } from 'environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) { }

  // Get all requested submissions
  search(query: string, model: string, start: number = 0, limit: number = 10, token: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    const params = new HttpParams()
      .set('query', query)
      .set('model', model)
      .set('start', start.toString())
      .set('limit', limit.toString());
    // Pass both params and headers inside options
    const options = { headers, params };
    return this.http.get<any>(`${this.baseUrl}/admin/search`, options);
  }
  // Method to delete a document by model and ID
  deleteDocumentByModelAndId(model: string, id: string, token: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    // Include both headers and body within the options object
    return this.http.request<any>('delete', `${this.baseUrl}/admin/doc/delete`, {
      headers: headers,
      body: { model, id }
    });
  }

  getUsersRequirement(token: any): Observable<any[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const options = { headers: headers };

    return this.http.get<any[]>(`${this.baseUrl}/see-requests`, options);
  }
  getRequestedSubmissions(token: any): Observable<any[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const options = { headers: headers };
    return this.http.get<any[]>(`${this.baseUrl}/request/requested-submissions`, options);
  }
  getCompletedProductsForAdmin(token: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const options = { headers };
    return this.http.get(`${this.baseUrl}/request/admin-completed-products`, options);
  }
  // Confirm a delivery
  confirmDelivery(submissionId: string, token: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const options = { headers: headers };
    return this.http.post(`${this.baseUrl}/request/confirm-delivery`, { submissionId }, options);
  }
  updateDelivery(requirementId: string, submissionId: string, token: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const options = { headers: headers };
    return this.http.post(`${this.baseUrl}/request/delivery-update`, { requirementId, submissionId }, options);
  }
  getAllRequirements(token: any): Observable<any[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const options = { headers: headers };

    return this.http.get<any[]>(`${this.baseUrl}/request/all-requirements`, options);
  }

  forwardRequirement(requirementId: any, token: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const options = { headers: headers };

    return this.http.post<any>(`${this.baseUrl}/request/forward-requirement`, { requirementId }, options);
  }


  // Fetch all product submissions for admin
  getProductSubmissions(token: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const options = { headers: headers };
    return this.http.get(`${this.baseUrl}/request/all-product-submissions`, options);
  }

  // Forward product submission to a requirement
  forwardProductSubmission(submissionId: string, requirementId: string, token: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const options = { headers: headers };
    return this.http.post(`${this.baseUrl}/request/forward-product-submission`, { submissionId, requirementId }, options);
  }
  getOrdersCountAdmin(token: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const options = { headers: headers };

    return this.http.get<any>(`${this.baseUrl}/admin/orderscount`, options)


  }
  getProductsCountAdmin(token: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const options = { headers: headers };

    return this.http.get<any>(`${this.baseUrl}/admin/productscount`, options)


  }
  getUsersCountAdmin(token: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const options = { headers: headers };

    return this.http.get<any>(`${this.baseUrl}/admin/users-count`, options)


  }
  /// products
  getProductsAll(start: number, limit: number, token: any): Observable<{ totalProducts: number, products: any[] }> {
    const headers = {
      Authorization: `Bearer ${token}`
    };

    // Create an HTTP request with headers
    const options = { headers: new HttpHeaders(headers) };
    return this.http.get<{ totalProducts: number, products: any[] }>(`${this.baseUrl}/admin/allitems?start=${start}&limit=${limit}`, options);
  }


  /// orders
  getOrdersAll(start: number, limit: number, token: any): Observable<{ totalOrders: number, orders: any[] }> {
    const headers = {
      Authorization: `Bearer ${token}`
    };

    // Create an HTTP request with headers
    const options = { headers: new HttpHeaders(headers) };
    return this.http.get<{ totalOrders: number, orders: any[] }>(`${this.baseUrl}/admin/orders?start=${start}&limit=${limit}`, options);
  }
  getOrder(token: any) {
    const headers = {
      Authorization: `Bearer ${token}`
    };

    // Create an HTTP request with headers
    const options = { headers: new HttpHeaders(headers) };
    return this.http.get<any>(`${this.baseUrl}/order/:customIdentifier`, options);
  }

  getSystemStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/monitoring/stats`);
  }

  clearCache(): Observable<any> {
    return this.http.post(`${this.baseUrl}/monitoring/clear-cache`, {});
  }

  // users
  getUsers(token: any) {
    const headers = {
      Authorization: `Bearer ${token} `
    };

    // Create an HTTP request with headers
    const options = { headers: new HttpHeaders(headers) };
    return this.http.get<any>(`${this.baseUrl} /users/all`, options);

  }
  getUserByCID(customIdentifier: any, token: any) {
    const headers = {
      Authorization: `Bearer ${token} `
    };

    // Create an HTTP request with headers
    const options = { headers: new HttpHeaders(headers) };
    return this.http.get<any>(`${this.baseUrl} /user/${customIdentifier} `, options);
  }
  addUser(FormData: any, token: any) {
    const headers = {
      Authorization: `Bearer ${token} `
    };
    const options = { headers: new HttpHeaders(headers) };

    return this.http.post<any>(`${this.baseUrl} /user/signup`, FormData, options);

    // Create an HTTP request with headers
  }
  updateUser(customIdentifier: any, formData: any, token: any) {
    const headers = {
      Authorization: `Bearer ${token} `
    };
    const options = { headers: new HttpHeaders(headers) };

    return this.http.put<any>(`${this.baseUrl} /updateuser/${customIdentifier} `, formData, options);

    // Create an HTTP request with headers
  }

  //categories
  getCategories(token: any): Observable<any[]> {
    const headers = {
      Authorization: `Bearer ${token} `
    };

    // Create an HTTP request with headers
    const options = { headers: new HttpHeaders(headers) };
    return this.http.get<any[]>(`${this.baseUrl}/categories`, options)
  }

  getCategory(categoryId: string, token: any): Observable<any> {
    const headers = {
      Authorization: `Bearer ${token}`
    };

    // Create an HTTP request with headers
    const options = { headers: new HttpHeaders(headers) };
    return this.http.get<any>(`${this.baseUrl}/${categoryId}`, options)
  }

  postCategory(catData: FormData, token: any) {
    const headers = {
      Authorization: `Bearer ${token}`
    };

    // Create an HTTP request with headers
    const options = { headers: new HttpHeaders(headers) };
    return this.http.post<any>(`${this.baseUrl}/category`, catData, options);

  }

  // Update a category by ID
  updateCategory(id: string, catData: FormData, token?: any): Observable<any> {
    const headers = {
      Authorization: `Bearer ${token}`
    };

    // Create an HTTP request with headers
    const options = { headers: new HttpHeaders(headers) };
    return this.http.put(`${this.baseUrl}/category/${id}`, catData, options);
  }
  deleteCategory(id: any, token: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const options = {
      headers: headers,
      body: { id } // Include the id in the request body
    };

    return this.http.delete<any>(`${this.baseUrl}/category/delete-category`, options);
  }

  getCategoryById(id: string) {
    return this.http.get<any>(`${this.baseUrl}/category/${id}`);

  }
}
