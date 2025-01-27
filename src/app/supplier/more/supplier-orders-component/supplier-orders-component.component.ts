import { Component } from '@angular/core';
import { SupplierService } from '../../supplier.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-supplier-orders-component',
  templateUrl: './supplier-orders-component.component.html',
  styleUrls: ['./supplier-orders-component.component.scss']
})
export class SupplierOrdersComponentComponent {
  token!:any;
  orders:any=[];
  start = 10;
  limit = 10;
  isLoading = false;
  hasMoreOrders = true;
  private destroy$ = new Subject<void>();

  newStatus: { [key: string]: string } = {}; // Object to hold the new status for each order
  constructor(
    private productService: SupplierService,

   
  ) { }


  ngOnInit(){
    this.token = localStorage.getItem('token')
    this.getPlacedOrders()
  }

  getPlacedOrders() {
    this.productService.getPlacedOrders(this.start, this.limit, this.token)
      .pipe(takeUntil(this.destroy$))
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
  
  updateStatus(orderId: string, userId: string): void {
    const newStatus = this.newStatus[orderId];
    this.productService.updateOrderStatus(orderId,userId, newStatus, this.token).pipe(takeUntil(this.destroy$)).subscribe(
      (response:any) => {
        console.log('Order status updated successfully', response);
        this.getPlacedOrders(); // Reload orders after update
      },
      (error:any) => {
        console.error('Error updating order status', error);
      }
    );
  }
  ngOnDestroy(): void {
    // Notify all subscriptions to complete
    this.destroy$.next();
    this.destroy$.complete();
  
  }
}
