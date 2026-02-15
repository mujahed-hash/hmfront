import { Component } from '@angular/core';
import { SupplierService } from '../../supplier.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-ordercancelled',
  templateUrl: './ordercancelled.component.html',
  styleUrls: ['./ordercancelled.component.scss']
})
export class OrdercancelledComponent {
  token!:any;
  orders:any[]=[];
  newStatus: { [key: string]: string } = {}; // Object to hold the new status for each order
  start = 0;
  limit = 10;
  isLoading = false;
  hasMoreOrders = true;
  private destroy$ = new Subject<void>();

  constructor(
    private productService: SupplierService,

   
  ) { }


  ngOnInit(){
    this.token = localStorage.getItem('token')
    this.getApproveOrders()
  }

  getApproveOrders(){
    this.isLoading = true;
    
    this.productService.getCancelledOrders(this.token).pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data: any) => {
        console.log('API Response:', data);

        this.isLoading = false;

        if (data?.orders && Array.isArray(data.orders)) {
          this.orders = [...this.orders, ...data.orders];
          this.start += this.limit;
          this.initializeStatus();

          // Check if more orders are available
          this.hasMoreOrders = this.start < data.totalOrders;
        } else {
          console.error('Unexpected response structure:', data);
          this.hasMoreOrders = false;
        }
      },
      error: (error) => {
        console.error('Error fetching orders:', error);
        this.isLoading = false;
      }
    });
  }
  
  refreshOrders() {
    this.isLoading = true;
    this.orders = []; // Clear existing orders
    this.start = 0; // Reset pagination
    
    this.productService.getCancelledOrders(this.token)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          console.log('Refresh API Response:', data);
          
          this.isLoading = false;
          
          if (data?.orders && Array.isArray(data.orders)) {
            this.orders = data.orders; // Set orders directly (not appending)
            this.start = this.limit; // Set start to limit for next page load
            this.initializeStatus();
            this.hasMoreOrders = this.start < data.totalOrders;
          } else {
            console.error('Unexpected response structure:', data);
            this.hasMoreOrders = false;
          }
        },
        error: (error) => {
          console.error('Error refreshing orders:', error);
          this.isLoading = false;
          this.hasMoreOrders = false;
        }
      });
  }
  
  initializeStatus(): void {
    this.orders.forEach((order:any) => {
      this.newStatus[order._id] = order.status;
    });
  }
  
  updateStatus(orderId: string, userId: string): void {
    const newStatus = this.newStatus[orderId];
    this.isLoading = true; // Set loading to true before making the API call
    
    this.productService.updateOrderStatus(orderId, userId, newStatus, this.token)
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
  }
  
  ngOnDestroy(): void {
    // Notify all subscriptions to complete
    this.destroy$.next();
    this.destroy$.complete();
  
  }
}
