import { Component } from '@angular/core';
import { LocalStorageService } from 'src/app/auth/login/local-storage.service';
import { SupplierService } from 'src/app/supplier/supplier.service';
import { BuyerService } from '../buyer.service';
import { Subject, takeUntil } from 'rxjs';





@Component({
  selector: 'app-buyer-purchases-component',
  templateUrl: './buyer-purchases-component.component.html',
  styleUrls: ['./buyer-purchases-component.component.scss']
})
export class BuyerPurchasesComponentComponent {
  private destroy$ = new Subject<void>();

  token:any;
  order:any[]=[];
  constructor(private supplyService: BuyerService,private lService:LocalStorageService){}

  ngOnInit() {
    this.token = localStorage.getItem('token');
    this.getPurchases()
  }
  getPurchases(){
    this.supplyService.getPurchases(this.token).pipe(takeUntil(this.destroy$))
    .subscribe((data:any)=>{
      console.log(data);
      this.order = data

    })
  }
   
 ngOnDestroy(): void {
  // Notify all subscriptions to complete
  this.destroy$.next();
  this.destroy$.complete();

}
}
