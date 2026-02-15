import { Component, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { NotificationService } from 'src/app/notification.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-notifi',
  templateUrl: './notifi.component.html',
  styleUrls: ['./notifi.component.scss']
})
export class NotifiComponent {
  notifications: any[] = [];
  token: any;
  unreadCount: number = 0;
  adminNotofication: any[] = [];
  adminView: boolean = false;
  isLoading: boolean = false;
  isAdminLoading: boolean = false; // Initialize to false to allow initial load

  start = 0;
  limit = 10;
  hasMoreNotifications = true;
  hasMoreAdminNotifications = true;
  totalNotifications = 0;
  totalAdminNotifications = 0;
  @ViewChild('notificationList') notificationList!: ElementRef; // Reference to the scrollable notification list

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,

  ) { }

  ngOnInit() {
    this.token = localStorage.getItem('token')
    this.loadNotifications()
    this.markAllAsRead();
    if (this.authService.isAdmin()) {
      this.loadAdminNotifications();
      this.adminView = true;
      this.MarkadminRead();
    }
  }
  loadNotifications() {
    if (!this.authService.isAdmin()) {
      if (this.isLoading) return;

      // Capture current scroll position and viewport information before loading more notifications
      const scrollableElement = this.findScrollableElement();
      if (!scrollableElement) return;

      const previousScrollHeight = scrollableElement.scrollHeight;
      const previousScrollTop = scrollableElement.scrollTop;
      const viewportHeight = scrollableElement.clientHeight;

      // Calculate the relative position (what percentage of the content was visible)
      const scrollPercentage = previousScrollTop / (previousScrollHeight - viewportHeight);

      console.log('Frontend: Loading notifications with start:', this.start, 'limit:', this.limit);
      console.log('Frontend: Current scroll position:', previousScrollTop, 'Scroll height:', previousScrollHeight, 'Viewport height:', viewportHeight);

      this.isLoading = true;
      this.notificationService.getNotifications(this.token, this.start, this.limit).pipe(takeUntil(this.destroy$)).subscribe((data: any) => {
        console.log('notifications:', data);
        this.isLoading = false;

        if (data && Array.isArray(data.notifications)) {
          this.notifications = [...this.notifications, ...data.notifications];
          this.totalNotifications = data.totalNotifications;
          this.start += this.limit;

          // Restore scroll position to maintain the same relative view
          setTimeout(() => {
            const currentScrollableElement = this.findScrollableElement();
            if (currentScrollableElement) {
              const newScrollHeight = currentScrollableElement.scrollHeight;
              const newViewportHeight = currentScrollableElement.clientHeight;

              // Calculate the new scroll position based on the same relative percentage
              const newScrollTop = scrollPercentage * (newScrollHeight - newViewportHeight);

              console.log('Frontend: Restoring scroll position. Previous percentage:', scrollPercentage, 'New position:', newScrollTop);
              currentScrollableElement.scrollTop = newScrollTop;
            }
          }, 50); // Increased timeout to ensure DOM is fully updated

          // If fewer notifications are returned than the limit, no more notifications are available
          this.hasMoreNotifications = data.notifications.length === this.limit;
        } else {
          console.error('Unexpected response structure:', data);
        }
      }, (error) => {
        console.error('Error loading notifications:', error);
        this.isLoading = false;
      })
    } else {
      this.isLoading = false;
    }
  }

  private findScrollableElement(): HTMLElement | null {
    // Try to find the scrollable container by traversing up the DOM
    let element: HTMLElement | null = this.notificationList?.nativeElement || null;

    // First try the notification list itself
    if (element && element.scrollHeight > element.clientHeight) {
      return element;
    }

    // If not scrollable, try parent elements
    while (element && element !== document.body) {
      element = element.parentElement;
      if (element && element.scrollHeight > element.clientHeight) {
        return element;
      }
    }

    // Fallback to window if no scrollable container found
    return document.documentElement;
  }

  // Mark all notifications as read
  markAllAsRead(): void {
    this.token = localStorage.getItem('token')

    this.notificationService.markAllAsRead(this.token).pipe(takeUntil(this.destroy$)).subscribe(
      () => {
        this.unreadCount = 0; // Reset unread count locally
        this.notifications?.forEach((notification: any) => (notification.isRead = true)); // Mark all as read
        console.log('success', this.notifications);
        this.notificationService.refreshUnreadCount(this.token); // Refresh the unread count

      },
      (error) => {
        console.error('Error marking notifications as read:', error);
      }
    );
  }
  loadAdminNotifications() {
    if (this.isAdminLoading) return;

    // Capture current scroll position and viewport information before loading more notifications
    const scrollableElement = this.findScrollableElement();
    if (!scrollableElement) return;

    const previousScrollHeight = scrollableElement.scrollHeight;
    const previousScrollTop = scrollableElement.scrollTop;
    const viewportHeight = scrollableElement.clientHeight;

    // Calculate the relative position (what percentage of the content was visible)
    const scrollPercentage = previousScrollTop / (previousScrollHeight - viewportHeight);

    console.log('Frontend: Loading admin notifications with start:', this.start, 'limit:', this.limit);
    console.log('Frontend: Current scroll position:', previousScrollTop, 'Scroll height:', previousScrollHeight, 'Viewport height:', viewportHeight);

    this.isAdminLoading = true;
    this.notificationService.getAdminNotifications(this.token, this.start, this.limit).pipe(takeUntil(this.destroy$)).subscribe((data: any) => {
      console.log('admin notifications:', data);
      this.isAdminLoading = false;

      if (data && Array.isArray(data.notifications)) {
        this.adminNotofication = [...this.adminNotofication, ...data.notifications];
        this.totalAdminNotifications = data.totalNotifications;
        this.start += this.limit;

        // Restore scroll position to maintain the same relative view
        setTimeout(() => {
          const currentScrollableElement = this.findScrollableElement();
          if (currentScrollableElement) {
            const newScrollHeight = currentScrollableElement.scrollHeight;
            const newViewportHeight = currentScrollableElement.clientHeight;

            // Calculate the new scroll position based on the same relative percentage
            const newScrollTop = scrollPercentage * (newScrollHeight - newViewportHeight);

            console.log('Frontend: Restoring admin scroll position. Previous percentage:', scrollPercentage, 'New position:', newScrollTop);
            currentScrollableElement.scrollTop = newScrollTop;
          }
        }, 50); // Increased timeout to ensure DOM is fully updated

        // If fewer notifications are returned than the limit, no more notifications are available
        this.hasMoreAdminNotifications = data.notifications.length === this.limit;
      } else {
        console.error('Unexpected response structure:', data);
      }
    }, (error) => {
      console.error('Error loading admin notifications:', error);
      this.isAdminLoading = false;
    })
  }
  getNotificationLink(noti: any): string[] {
    // Check for service orders (orderIdentifier starts with "order-service-")
    if (noti?.orderIdentifier && noti.orderIdentifier.startsWith('order-service-')) {
      // Service order notifications - use /my-service-orders/order-service- route
      return ['/my-service-orders/', noti.orderIdentifier];
    }
    // Check for product orders (orderIdentifier starts with "order-buyer-" or has productIdentifier)
    else if (noti?.productIdentifier || (noti?.orderIdentifier && noti.orderIdentifier.startsWith('order-buyer-'))) {
      // Market product order - use /s/view-order route
      return ['/s/view-order', noti.productIdentifier || noti.orderIdentifier];
    }
    // Check for customIdentifier (alternative service order format)
    else if (noti?.customIdentifier) {
      // Service order notifications - use /my-service-orders/ route
      return ['/my-service-orders/', noti.customIdentifier];
    }
    // Requirement notifications for buyers
    else if (!this.authService.isSupplier() && noti?.requirementIdentifier) {
      return ['/buyer/request-requirement/', noti.requirementIdentifier];
    }
    // Requirement notifications for suppliers
    else if (this.authService.isSupplier() && noti?.requirementIdentifier) {
      return ['/supplier/sup-requested/', noti.requirementIdentifier]
    }
    // Fallback for orderIdentifier that doesn't match known patterns
    else if (noti?.orderIdentifier) {
      // Try to determine type based on message content or route to a default
      if (noti.message && noti.message.toLowerCase().includes('service order')) {
        return ['/my-service-orders/order-service-', noti.orderIdentifier];
      } else {
        return ['/s/view-order', noti.orderIdentifier];
      }
    }

    return ['/s/notifications']; // Fallback if no identifiers are present
  }
  //   if (noti?.orderIdentifier) {
  //     return ['/s/view-order', noti.orderIdentifier];
  // } else if (!this.authService.isSupplier() && noti?.requirementIdentifier) {
  //     return ['/buyer/request-requirement/', noti.requirementIdentifier];
  // }
  // else if(this.authService.isSupplier() && noti?.requirementIdentifier){
  //   return ['/supplier/sup-requested/',noti.requirementIdentifier]
  // }
  MarkadminRead() {
    this.token = localStorage.getItem('token')

    this.notificationService.markAdminAllAsRead(this.token).pipe(takeUntil(this.destroy$)).subscribe((data: any) => {
      console.log('marked', data)
    })
  }
  ngOnDestroy(): void {
    // Notify all subscriptions to complete
    this.destroy$.next();
    this.destroy$.complete();

  }
}
