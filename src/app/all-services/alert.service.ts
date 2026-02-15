import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface Alert {
  type: 'success' | 'error' | 'default';
  title: string;
  message: string;
  autoClose?: boolean;
  duration?: number; // in milliseconds
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertSubject = new Subject<Alert | null>();
  public alert$: Observable<Alert | null> = this.alertSubject.asObservable();

  constructor() { }

  show(alert: Alert) {
    console.log('AlertService: show() called with alert:', alert); // Debug log
    this.alertSubject.next(alert);
    if (alert.autoClose !== false) {
      setTimeout(() => this.clear(), alert.duration || 5000);
    }
  }

  success(message: string, title: string = 'Success', autoClose: boolean = true, duration: number = 5000) {
    this.show({ type: 'success', title, message, autoClose, duration });
  }

  error(message: string, title: string = 'Error', autoClose: boolean = true, duration: number = 5000) {
    this.show({ type: 'error', title, message, autoClose, duration });
  }

  default(message: string, title: string = 'Information', autoClose: boolean = true, duration: number = 5000) {
    this.show({ type: 'default', title, message, autoClose, duration });
  }

  clear() {
    this.alertSubject.next(null);
  }
}
