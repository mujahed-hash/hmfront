import { Component } from '@angular/core';
import { SupplierService } from '../../supplier.service';
import { ServiceService } from '../../../services/service.service';
import { AuthService } from '../../../auth/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-supplier-orders-component',
  templateUrl: './supplier-orders-component.component.html',
  styleUrls: ['./supplier-orders-component.component.scss']
})
export class SupplierOrdersComponentComponent {
  token!:any;
  orders:any=[];
  start = 0;
  limit = 10;
  isLoading = false;
  hasMoreOrders = true;
  isUpadated:boolean= false;
  isServiceOrder: boolean = false; // Flag to determine if we're showing service orders or product orders
  private destroy$ = new Subject<void>();

  newStatus: { [key: string]: string } = {}; // Object to hold the new status for each order
  constructor(
    private productService: SupplierService,
    private serviceService: ServiceService,
    private authService: AuthService
  ) { }


  ngOnInit(){
    this.token = localStorage.getItem('token')
    this.getPlacedOrders()
  }

  getPlacedOrders() {
    this.isLoading = true;

    // Check if we're in service order context (supplier dashboard for services)
    // /supplier/orders is for service orders, other order routes are for product orders
    console.log('Current URL path:', window.location.pathname);
    this.isServiceOrder = this.authService.isSupplier() && window.location.pathname === '/supplier/orders';
    console.log('isServiceOrder:', this.isServiceOrder);

    if (this.isServiceOrder) {
      // Use service orders for suppliers
      this.serviceService.getSupplierServiceOrders(this.start, this.limit)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
        next: (data: any) => {
          console.log('Service Orders API Response:', data);

          this.isLoading = false;

          if (data?.orders && Array.isArray(data.orders)) {
            this.orders = [...this.orders, ...data.orders]; // prepend instead of append

            this.start += this.limit;
            this.initializeStatus();
            this.hasMoreOrders = data.orders.length === this.limit;

            this.hasMoreOrders = this.start < data.totalOrders;
          } else {
            console.warn('Unexpected response structure:', data);
            this.hasMoreOrders = false;
          }
        },
        error: (error: any) => {
          console.error('Error fetching orders:', error);
          this.isLoading = false;
          this.hasMoreOrders = false;
        }
      });
    } else {
      // Use product orders for other cases
      this.productService.getPlacedOrders(this.start, this.limit, this.token)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
        next: (data: any) => {
          console.log('Product Orders API Response:', data);

          this.isLoading = false;

          if (data?.orders && Array.isArray(data.orders)) {
            this.orders = [...this.orders, ...data.orders];

            this.start += this.limit;
            this.initializeStatus();
            this.hasMoreOrders = data.orders.length === this.limit;

            this.hasMoreOrders = this.start < data.totalOrders;
          } else {
            console.warn('Unexpected response structure:', data);
            this.hasMoreOrders = false;
          }
        },
        error: (error) => {
          console.error('Error fetching product orders:', error);
          this.isLoading = false;
          this.hasMoreOrders = false;
        }
      });
    }
  }
  
  refreshOrders() {
    this.isUpadated = true;
    this.isLoading = true;
    this.orders = []; // Clear existing orders
    this.start = 0; // Reset pagination

    // Check if we're in service order context
    // /supplier/orders is for service orders, other order routes are for product orders
    this.isServiceOrder = this.authService.isSupplier() && window.location.pathname === '/supplier/orders';

    if (this.isServiceOrder) {
      this.serviceService.getSupplierServiceOrders(this.start, this.limit)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
        next: (data: any) => {
          console.log('Refresh API Response:', data);
          
          this.isLoading = false;
          this.isUpadated = false;

          if (data?.orders && Array.isArray(data.orders)) {
            this.orders = data.orders; // Set orders directly (not appending)
            this.start = this.limit; // Set start to limit for next page load
            this.initializeStatus();
            this.hasMoreOrders = this.start < data.totalOrders;
          } else {
            console.warn('Unexpected response structure:', data);
            this.hasMoreOrders = false;
          }
        },
        error: (error: any) => {
          console.error('Error refreshing orders:', error);
          this.isLoading = false;
          this.hasMoreOrders = false;
        }
      });
    } else {
      // Use product orders for other cases
      this.productService.getPlacedOrders(this.start, this.limit, this.token)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
        next: (data: any) => {
          console.log('Refresh Product Orders API Response:', data);

          this.isLoading = false;
          this.isUpadated = false;

          if (data?.orders && Array.isArray(data.orders)) {
            this.orders = data.orders; // Set orders directly (not appending)
            this.start = this.limit; // Set start to limit for next page load
            this.initializeStatus();
            this.hasMoreOrders = this.start < data.totalOrders;
          } else {
            console.warn('Unexpected response structure:', data);
            this.hasMoreOrders = false;
          }
        },
        error: (error) => {
          console.error('Error refreshing product orders:', error);
          this.isLoading = false;
          this.hasMoreOrders = false;
        }
      });
    }
  }

  initializeStatus(): void {
    if (this.orders?.length > 0) {
      this.orders.forEach((order: any) => {
        if (order?.status) {
          this.newStatus[order._id] = order.status;
        } else {
          console.warn('Order without status:', order);
        }
      });
    } else {
      console.warn('No orders to initialize status for.');
    }
  }

  getStatusDisplay(status: string): string {
    const statusMap: { [key: string]: string } = {
      // Service order statuses (lowercase)
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'awaiting_user_response': 'Awaiting User Response',
      'awaiting_admin_action': 'Awaiting Admin Action',
      // Product order statuses (capitalized)
      'Pending': 'Pending',
      'Approved': 'Approved',
      'Delivered': 'Delivered',
      'Cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  }
  
  updateStatus(orderId: string, userId: string): void {
    const newStatus = this.newStatus[orderId];
    this.isLoading = true; // Set loading to true before making the API call

    // Check if we're in service order context
    // /supplier/orders is for service orders, /supplier/more/orders-recieved is for product orders
    const isServiceOrder = this.authService.isSupplier() && window.location.pathname === '/supplier/orders';

    if (isServiceOrder) {
      // Find the order to get its customIdentifier
      const order = this.orders.find((o: any) => o._id === orderId);
      if (order && order.customIdentifier) {
        // Use service order update for service orders
        this.serviceService.updateServiceOrderStatus(order.customIdentifier, newStatus)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
          next: (response: any) => {
            console.log('Order status updated successfully', response);

            // Update just the modified order in the local array
            const updatedOrderIndex = this.orders.findIndex((order: any) => order._id === orderId);
            if (updatedOrderIndex !== -1) {
              this.orders[updatedOrderIndex].status = newStatus;
            }

            // Refresh orders to ensure all data is up to date
            this.refreshOrders();
          },
          error: (error: any) => {
            console.error('Error updating order status', error);
            this.isLoading = false; // Reset loading state on error
          }
        });
      } else {
        console.error('Order not found or missing customIdentifier:', orderId);
        this.isLoading = false;
      }
    } else {
      // Use product order update for product orders
      this.productService.updateOrderStatus(orderId, userId, newStatus, this.token)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
        next: (response: any) => {
          console.log('Product order status updated successfully', response);

          // Update just the modified order in the local array
          const updatedOrderIndex = this.orders.findIndex((order: any) => order._id === orderId);
          if (updatedOrderIndex !== -1) {
            this.orders[updatedOrderIndex].status = newStatus;
          }

          // Refresh orders to ensure all data is up to date
          this.refreshOrders();
        },
        error: (error: any) => {
          console.error('Error updating product order status', error);
          this.isLoading = false; // Reset loading state on error
        }
      });
    }
  }
  ngOnDestroy(): void {
    // Notify all subscriptions to complete
    this.destroy$.next();
    this.destroy$.complete();
  
  }
}
