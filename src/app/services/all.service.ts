import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { baseUrl } from '../services/allurls';
import { environment } from 'environments/environment.prod';
@Injectable({
  providedIn: 'root'
})
export class AllService {
  baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

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

  getRequirements(token:any): Observable<any> {
     const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  
    const options = { headers };
    return this.http.get(`${this.baseUrl}/request/requirements`,options);
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
 
   const options = { headers };
    return this.http.get(`${this.baseUrl}/request/supplier-completed-products`, options);
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




}
