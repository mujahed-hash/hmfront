import { Component, OnDestroy } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from '../notification.service';
import { Subject, takeUntil } from 'rxjs';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnDestroy {
  isMobile: boolean = false;
  private visibilityChangeHandler: () => void;
  private platformResumeSubscription!: Subscription;

  isSidenavOpened: boolean = true;
  cartLength!:number;
  notififaction:any;
  token:any;
  cartCount$ = this.authService.cartCount$;
  notificationCount$ = this.notificationService.notificationCount$;
  unreadCount: number = 0;
  adminUnreadCount!:number;
  private pollingIntervalId: any;
  private destroy$ = new Subject<void>();
  constructor(
    private observer: BreakpointObserver,
    public authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private platform: Platform
  )  

  {this.startPolling();
    this.visibilityChangeHandler = this.onVisibilityChange.bind(this);
}

startPolling() {
  this.pollingIntervalId = setInterval(() => {
    this.authService.fetchCartCount(this.token); // Refresh the cart count every 10 seconds
  }, 10000); // Polling interval: 5 seconds
}

  ngOnInit() {
    this.token = localStorage.getItem('token')
    this.getNotificstions()
    this.observer.observe(['(max-width: 1100px)']).pipe(takeUntil(this.destroy$)).subscribe((screenSize) => {
      this.isMobile = screenSize.matches;
      this.isSidenavOpened = !this.isMobile;
    });
    if(this.authService.isAdmin()){
      this.getAdminUnreadcountNotifications()
       }
    this.loadCart();
    this.AllNotData();
   
  }
  AllNotData(){
    this.notificationService.startPollingNotifications(this.token);
    this.authService.fetchCartCount(this.token);
  
     // Fetch the initial cart count on load
    this.notificationService.registerUser(this.authService.getUserId().toString());
    this.notificationService.listenForNotifications();
    this.notificationService.connect();
   // Listen for notifications (event name is 'notification')
   this.notificationService.on('notification', (data: any) => {
    console.log('New notification received:', data);

    if(this.authService.isAdmin()){
      this.getAdminUnreadcountNotifications()
       }

       // Subscribe to unread count updates
  this.notificationService.unreadCount$.pipe(takeUntil(this.destroy$)).subscribe((count) => {
    this.unreadCount = count;  // Update unread count on UI (e.g., in navbar)
    console.log('count sockets', count)
  });  
    // Subscribe to app resumption events
    this.platformResumeSubscription = this.platform.resume.subscribe(() => {
      console.log('App resumed - refreshing component...');
      this.refreshComponent();
    });

    // Listen for tab visibility changes (e.g., switching tabs in a browser)
    document.addEventListener('visibilitychange', this.visibilityChangeHandler);
    // Handle the notification (e.g., update UI)
  });

  }
  ionViewWillEnter() {
    // Triggered when the page becomes active in the navigation stack
    console.log('Page is active - refreshing component...');
    this.refreshComponent();
  }

  onVisibilityChange() {
    if (document.visibilityState === 'visible') {
      console.log('Tab became visible - refreshing component...');
      this.refreshComponent();
    }
  }

  refreshComponent() {
    console.log('Refreshing component...');
    this.AllNotData();
    this.getNotificstions()
    this.getAdminUnreadcountNotifications()
    // Add your refresh logic here, e.g., fetch updated data or reload UI
  }

loadCart(): void {
    this.authService.getCart(this.token).pipe(takeUntil(this.destroy$)).subscribe((data:any) => {
      this.cartLength = data.items.length;
    });
  }
nullOrderCount(){
  if(this.authService.isAdmin()){
    this.adminUnreadCount = 0
  }
  else{
    this.unreadCount = 0;

  }
}

  toggleSidenav() {
    this.isSidenavOpened = !this.isSidenavOpened;
    if(!this.isMobile){
        this.isSidenavOpened = !!this.isMobile;

        // this.isMobile = !this.isMobile
        // this.isSidenavOpened = !this.isMobile;
    }

  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getNotificstions(){
    this.notificationService.getUnreadCount(this.token).pipe(takeUntil(this.destroy$)).subscribe((data:any)=>{
      console.log('notifications:', data);
      this.notififaction = data
    })
  }
  getAdminUnreadcountNotifications(){
    this.notificationService
    .getAdminunread(this.token).pipe(takeUntil(this.destroy$)).subscribe((data:any)=>{
      console.log('admin count:', data);
      this.adminUnreadCount = data?.unreadCount
    })
  }
  getNotificationLink(noti: any): string[] {
    if (noti?.orderIdentifier) {
        return ['/s/view-order', noti.orderIdentifier];
    } else if (noti?.requirementIdentifier) {
        return ['/s/view-requirement', noti.requirementIdentifier];
    }
    return ['/s/notifications']; // Fallback if neither identifier is present
}
navigateToWhatsApp(): void {
  const phoneNumber = '+16824068867'; // Replace with the recipient's WhatsApp number
  const message = 'Hello, I am interested in your service.'; // Replace with your desired default message

  // Construct the WhatsApp URL
  const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  // Navigate to the WhatsApp URL
  window.open(whatsappURL, '_blank');
}
ngOnDestroy(): void {
  // Notify all subscriptions to complete
  this.destroy$.next();
  this.destroy$.complete();
   // Clear the polling interval
   if (this.pollingIntervalId) {
    clearInterval(this.pollingIntervalId);
  }

  // if (this.platformResumeSubscription) {
  //   this.platformResumeSubscription.unsubscribe();
  // }
  // document.removeEventListener('visibilitychange', this.visibilityChangeHandler);

}
}
