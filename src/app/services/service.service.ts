import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http'; // Import HttpHeaders
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; // Corrected path assuming environments is at src/environments

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private apiUrl = `${environment.baseUrl}/services`; // Changed environment.apiUrl to environment.baseUrl

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
      });
    } else {
      return new HttpHeaders(); // Return empty headers if no token
    }
  }

  // Create a new service
  createService(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData, { headers: this.getAuthHeaders() });
  }

  // Get all services with optional query parameters for filtering and pagination
  getAllServices(queryParams?: any): Observable<any> {
    let params = new HttpParams();
    if (queryParams) {
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] !== null && queryParams[key] !== undefined) {
          params = params.set(key, queryParams[key].toString());
        }
      });
    }
    return this.http.get<any>(`${this.apiUrl}`, { params, headers: this.getAuthHeaders() });
  }

  // Get a single service by custom identifier
  getServiceByCustomIdentifier(customIdentifier: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${customIdentifier}`, { headers: this.getAuthHeaders() });
  }

  // Update an existing service
  updateService(customIdentifier: string, formData: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${customIdentifier}`, formData, { headers: this.getAuthHeaders() });
  }

  // Delete a service
  deleteService(customIdentifier: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${customIdentifier}`, { headers: this.getAuthHeaders() });
  }

  // Approve a service (admin/superadmin only)
  approveService(customIdentifier: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/approve/${customIdentifier}`, {}, { headers: this.getAuthHeaders() });
  }

  // Toggle service active status (admin/superadmin only)
  toggleServiceStatus(customIdentifier: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/toggle-status/${customIdentifier}`, {}, { headers: this.getAuthHeaders() });
  }

  // Get supplier service orders with pagination
  getSupplierServiceOrders(start: number, limit: number): Observable<any> {
    const params = new HttpParams()
      .set('start', start.toString())
      .set('limit', limit.toString());
    return this.http.get<any>(`${this.apiUrl.replace('/services', '/service-orders')}/supplier`, { params, headers: this.getAuthHeaders() });
  }

  // Update service order status
  updateServiceOrderStatus(customIdentifier: string, status: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl.replace('/services', '/service-orders')}/${customIdentifier}/status`, { status }, { headers: this.getAuthHeaders() });
  }

  // Get a single service order by custom identifier (for supplier)
  getSupplierServiceOrderById(customIdentifier: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl.replace('/services', '/service-orders')}/${customIdentifier}`, { headers: this.getAuthHeaders() });
  }

  // Add message to service order conversation
  addMessageToServiceOrder(customIdentifier: string, messageData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl.replace('/services', '/service-orders')}/${customIdentifier}/message`, messageData, { headers: this.getAuthHeaders() });
  }
}
