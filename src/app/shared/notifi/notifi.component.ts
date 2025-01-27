import { Component } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { NotificationService } from 'src/app/notification.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-notifi',
  templateUrl: './notifi.component.html',
  styleUrls: ['./notifi.component.scss']
})
export class NotifiComponent {
  notifications:any;
  token:any;
  unreadCount: number = 0;
  adminNotofication:any;
  adminView:boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,

  ) {}

  ngOnInit() {
    this.token = localStorage.getItem('token')
    this.getNotificstions()
    this.markAllAsRead();
   if(this.authService.isAdmin()){
    this.getAdminNotifications();
    this.adminView = true;
    this.MarkadminRead();
   }
  }
  getNotificstions(){
   if(!this.authService.isAdmin()){
    this.notificationService.getNotifications(this.token).pipe(takeUntil(this.destroy$)).subscribe((data:any)=>{
      console.log('notifications:', data);
      this.notifications = data;
    })
   }
  }
    // Mark all notifications as read
    markAllAsRead(): void {
      this.token = localStorage.getItem('token')

      this.notificationService.markAllAsRead(this.token).pipe(takeUntil(this.destroy$)).subscribe(
        () => {
          this.unreadCount = 0; // Reset unread count locally
          this.notifications?.forEach((notification:any) => (notification.isRead = true)); // Mark all as read
          console.log('success', this.notifications);
          this.notificationService.startPollingNotifications(this.token); // Refresh the unread count

        },
        (error) => {
          console.error('Error marking notifications as read:', error);
        }
      );
    }
    getAdminNotifications(){
      this.notificationService.getAdminNotifications(this.token).pipe(takeUntil(this.destroy$)).subscribe((data:any)=>{
        console.log('admin notifications:', data);
        this.adminNotofication = data
      })
    }
    getNotificationLink(noti: any): string[] {
      if (noti?.orderIdentifier) {
          return ['/s/view-order', noti.orderIdentifier];
      } else if (!this.authService.isSupplier() && noti?.requirementIdentifier) {
          return ['/buyer/request-requirement/', noti.requirementIdentifier];
      }
      else if(this.authService.isSupplier() && noti?.requirementIdentifier){
        return ['/supplier/sup-requested/',noti.requirementIdentifier]
      }
      return ['/s/notifications']; // Fallback if neither identifier is present
  }
  MarkadminRead(){
    this.token = localStorage.getItem('token')

    this.notificationService.markAdminAllAsRead(this.token).pipe(takeUntil(this.destroy$)).subscribe((data:any)=>{
      console.log('marked', data)
    })
  }
  ngOnDestroy(): void {
    // Notify all subscriptions to complete
    this.destroy$.next();
    this.destroy$.complete();
  
  }
}
