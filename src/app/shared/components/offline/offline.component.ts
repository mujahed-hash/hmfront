import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { NetworkService } from '../../services/network.service';

@Component({
  selector: 'app-offline',
  templateUrl: './offline.component.html',
  styleUrls: ['./offline.component.scss']
})
export class OfflineComponent implements OnInit, OnDestroy {
  isOnline: boolean = true;
  isNative: boolean = false;
  private networkSubscription?: Subscription;

  constructor(
    private networkService: NetworkService,
    private router: Router,
    private platform: Platform
  ) {
    this.isNative = this.platform.is('capacitor');
  }

  ngOnInit() {
    // Subscribe to network status changes
    this.networkSubscription = this.networkService.isOnline$.subscribe(
      isOnline => {
        this.isOnline = isOnline;
        if (isOnline) {
          // Add a small delay to ensure the app has time to restore its state
          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 1000);
        }
      }
    );

    // Initial check
    this.networkService.checkNetworkStatus();
  }

  ngOnDestroy() {
    if (this.networkSubscription) {
      this.networkSubscription.unsubscribe();
    }
  }

  async retryConnection() {
    const isOnline = await this.networkService.checkNetworkStatus();
    if (isOnline) {
      this.router.navigate(['/home']);
    }
  }
} 