import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminServiceOrderService } from '../admin-service-order.service';
import { StatusOption } from 'src/app/shared/custom-status-selector/custom-status-selector.component'; // Import StatusOption

@Component({
  selector: 'app-service-order',
  templateUrl: './service-order.component.html',
  styleUrls: ['./service-order.component.scss']
})
export class ServiceOrderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  order: any = null;
  isLoading = false;
  error: string = '';

  // Message functionality
  newMessage = '';
  selectedStatus = '';
  statusOptions: StatusOption[] = [
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
    private serviceOrderService: AdminServiceOrderService
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

    this.serviceOrderService.getServiceOrderById(customIdentifier)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.order = response.order;
          } else {
            this.error = response.message || 'Failed to load order';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.error = 'Failed to load order. Please try again.';
          console.error('Error loading order:', error);
        }
      });
  }

  updateOrderStatus(newStatus: string): void {
    this.serviceOrderService.updateServiceOrder(this.order.customIdentifier, { status: newStatus })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.order.status = newStatus;
          }
        },
        error: (error) => {
          console.error('Error updating order status:', error);
        }
      });
  }

  cancelOrder(reason: string): void {
    this.serviceOrderService.cancelServiceOrder(this.order.customIdentifier, { reason })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.order.status = 'cancelled';
            this.order.cancellationReason = reason;
          }
        },
        error: (error) => {
          console.error('Error cancelling order:', error);
        }
      });
  }

  deleteOrder(): void {
    if (confirm('Are you sure you want to delete this service order? This action cannot be undone.')) {
      this.serviceOrderService.deleteServiceOrder(this.order.customIdentifier)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.router.navigate(['/admin/service-orders/all']);
            }
          },
          error: (error) => {
            console.error('Error deleting order:', error);
          }
        });
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'pending': 'status-pending',
      'confirmed': 'status-confirmed',
      'in_progress': 'status-in-progress',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled',
      'awaiting_user_response': 'status-awaiting-user',
      'awaiting_admin_action': 'status-awaiting-admin'
    };
    return statusClasses[status] || '';
  }

  goBack(): void {
    this.router.navigate(['/admin/service-orders/all']);
  }

  capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  addMessage(): void {
    if (!this.newMessage.trim()) {
      return;
    }

    this.serviceOrderService.addMessageToServiceOrder(this.order.customIdentifier, {
      message: this.newMessage,
      newStatus: this.selectedStatus
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Refresh the order to get the updated conversation
            this.loadOrder(this.order.customIdentifier);
            this.newMessage = '';
            this.selectedStatus = '';
          }
        },
        error: (error) => {
          console.error('Error adding message:', error);
        }
      });
  }
}
