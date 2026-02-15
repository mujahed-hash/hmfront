import { Component, OnDestroy, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { SharedService } from '../shared/shared.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from '../notification.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthStateService } from '../auth-state.service';
import { StateService } from '../services/state.service';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  isMobile: boolean = false;
  private visibilityChangeHandler: () => void;
  private platformResumeSubscription!: Subscription;

  isSidenavOpened: boolean = true;
  cartLength!: number;
  notififaction: any;
  token: any;

  // Direct observable for async pipe (most reliable change detection)
  cartCount$: Observable<number>;
  currentCartCount: number = 0;

  unreadCount: number = 0;
  adminUnreadCount!: number;
  private pollingIntervalId: any;
  private destroy$ = new Subject<void>();
  constructor(
    private observer: BreakpointObserver,
    public authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private platform: Platform,
    private authStateService: AuthStateService,
    private cdr: ChangeDetectorRef,
    private sharedService: SharedService,
    private stateService: StateService,
    private ngZone: NgZone
  ) {
    this.visibilityChangeHandler = this.onVisibilityChange.bind(this);
    // Bind cartCount$ directly from StateService for the async pipe
    this.cartCount$ = this.stateService.cartCount$;
    console.log('[SidebarComponent] Initialized');
  }

  ngOnInit() {
    this.token = localStorage.getItem('token');

    // Subscribe to StateService directly for Cart Count (backup for non-async-pipe bindings)
    this.stateService.cartCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        console.log('[SidebarComponent] UI UPDATE RECEIVED. New Count:', count);
        this.ngZone.run(() => {
          this.currentCartCount = count;
          this.cdr.detectChanges();
        });
      });

    // Subscribe to unread count updates
    this.notificationService.unreadCount$.pipe(takeUntil(this.destroy$)).subscribe((count) => {
      this.unreadCount = count;
      this.cdr.detectChanges();
    });

    this.observer.observe(['(max-width: 1100px)']).pipe(takeUntil(this.destroy$)).subscribe((screenSize) => {
      this.isMobile = screenSize.matches;
      this.isSidenavOpened = !this.isMobile;
      this.cdr.detectChanges();
    });

    // Initial Data Fetch
    if (this.authService.isLoggedIn()) {
      this.refreshComponent();
      this.notificationService.connect(); // Ensure socket is connected
    }

    this.authStateService.loginEvent$.subscribe(() => {
      this.refreshComponent();
    });

    // Subscribe to app resumption events
    this.platformResumeSubscription = this.platform.resume.subscribe(() => {
      this.refreshComponent();
    });

    // Listen for tab visibility changes
    document.addEventListener('visibilitychange', this.visibilityChangeHandler);
  }

  AllNotData() {
    this.notificationService.refreshUnreadCount(this.token);
    this.authService.fetchCartCount(this.token); // This updates StateService
  }

  ionViewWillEnter() {
    this.refreshComponent();
  }

  onVisibilityChange() {
    if (document.visibilityState === 'visible') {
      this.refreshComponent();
    }
  }

  refreshComponent() {
    this.AllNotData();
    if (this.authService.isAdmin()) {
      this.getAdminUnreadcountNotifications();
    }
  }

  loadCart(): void {
    this.authService.getCart(this.token).pipe(takeUntil(this.destroy$)).subscribe((data: any) => {
      this.cartLength = data.items.length;
    });
  }

  nullOrderCount() {
    if (this.authService.isAdmin()) {
      this.adminUnreadCount = 0;
    } else {
      this.unreadCount = 0;
    }
  }

  toggleSidenav() {
    this.isSidenavOpened = !this.isSidenavOpened;
    if (!this.isMobile) {
      this.isSidenavOpened = !!this.isMobile;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getAdminUnreadcountNotifications() {
    this.notificationService
      .getAdminunread(this.token).pipe(takeUntil(this.destroy$)).subscribe((data: any) => {
        this.adminUnreadCount = data?.unreadCount;
      });
  }

  getNotificationLink(noti: any): string[] {
    if (noti?.orderIdentifier) {
      return ['/s/view-order', noti.orderIdentifier];
    } else if (noti?.requirementIdentifier) {
      return ['/s/view-requirement', noti.requirementIdentifier];
    }
    return ['/s/notifications'];
  }

  navigateToWhatsApp(): void {
    const phoneNumber = '+917095008786';
    const message = 'Hello, I am interested in your service.';
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.pollingIntervalId) {
      clearInterval(this.pollingIntervalId);
    }
    document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
  }
}
