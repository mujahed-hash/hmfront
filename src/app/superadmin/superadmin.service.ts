import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SuperadminService {
  baseUrl = environment.baseUrl;
  
  constructor(private http: HttpClient) { }

  getAllUsersWithPasswords(token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(`${this.baseUrl}/superadmin/users-passwords`, { headers });
  }
  
  // Get known passwords for users
  getKnownPasswords(token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(`${this.baseUrl}/superadmin/known-passwords`, { headers });
  }
  
  // Verify if a password matches for a user
  verifyPassword(token: string, userId: string, password: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post(`${this.baseUrl}/superadmin/verify-password`, { targetUserId: userId, password }, { headers });
  }
  
  // Store plaintext password for admin reference
  storePasswordNote(token: string, userId: string, plaintextPassword: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post(`${this.baseUrl}/superadmin/store-password`, { targetUserId: userId, plaintextPassword }, { headers });
  }

  updateUserPassword(token: string, userId: string, newPassword: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put(`${this.baseUrl}/superadmin/update-password/${userId}`, { password: newPassword }, { headers });
  }

  revokeUserAccess(token: string, userId: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put(`${this.baseUrl}/superadmin/revoke-access/${userId}`, {}, { headers });
  }

  grantUserAccess(token: string, userId: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put(`${this.baseUrl}/superadmin/grant-access/${userId}`, {}, { headers });
  }

  promoteToAdmin(token: string, userId: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put(`${this.baseUrl}/superadmin/promote-admin/${userId}`, {}, { headers });
  }

  demoteAdmin(token: string, userId: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put(`${this.baseUrl}/superadmin/demote-admin/${userId}`, {}, { headers });
  }
}