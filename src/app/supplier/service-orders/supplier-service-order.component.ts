import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ServiceService } from '../../services/service.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-supplier-service-order',
  templateUrl: './supplier-service-order.component.html',
  styleUrls: ['./supplier-service-order.component.scss']
})
export class SupplierServiceOrderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  order: any = null;
  isLoading = false;
  error: string = '';
  isOwnOrder = false;

  // Message functionality
  newMessage = '';
  selectedStatus = '';
  statusOptions = [
    { value: 'pending', label: 'Pending', icon: 'schedule' },
    { value: 'confirmed', label: 'Confirmed', icon: 'check_circle' },
    { value: 'in_progress', label: 'In Progress', icon: 'sync' },
    { value: 'completed', label: 'Completed', icon: 'done' },
    { value: 'cancelled', label: 'Cancelled', icon: 'cancel' },
    { value: 'awaiting_user_response', label: 'Awaiting User Response', icon: 'person_outline' },
    { value: 'awaiting_admin_action', label: 'Awaiting Admin Action', icon: 'admin_panel_settings' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private serviceService: ServiceService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const customIdentifier = this.route.snapshot.paramMap.get('customIdentifier');
    if (customIdentifier) {
      this.loadOrder(customIdentifier);
    } else {
      this.error = 'Order customIdentifier not provided';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrder(customIdentifier: string): void {
    this.isLoading = true;
    this.error = '';

    this.serviceService.getSupplierServiceOrderById(customIdentifier)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          if (response.success && response.order) {
            this.order = response.order;
            // Check if this is the supplier's own order
            this.isOwnOrder = this.order.supplier?._id === this.authService.getUserId();
            if (!this.isOwnOrder) {
              this.error = 'You are not authorized to view this order.';
              this.order = null;
            } else {
              // Initialize the selected status for the dropdown
              this.selectedStatus = this.order.status;
            }
          } else {
            this.error = response.message || 'Failed to load order';
          }
        },
        error: (error: any) => {
          this.isLoading = false;
          this.error = 'Failed to load order. Please try again.';
          console.error('Error loading order:', error);
        }
      });
  }

  updateOrderStatus(newStatus: string): void {
    if (!this.order) return;

    this.serviceService.updateServiceOrderStatus(this.order.customIdentifier, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.order.status = newStatus;
            this.selectedStatus = newStatus;
          }
        },
        error: (error: any) => {
          console.error('Error updating order status:', error);
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/supplier/orders']);
  }

  getStatusDisplay(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'awaiting_user_response': 'Awaiting User Response',
      'awaiting_admin_action': 'Awaiting Admin Action'
    };
    return statusMap[status] || status;
  }

  addMessage(): void {
    if (!this.newMessage.trim() || !this.order) {
      return;
    }

    const messageData: any = {
      message: this.newMessage
    };

    // Include status update if selected
    if (this.selectedStatus && this.selectedStatus !== this.order.status) {
      messageData.newStatus = this.selectedStatus;
    }

    this.serviceService.addMessageToServiceOrder(this.order.customIdentifier, messageData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            // Refresh the order to get the updated conversation
            this.loadOrder(this.order.customIdentifier);
            this.newMessage = '';
            this.selectedStatus = '';
          }
        },
        error: (error: any) => {
          console.error('Error adding message:', error);
        }
      });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
