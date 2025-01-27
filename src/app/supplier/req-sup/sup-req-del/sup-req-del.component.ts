import { Component } from '@angular/core';
import { AllService } from 'src/app/services/all.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-sup-req-del',
  templateUrl: './sup-req-del.component.html',
  styleUrls: ['./sup-req-del.component.scss']
})
export class SupReqDelComponent {
  completedProducts: any[] = [];
  loading = true;
  error: string | null = null;
  token:any;
  private destroy$ = new Subject<void>();

  constructor(private productService: AllService) {}

  ngOnInit(): void {
    this.token = localStorage.getItem('token')

    this.productService.getCompletedProductsForSupplier(this.token).pipe(takeUntil(this.destroy$)).subscribe({
      next: (products) => {
        this.completedProducts = products;
        this.loading = false;
        console.log(products)
      },
      error: (err) => {
        this.error = err.message || 'Failed to load completed products';
        this.loading = false;
      }
    });
  }
  ngOnDestroy(): void {
    // Notify all subscriptions to complete
    this.destroy$.next();
    this.destroy$.complete();
  
  }
}
