import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ServiceCategory {
  _id: string;
  name: string;
  description: string;
  icon: string;
  image: string;
  customIdentifier: string;
  isActive: boolean;
  sortOrder: number;
  parentCategory?: any;
  serviceCount?: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceCategoryService {
  private apiUrl = `${environment.baseUrl}/service-categories`;

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    });
  }

  // Get all service categories with optional filtering
  getAllCategories(params?: { active?: boolean, parentCategory?: string }): Observable<ServiceCategory[]> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.active !== undefined) {
        httpParams = httpParams.set('active', params.active.toString());
      }
      
      if (params.parentCategory) {
        httpParams = httpParams.set('parentCategory', params.parentCategory);
      }
    }
    
    return this.http.get<ServiceCategory[]>(this.apiUrl, { 
      params: httpParams,
      headers: this.getAuthHeaders()
    });
  }

  // Get a single category by ID or custom identifier
  getCategory(identifier: string): Observable<ServiceCategory> {
    return this.http.get<ServiceCategory>(`${this.apiUrl}/${identifier}`, { 
      headers: this.getAuthHeaders()
    });
  }

  // Create a new service category
  createCategory(formData: FormData): Observable<ServiceCategory> {
    return this.http.post<ServiceCategory>(this.apiUrl, formData, { 
      headers: this.getAuthHeaders()
    });
  }

  // Update a service category
  updateCategory(identifier: string, formData: FormData): Observable<ServiceCategory> {
    return this.http.put<ServiceCategory>(`${this.apiUrl}/${identifier}`, formData, { 
      headers: this.getAuthHeaders()
    });
  }

  // Delete a service category
  deleteCategory(identifier: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${identifier}`, { 
      headers: this.getAuthHeaders()
    });
  }

  // Get services by category
  getServicesByCategory(identifier: string, params?: { limit?: number, skip?: number, active?: boolean }): Observable<{ total: number, services: any[] }> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.limit !== undefined) {
        httpParams = httpParams.set('limit', params.limit.toString());
      }
      
      if (params.skip !== undefined) {
        httpParams = httpParams.set('skip', params.skip.toString());
      }
      
      if (params.active !== undefined) {
        httpParams = httpParams.set('active', params.active.toString());
      }
    }
    
    return this.http.get<{ total: number, services: any[] }>(`${this.apiUrl}/${identifier}/services`, { 
      params: httpParams,
      headers: this.getAuthHeaders()
    });
  }
}
