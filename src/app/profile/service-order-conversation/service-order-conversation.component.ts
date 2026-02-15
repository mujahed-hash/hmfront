import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AllService } from '../../services/all.service';
import { AuthService } from '../../auth/auth.service';
import { AlertService } from '../../all-services/alert.service';

interface UserProfile {
  _id: string;
  name: string;
  customIdentifier: string;
  image?: string;
  email: string;
}

interface Message {
  sender: UserProfile;
  role: 'user' | 'admin' | 'supplier';
  message: string;
  timestamp: Date;
}

interface ServiceOrder {
  _id: string;
  service: {
    _id: string;
    serviceName: string;
    serviceDesc: string;
    images?: string[];
    price: number;
  };
  user: UserProfile; // The user who made the order
  supplier: UserProfile; // The user who provides the service
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  notes: string;
  price: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  conversation: Message[];
  customIdentifier: string;
  date: Date;
}

@Component({
  selector: 'app-service-order-conversation',
  templateUrl: './service-order-conversation.component.html',
  styleUrls: ['./service-order-conversation.component.scss']
})
export class ServiceOrderConversationComponent implements OnInit, OnDestroy {
  @ViewChild('messageContainer') messageContainer!: ElementRef;

  orderId!: string;
  order!: ServiceOrder | null;
  isLoading = true;
  error = false;
  errorMessage = '';
  messageForm!: FormGroup;
  isSendingMessage = false;
  currentUserId: string | null = null;
  currentUserRole: 'user' | 'admin' | 'supplier' | 'superadmin' | 'buyer' | null = null;

  availableStatuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'awaiting_user_response', label: 'Awaiting User Response' },
    { value: 'awaiting_admin_action', label: 'Awaiting Admin Action' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private allService: AllService,
    private authService: AuthService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserId();
    this.currentUserRole = this.authService.getUserRole(); // Assuming you have a getUserRole() in AuthService

    console.log('Current user role:', this.currentUserRole);
    console.log('Is actionable by admin/supplier:', this.isActionableByAdminOrSupplier());

    this.messageForm = this.fb.group({
      message: ['', Validators.required],
      newStatus: [null] // Add newStatus form control
    });

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.orderId = params.get('customIdentifier') || ''; // Changed to customIdentifier
      if (this.orderId) {
        this.loadOrderDetails();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrderDetails(): void {
    this.isLoading = true;
    this.error = false;
    this.errorMessage = '';

    const token = this.authService.getToken();
    if (!token) {
      this.alertService.error('You are not authenticated. Please log in.', 'Authentication Required', false);
      this.isLoading = false;
      this.error = true;
      this.router.navigate(['/login']);
      return;
    }

    this.allService.getServiceOrderById(this.orderId, token).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        console.log('Service order details loaded:', response);
        if (response.success && response.order) {
          this.order = response.order;
          this.scrollToBottom();
        } else {
          this.order = null;
          this.alertService.default('Service order not found.', 'Information');
        }
        this.isLoading = false;
      },
      error: (err: any) => { 
        console.error('Error loading service order details:', err);
        this.error = true;
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to load service order details. Please try again later.';
        this.alertService.error(this.errorMessage, 'Error', false);
        this.router.navigate(['/my-service-orders']); // Changed navigation path
      }
    });
  }

  sendMessage(): void {
    if (this.messageForm.invalid || this.isSendingMessage || !this.order) {
      return;
    }

    this.isSendingMessage = true;
    const messageContent = this.messageForm.get('message')?.value;
    const newStatus = this.messageForm.get('newStatus')?.value;
    const token = this.authService.getToken();

    console.log('Attempting to send message with status update:');
    console.log('Message:', messageContent);
    console.log('New status:', newStatus);
    console.log('Current user role:', this.currentUserRole);

    if (!token) {
      this.alertService.error('You are not authenticated. Please log in.', 'Authentication Required', false);
      this.isSendingMessage = false;
      this.router.navigate(['/login']);
      return;
    }

    console.log('Making API call to addMessageToServiceOrder...');
    this.allService.addMessageToServiceOrder(this.order!.customIdentifier, messageContent, newStatus, token).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        console.log('Message sent successfully:', response);
        if (response.success && response.order) {
          this.order = response.order; // Update local order object with new conversation
          this.messageForm.reset();
          // Reset newStatus explicitly as messageForm.reset() might not clear null values
          this.messageForm.get('newStatus')?.setValue(null);
          this.scrollToBottom();
        } else {
          this.alertService.error('Failed to send message.', 'Error');
        }
        this.isSendingMessage = false;
      },
      error: (err: any) => { // Explicitly type err as any
        console.error('Error sending message:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        console.error('Error details:', err.error);
        this.alertService.error(err.error?.message || 'Failed to send message. Please try again.', 'Error');
        this.isSendingMessage = false;
      }
    });
  }

  isCurrentUser(senderId: string): boolean {
    return this.currentUserId === senderId;
  }

  getUserImageUrl(imagePath: string | undefined): string {
    if (!imagePath) return 'assets/images/default-avatar.png';
    if (imagePath.startsWith('http')) {
      return imagePath;
    } else {
      return imagePath; // Backend now sends full URLs
    }
  }

  scrollToBottom(): void {
    // Use a small timeout to ensure DOM is updated before scrolling
    setTimeout(() => {
      if (this.messageContainer) {
        this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  // Admin/Supplier specific functionality (no longer a separate update function)
  // The status update is now integrated into the sendMessage function via the newStatus form control.
  // updateOrderStatus(event: any): void {
  //   const newStatus = event.value;
  //   // Implement logic to call backend API to update status
  //   // Only accessible if currentUserRole is 'admin' or 'supplier'
  //   console.log('Updating status to:', newStatus);
  //   this.alertService.default(`Status update functionality for ${newStatus} is not yet fully implemented.`, 'Feature Incomplete');
  // }

  isActionableByAdminOrSupplier(): boolean {
    return this.currentUserRole === 'admin' || this.currentUserRole === 'supplier' || this.currentUserRole === 'superadmin';
  }

  // Helper for status styling - duplicated from UserServiceOrdersComponent for now
  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'confirmed':
      case 'in_progress':
      case 'awaiting_admin_action':
      case 'awaiting_user_response':
        return 'status-in-progress';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  // Helper for status text - duplicated from UserServiceOrdersComponent for now
  getDisplayStatus(status: string): string {
    return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
}
