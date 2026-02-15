import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class AdminServiceOrderService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // Get all service orders with filtering and pagination
  getAllServiceOrders(params: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = this.getHeaders(token!);

    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });

    return this.http.get<any>(`${this.baseUrl}/admin/service-orders`, {
      headers,
      params: httpParams
    });
  }

  // Get service order statistics
  getServiceOrderStats(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = this.getHeaders(token!);

    return this.http.get<any>(`${this.baseUrl}/admin/service-orders/stats`, {
      headers
    });
  }

  // Get single service order by customIdentifier
  getServiceOrderById(customIdentifier: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = this.getHeaders(token!);

    return this.http.get<any>(`${this.baseUrl}/admin/service-orders/${customIdentifier}`, {
      headers
    });
  }

  // Update service order
  updateServiceOrder(orderId: string, updateData: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = this.getHeaders(token!);

    return this.http.put<any>(`${this.baseUrl}/admin/service-orders/${orderId}`, updateData, {
      headers
    });
  }

  // Delete service order
  deleteServiceOrder(orderId: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = this.getHeaders(token!);

    return this.http.delete<any>(`${this.baseUrl}/admin/service-orders/${orderId}`, {
      headers
    });
  }

  // Cancel service order by admin
  cancelServiceOrder(orderId: string, cancellationData: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = this.getHeaders(token!);

    return this.http.put<any>(`${this.baseUrl}/admin/service-orders/${orderId}/cancel`, cancellationData, {
      headers
    });
  }

  // Get service orders by status
  getServiceOrdersByStatus(status: string, params: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = this.getHeaders(token!);

    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });

    return this.http.get<any>(`${this.baseUrl}/admin/service-orders/status/${status}`, {
      headers,
      params: httpParams
    });
  }

  // Add a message to a service order's conversation
  addMessageToServiceOrder(orderId: string, messageData: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = this.getHeaders(token!);

    return this.http.post<any>(`${this.baseUrl}/admin/service-orders/${orderId}/message`, messageData, {
      headers
    });
  }

  // Bulk update service orders
  bulkUpdateServiceOrders(orderIds: string[], updates: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = this.getHeaders(token!);

    return this.http.put<any>(`${this.baseUrl}/admin/service-orders/bulk-update`, {
      orderIds,
      updates
    }, {
      headers
    });
  }
}
