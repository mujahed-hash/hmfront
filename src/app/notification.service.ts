import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { environment } from 'environments/environment.prod';
import { BehaviorSubject, Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { SharedService } from './shared/shared.service';
import { StateService } from './services/state.service';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private socket: any = null;
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);

  notifications$ = this.notificationsSubject.asObservable();
  baseUrl = environment.baseUrl;
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(
    private http: HttpClient,
    private sharedService: SharedService,
    private stateService: StateService,
    private ngZone: NgZone
  ) {
    // Initialize Push Notifications
    this.initPushNotifications();
  }

  // Connect to Socket.IO Server
  connect() {
    console.log('[NotificationService] Attempting to connect...');
    const authToken = localStorage.getItem('token');

    if (!authToken) {
      console.warn('[NotificationService] Cannot connect: No token found in localStorage.');
      return;
    }

    // Check if socket exists
    if (this.socket) {
      if (this.socket.connected) {
        console.log('[NotificationService] Socket is already connected (ID: ' + this.socket.id + '). Skipping new connection.');
        return;
      } else {
        console.log('[NotificationService] Socket instance exists but is disconnected. Cleaning up...');
        this.socket.off(); // Remove all listeners
        this.socket.disconnect();
        this.socket = null;
      }
    }

    const socketUrl = environment.baseUrl.replace('/api', '');
    console.log('[NotificationService] Connecting to WebSocket URL:', socketUrl);

    try {
      this.socket = io(socketUrl, {
        query: { token: authToken },
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionAttempts: 5
      });
    } catch (err) {
      console.error('[NotificationService] Error creating socket instance:', err);
      return;
    }

    // 1. Unread Notification Count Update
    this.socket.on('unreadCountUpdate', (unreadCount: number) => {
      console.log('[NotificationService] Received unreadCountUpdate:', unreadCount);
      this.ngZone.run(() => {
        this.unreadCountSubject.next(unreadCount);
      });
    });

    // 2. New Notification Received
    this.socket.on('notification', (notification: any) => {
      console.log('[NotificationService] Received notification event:', notification);
      this.ngZone.run(() => {
        this.addNotification(notification.message, notification.type || 'info');
      });
    });

    // 3. Cart Count Update
    this.socket.on('cartCountUpdate', (count: number) => {
      console.log('[NotificationService] Received cartCountUpdate:', count);
      this.ngZone.run(() => {
        this.stateService.updateCartCount(count);
      });
    });

    this.socket.on('connect', () => {
      console.log('[NotificationService] Socket connected successfully! ID:', this.socket.id);
      this.ngZone.run(() => {
        const userId = this.getUserIdFromToken();
        if (userId) {
          console.log('[NotificationService] Registering user ID with socket:', userId);
          this.socket.emit('register', userId);


        } else {
          console.warn('[NotificationService] Connected but could not extract User ID from token');
        }
      });
    });

    this.socket.on('disconnect', (reason: any) => {
      console.warn('[NotificationService] Socket disconnected. Reason:', reason);
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('[NotificationService] Socket connection error:', error);
    });

    this.socket.connect();
  }

  // Disconnect from WebSocket server
  disconnect() {
    if (this.socket) {
      console.log('[NotificationService] Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Register user with socket server
  registerUser(userId: string) {
    if (this.socket && this.socket.connected) {
      console.log('[NotificationService] Manually registering user:', userId);
      this.socket.emit('register', userId);
    } else {
      console.warn('[NotificationService] Cannot manually register user: Socket not connected');
    }
  }

  private async initPushNotifications() {
    if (!Capacitor.isNativePlatform()) {
      return; // Skip push notifications on web
    }

    try {
      const result = await PushNotifications.requestPermissions();

      if (result.receive === 'granted') {
        await PushNotifications.register();
      } else {
        console.warn('Push notification permission denied');
        return;
      }

      PushNotifications.addListener('registration', (token) => {
        this.saveFcmTokenToBackend(token.value);
      });

      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Push notification registration error:', error?.message || error);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification: any) => {
        this.addNotification(notification.title || 'New Notification', 'info');
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (notification: any) => {
        // TODO: Handle navigation based on notification data
      });
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
    }
  }

  private saveFcmTokenToBackend(fcmToken: string) {
    console.log('[FRONTEND] saveFcmTokenToBackend called with fcmToken:', fcmToken);
    const userId = this.getUserIdFromToken();
    const authToken = localStorage.getItem('token');
    if (userId && authToken) {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      });
      this.http.post(`${this.baseUrl}/users/save-fcm-token`, { userId, fcmToken }, { headers }).subscribe({
        next: (res) => console.log('FCM token saved to backend', res),
        error: (err) => console.error('Error saving FCM token to backend', err)
      });
    } else {
      console.warn('Cannot save FCM token: User not logged in or token missing.');
    }
  }

  addNotification(message: string, type: 'success' | 'error' | 'info') {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, { message, type }]);

    setTimeout(() => {
      this.removeNotification();
    }, 3000);
  }

  private removeNotification() {
    const currentNotifications = this.notificationsSubject.value;
    currentNotifications.shift();
    this.notificationsSubject.next([...currentNotifications]);
  }

  getNotifications(token: any, start: number = 0, limit: number = 20) {
    const headers = { Authorization: `Bearer ${token}` };
    const options = { headers: new HttpHeaders(headers) };
    return this.http.get(`${this.baseUrl}/notifications?start=${start}&limit=${limit}`, options)
  }

  // Fetch unread count
  getUnreadCount(token: any): Observable<number> {
    const headers = { Authorization: `Bearer ${token}` };
    if (localStorage.getItem('token')) {
      const options = { headers: new HttpHeaders(headers) };
      return this.http.get<number>(`${this.baseUrl}/count/unread-count`, options);
    } else {
      return new Observable<number>(observer => {
        observer.next(0);
        observer.complete();
      });
    }
  }

  refreshUnreadCount(token: string): void {
    this.getUnreadCount(token).subscribe({
      next: (count) => this.unreadCountSubject.next(count),
      error: (error) => console.error('Error fetching unread count:', error)
    });
  }

  startPollingNotifications(token: string): void {
    this.refreshUnreadCount(token);
  }

  // Mark all notifications as read
  markAllAsRead(token: any): Observable<any> {
    const headers = { Authorization: `Bearer ${token}` };
    const options = { headers: new HttpHeaders(headers) };
    return this.http.put(`${this.baseUrl}/mark-all-read`, null, options);
  }

  getAdminNotifications(token: any, start: number = 0, limit: number = 20) {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const options = { headers };
    return this.http.get(`${this.baseUrl}/admin/notifications?start=${start}&limit=${limit}`, options);
  }

  getAdminunread(token: any) {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const options = { headers };
    return this.http.get<any>(`${this.baseUrl}/admin/count/unread-count`, options)
  }

  markAdminAllAsRead(token: any): Observable<any> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const options = { headers };
    return this.http.put(`${this.baseUrl}/admin/mark-all-read`, null, options);
  }

  // Listen for specific events
  on(event: string, callback: any) {
    if (this.socket) {
      this.socket.on(event, callback);
    } else {
      console.warn('Socket not connected. Cannot listen for event:', event);
    }
  }

  // Emit events to the server
  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected. Cannot emit event:', event);
    }
  }

  // Utility method
  private getUserIdFromToken(): string | null {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId || payload.id || payload._id || null;
      } catch (e) {
        console.error('Error decoding token:', e);
        return null;
      }
    }
    return null;
  }
}
