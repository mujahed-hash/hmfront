import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { baseUrl } from '../services/allurls';
import { environment } from 'environments/environment.prod';
@Injectable({
  providedIn: 'root'
})
export class AllService {
  baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  getAllCategories(): Observable<any> {
    return this.http.get(`${this.baseUrl}/categories`);
  }
  
  getServiceCategories(params?: { active?: boolean }): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    let url = `${this.baseUrl}/service-categories`;
    if (params?.active !== undefined) {
      url += `?active=${params.active}`;
    }
    return this.http.get(url, { headers });
  }

  getProducts():Observable<any>{
    return this.http.get(`${this.baseUrl}/products`);
  }
  getUserProfile(token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get(`${this.baseUrl}/userProfile`, { headers });
  }

  Makerequest(note: string, token:any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  
    const options = { headers };
    return this.http.post(`${this.baseUrl}/make-request`, {note}, options);
  }
  postRequirement(reqDetails: string, token:any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  
    const options = { headers };
    return this.http.post(`${this.baseUrl}/request/post-requirement`, {reqDetails}, options);
  }

  getRequirements(token:any, start: number = 0, limit: number = 20): Observable<any> {
     const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const options = { headers };
    return this.http.get(`${this.baseUrl}/request/requirements?start=${start}&limit=${limit}`,options);
  }

  getRequirementById(requirementId: string,token:any): Observable<any> {
     const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  
    const options = { headers };
    return this.http.get(`${this.baseUrl}/${requirementId}`,options);
  }

  forwardRequirementToSuppliers(requirementId: string, supplierIds: string[],token:any): Observable<any> {
     const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  
    const options = { headers };
    return this.http.post(`${this.baseUrl}/request/forward`, { requirementId, supplierIds },options);
  }

  // Method to get forwarded requirements for the supplier
  getForwardedRequirementsToSupplier(token:any): Observable<any> {
    const headers = new HttpHeaders({
     Authorization: `Bearer ${token}`
   });
 
   const options = { headers };
    return this.http.get<any>(`${this.baseUrl}/request/requirements/for-sup`, options);
  }

  // Get requirement by customIdentifier
  getRequirementByCustomIdentifier(customIdentifier: string, token:any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  
    const options = { headers };
    return this.http.get<any>(`${this.baseUrl}/request/forwarded-requirement/${customIdentifier}`, options);
  }
  getRequirementByIdentifier(customIdentifier: string, token:any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  
    const options = { headers };
    return this.http.get(`${this.baseUrl}/request/requirement/${customIdentifier}`, options);
}

  forwardProductInfoToBuyer(requirementId: string,token:any): Observable<any> {
     const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  
    const options = { headers };
    return this.http.post(`${this.baseUrl}/request/forward-to-buyer`, { requirementId }, options);
  }

  selectProductForDelivery(requirementId: string, productId: string, token:any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  
    const options = { headers };
    return this.http.post(`${this.baseUrl}/request/select-product`, { requirementId, productId }, options);
  }
  requestDelivery(data: { requirementId: string, submissionId: string }, token:any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  
    const options = { headers };
    return this.http.post(`${this.baseUrl}/request/request-delivery`, data, options);
  }
  
  completeRequirement(requirementId: string,token:any): Observable<any> {
     const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  
    const options = { headers };
    return this.http.put(`${this.baseUrl}/request/complete/${requirementId}`, {},options);
  }

  getCompletedProductsForSupplier(token:any): Observable<any> {
    const headers = new HttpHeaders({
     Authorization: `Bearer ${token}`
   });
    return this.http.get(`${this.baseUrl}/request/supplier-deliveries`, { headers });
  }


  getNotifications(userId: string,token:any): Observable<any> {
     const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  
    const options = { headers };
    return this.http.get(`${this.baseUrl}/${userId}`,options);
  }


  // requirement.service.ts
postProductInfo(requirementId: string,name: string,  price: number, productImage: File,token:any): Observable<any> {
   const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  
    const options = { headers };
  const formData = new FormData();
  formData.append('requirementId', requirementId);
  formData.append('price', price.toString());
  formData.append('name', name);
  formData.append('image', productImage);

  return this.http.post(`${this.baseUrl}/request/product-info`, formData, options);
}

// Services methods
getAllServices(): Observable<any> {
  // Add authentication headers
  const token = localStorage.getItem('token');
  const headers = token ? new HttpHeaders({
    'Authorization': `Bearer ${token}`
  }) : undefined;
  
  return this.http.get(`${this.baseUrl}/services`, { headers });
}

// Get only active and approved services for all-services page
getActiveServices(params?: { search?: string, categoryCustomIdentifier?: string, region?: string, start?: number, limit?: number }): Observable<any> {
  // Add authentication headers
  const token = localStorage.getItem('token');
  const headers = token ? new HttpHeaders({
    'Authorization': `Bearer ${token}`
  }) : undefined;
  
  let queryParams = '';
  if (params) {
    const queryArray = [];
    if (params.search) queryArray.push(`search=${encodeURIComponent(params.search)}`);
    if (params.categoryCustomIdentifier) queryArray.push(`categoryCustomIdentifier=${params.categoryCustomIdentifier}`);
    if (params.region) queryArray.push(`region=${encodeURIComponent(params.region)}`);
    if (params.start !== undefined) queryArray.push(`start=${params.start}`);
    if (params.limit !== undefined) queryArray.push(`limit=${params.limit}`);
    
    if (queryArray.length > 0) {
      queryParams = '?' + queryArray.join('&');
    }
  }
  
  const fullUrl = `${this.baseUrl}/services/active${queryParams}`;
  console.log('Making request to:', fullUrl);
  console.log('Headers:', headers);
  console.log('Params being sent:', params);
  return this.http.get(`${this.baseUrl}/services/active${queryParams}`, { headers });
}

getServiceByIdentifier(customIdentifier: string): Observable<any> {
  // Add authentication headers
  const token = localStorage.getItem('token');
  const headers = token ? new HttpHeaders({
    'Authorization': `Bearer ${token}`
  }) : undefined;
  
  return this.http.get(`${this.baseUrl}/services/${customIdentifier}`, { headers });
}

// Get all unique regions from active services
getAllRegions(): Observable<any> {
  // Add authentication headers
  const token = localStorage.getItem('token');
  const headers = token ? new HttpHeaders({
    'Authorization': `Bearer ${token}`
  }) : undefined;
  
  console.log('Fetching all regions from backend...');
  return this.http.get(`${this.baseUrl}/services/regions`, { headers });
}

// Get services by category
getServicesByCategory(categoryId: string): Observable<any> {
  // Add authentication headers
  const token = localStorage.getItem('token');
  const headers = token ? new HttpHeaders({
    'Authorization': `Bearer ${token}`
  }) : undefined;
  
  return this.http.get(`${this.baseUrl}/service-categories/${categoryId}/services`, { headers });
}

// Create a service order
createServiceOrder(orderData: any): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  
  return this.http.post(`${this.baseUrl}/service-orders`, orderData, { headers });
}

// Get user's service orders
getUserServiceOrders(token: string, start: number = 0, limit: number = 20): Observable<any> {
  console.log('🔵 AllService.getUserServiceOrders called with:', { start, limit });
  console.log('🔵 Token provided:', !!token);
  
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  
  const params = new HttpParams()
    .set('start', start.toString())
    .set('limit', limit.toString());
  
  const url = `${this.baseUrl}/service-orders/user`;
  console.log('🔵 Making request to:', url);
  console.log('🔵 With params:', { start: start.toString(), limit: limit.toString() });
  console.log('🔵 With headers:', headers);
  
  return this.http.get(url, { headers, params }).pipe(
    tap(response => console.log('🔵 HTTP Response received:', response)),
    catchError(error => {
      console.error('🔵 HTTP Error occurred:', error);
      throw error;
    })
  );
}

// Get supplier's service orders
getSupplierServiceOrders(token: string): Observable<any> {
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  
  return this.http.get(`${this.baseUrl}/service-orders/supplier`, { headers });
}

// Get a single service order by customIdentifier
getServiceOrderById(customIdentifier: string, token: string): Observable<any> {
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  
  return this.http.get(`${this.baseUrl}/service-orders/${customIdentifier}`, { headers });
}

// Add a message to a service order's conversation
addMessageToServiceOrder(customIdentifier: string, message: string, newStatus: string | null, token: string): Observable<any> {
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  const body: any = { message };
  if (newStatus) {
    body.newStatus = newStatus;
  }
  return this.http.post(`${this.baseUrl}/service-orders/${customIdentifier}/message`, body, { headers });
}

// Update service order status
updateServiceOrderStatus(customIdentifier: string, status: string, token: string): Observable<any> {
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  
  return this.http.put(`${this.baseUrl}/service-orders/${customIdentifier}/status`, { status }, { headers });
}

// Cancel a service order
cancelServiceOrder(customIdentifier: string, token: string): Observable<any> {
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  
  return this.http.put(`${this.baseUrl}/service-orders/${customIdentifier}/cancel`, {}, { headers });
}

}
