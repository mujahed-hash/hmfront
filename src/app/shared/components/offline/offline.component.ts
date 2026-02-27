import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';
import { NetworkService } from '../../services/network.service';

@Component({
  selector: 'app-offline',
  templateUrl: './offline.component.html',
  styleUrls: ['./offline.component.scss']
})
export class OfflineComponent implements OnInit, OnDestroy {
  isOnline: boolean = false;
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
    // Skip first emission (which is the initial state that brought us here)
    // and wait for the next change — a genuine recovery to online state.
    this.networkSubscription = this.networkService.isOnline$.pipe(skip(1)).subscribe(
      isOnline => {
        this.isOnline = isOnline;
        if (isOnline) {
          // Navigate back to where the user was, or home if no last route.
          const lastRoute = localStorage.getItem('lastRoute') || '/home';
          setTimeout(() => {
            this.router.navigateByUrl(lastRoute, { replaceUrl: true });
          }, 500);
        }
      }
    );
  }

  ngOnDestroy() {
    this.networkSubscription?.unsubscribe();
  }

  async retryConnection() {
    const isOnline = await this.networkService.checkNetworkStatus();
    if (isOnline) {
      const lastRoute = localStorage.getItem('lastRoute') || '/home';
      this.router.navigateByUrl(lastRoute, { replaceUrl: true });
    }
  }
}