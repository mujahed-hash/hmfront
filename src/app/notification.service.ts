import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment.prod';
import { BehaviorSubject, interval, Observable, switchMap } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth/auth.service';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private socket: Socket;
  private notificationCountSubject = new BehaviorSubject<number>(0); // Notification count
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notificationCount$ = this.notificationCountSubject.asObservable();

  notifications$ = this.notificationsSubject.asObservable();
   private notificationCount = new BehaviorSubject<any>(0); // Holds the current notification count
  // notificationCount$ = this.notificationCount.asObservable(); // Observable for other components
  baseUrl = environment.baseUrl;
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();
  constructor(private http: HttpClient,     public authService: AuthService,
  ) {
    const authToken = localStorage.getItem('token')

    this.socket = io('wss://hotelmart.in',{
      query: { token: authToken }})

      // this.socket = io('http://localhost:3000',{
      //   query: { token: authToken }})
 // WebSocket server URL

 this.socket.on('unreadCountUpdate', (unreadCount: number) => {
  this.unreadCountSubject.next(unreadCount); // Update unread count on UI
});

this.socket.on('notification', (notification: any) => {
  console.log('Received Notification:', notification);
  // Update UI with notification if neededBB
});
}

// Register user with socket server (pass the user ID)
registerUser(userId: string) {
this.socket.emit('register', userId);

}


  

  addNotification(message: string, type: 'success' | 'error' | 'info') {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, { message, type }]);

    setTimeout(() => {
      this.removeNotification();
    }, 3000); // Auto-remove after 3 seconds
  }

  private removeNotification() {
    const currentNotifications = this.notificationsSubject.value;
    currentNotifications.shift();
    this.notificationsSubject.next([...currentNotifications]);
  }
  getNotifications(token:any){
    const headers = {
      Authorization: `Bearer ${token}`
    };
  
    // Create an HTTP request with headers
    const options = { headers: new HttpHeaders(headers) };
   return this.http.get(`${this.baseUrl}/notifications`, options)
  }

    // Fetch unread count
    getUnreadCount(token:any): Observable<{ unreadCount: number }> {
      const headers = {
        Authorization: `Bearer ${token}`
      };
    
      // Create an HTTP request with headers
      const options = { headers: new HttpHeaders(headers) };
      return this.http.get<{ unreadCount: number }>(`${this.baseUrl}/count/unread-count`,options);
    }
  
    startPollingNotifications(token: string) {
      // Polling every 10 seconds for new notifications
      interval(10000)
        .pipe(
          switchMap(() => this.getUnreadCount(token)) // Fetch unread count
        )
        .subscribe(
          (count) => this.notificationCount.next(count), // Update the BehaviorSubject
          (error) => console.error('Error fetching notifications:', error)
        );
    }
      // Register user after login

  connect() {
    this.socket.connect();
    console.log('Connected to WebSocket server');
     // Get the logged-in user ID from the AuthService
     const userId = this.authService.getUserId(); // Replace with actual method to get userId
     
     // Register the user with their userId on the server
     if (userId) {
       this.socket.emit('register', userId);  // Emit userId to the server
       console.log(`User with ID ${userId} registered with WebSocket`);
     }
     else{
      console.log('no user id')
     }
  }
  // Disconnect from WebSocket server
  disconnect() {
    this.socket.disconnect();
    console.log('Disconnected from WebSocket server');
  }

  // Listen for specific events
  on(event: string, callback: any) {
    this.socket.on(event, callback);
  }

  // Emit events to the server
  emit(event: string, data: any) {
    this.socket.emit(event, data);
  }

  // Listen for notifications
  listenForNotifications() {
    this.socket.on('notification', (notification: any) => {
      console.log('New notification received:', notification);
      const currentCount = this.notificationCountSubject.value;
      this.notificationCountSubject.next(currentCount + 1); // Increment notification count
    });
  }

    // Mark all notifications as read
    markAllAsRead(token:any): Observable<any> {
      const headers = {
        Authorization: `Bearer ${token}`
      };
    
      // Create an HTTP request with headers
      const options = { headers: new HttpHeaders(headers) };
      return this.http.put(`${this.baseUrl}/mark-all-read`,null, options);
    }

    getAdminNotifications(token:any) {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });
    
      const options = { headers };
      return this.http.get(`${this.baseUrl}/admin/noitifications`, options);

    }

    getAdminunread(token:any) {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });
    
      const options = { headers };
      return this.http.get<any>(`${this.baseUrl}/admin/count/unread-count`, options)
    }
    markAdminAllAsRead(token:any): Observable<any> {
   const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });
    
      const options = { headers };
      return this.http.put(`${this.baseUrl}/admin/mark-all-read`,null,  options);
    }
}
