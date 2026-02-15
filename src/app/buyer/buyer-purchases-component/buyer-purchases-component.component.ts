import { Component } from '@angular/core';
import { LocalStorageService } from 'src/app/auth/login/local-storage.service';
import { SupplierService } from 'src/app/supplier/supplier.service';
import { BuyerService } from '../buyer.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';




@Component({
  selector: 'app-buyer-purchases-component',
  templateUrl: './buyer-purchases-component.component.html',
  styleUrls: ['./buyer-purchases-component.component.scss']
})
export class BuyerPurchasesComponentComponent {
  private destroy$ = new Subject<void>();

  token:any;
  order:any[]=[];
  start = 0;
  limit = 10;
  isLoading = false;
  hasMoreOrders = true;
  totalOrders = 0;

  constructor(private supplyService: BuyerService,private lService:LocalStorageService){}

  ngOnInit() {
    this.token = localStorage.getItem('token');
    this.loadPurchases()
  }

  loadPurchases(){
    if (this.isLoading || !this.hasMoreOrders) return;

    this.isLoading = true;
    this.supplyService.getPurchases(this.token, this.start, this.limit).pipe(takeUntil(this.destroy$))
    .subscribe((data:any)=>{
      console.log(data);
      this.isLoading = false;

      if (data && Array.isArray(data.orders)) {
        this.order = [...this.order, ...data.orders];
        this.totalOrders = data.totalOrders;
        this.start += this.limit;

        // If fewer orders are returned than the limit, no more orders are available
        this.hasMoreOrders = data.orders.length === this.limit;
      } else {
        console.error('Unexpected response structure:', data);
      }
    },
    (error) => {
      this.isLoading = false;
      console.error('Error loading purchases:', error);
    });
  }
   
 ngOnDestroy(): void {
  // Notify all subscriptions to complete
  this.destroy$.next();
  this.destroy$.complete();
}
}
