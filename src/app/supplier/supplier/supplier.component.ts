import { Component } from '@angular/core';
import { SupplierService } from '../supplier.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-supplier',
  templateUrl: './supplier.component.html',
  styleUrls: ['./supplier.component.scss']
})
export class SupplierComponent {
  token!: any;
  order: any;
  products: any;
  private destroy$ = new Subject<void>();

  constructor(private supplyService: SupplierService) { }
  ngOnInit() {
    this.token = localStorage.getItem('token');
    this.getOrdersCount()
    this.getProductsCount()

  }
  getOrdersCount() {
    this.supplyService.getOrdersCount(this.token).pipe(takeUntil(this.destroy$)).subscribe((data: any) => {
      this.order = data;
    })
  }
  getProductsCount() {
    this.supplyService.getProductsCount(this.token).pipe(takeUntil(this.destroy$)).subscribe((data: any) => {
      this.products = data;
    })
  }
  ngOnDestroy(): void {
    // Notify all subscriptions to complete
    this.destroy$.next();
    this.destroy$.complete();

  }
}
