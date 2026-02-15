import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, fromEvent, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private isOnlineSubject = new BehaviorSubject<boolean>(true);
  isOnline$ = this.isOnlineSubject.asObservable();

  constructor(private platform: Platform) {
    this.initializeNetworkStatus();
  }

  private async initializeNetworkStatus() {
    if (this.platform.is('capacitor')) {
      // Capacitor (Native) approach
      const status = await Network.getStatus();
      this.isOnlineSubject.next(status.connected);

      Network.addListener('networkStatusChange', (status) => {
        this.isOnlineSubject.next(status.connected);
      });
    } else {
      // Browser approach
      this.isOnlineSubject.next(navigator.onLine);
      
      // Merge both online and offline events
      merge(
        fromEvent(window, 'online').pipe(map(() => true)),
        fromEvent(window, 'offline').pipe(map(() => false))
      ).subscribe(isOnline => {
        this.isOnlineSubject.next(isOnline);
      });
    }
  }

  async checkNetworkStatus(): Promise<boolean> {
    if (this.platform.is('capacitor')) {
      const status = await Network.getStatus();
      this.isOnlineSubject.next(status.connected);
      return status.connected;
    } else {
      const isOnline = navigator.onLine;
      this.isOnlineSubject.next(isOnline);
      return isOnline;
    }
  }
}