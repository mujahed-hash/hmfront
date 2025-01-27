import { Component } from '@angular/core';
import { SupplierService } from '../../supplier.service';
import { AuthService } from 'src/app/auth/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-orderdelivered',
  templateUrl: './orderdelivered.component.html',
  styleUrls: ['./orderdelivered.component.scss']
})
export class OrderdeliveredComponent {
  token!:any;
  orders:any=[];
  newStatus: { [key: string]: string } = {}; // Object to hold the new status for each order
  start = 10;
  limit = 10;
  isLoading = false;
  hasMoreOrders = true;
    private destroy$ = new Subject<void>();
  
  constructor(
    private productService: SupplierService,
    public authService:AuthService
   
  ) { }


  ngOnInit(){
    this.token = localStorage.getItem('token')
    this.getApproveOrders()
  }

  getApproveOrders(){
    this.productService.getDeliveredOrders(this.token).pipe(takeUntil(this.destroy$))
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
    this.orders.forEach((order:any) => {
      this.newStatus[order._id] = order.status;
    });
  }
  updateStatus(orderId: string, userId: string): void {
    const newStatus = this.newStatus[orderId];
    this.productService.updateOrderStatus(orderId,userId, newStatus, this.token).pipe(takeUntil(this.destroy$)).subscribe(
      (response:any) => {
        console.log('Order status updated successfully', response);
        this.getApproveOrders(); // Reload orders after update
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
