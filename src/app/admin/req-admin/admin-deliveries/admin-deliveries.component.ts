import { Component } from '@angular/core';
import { AdminService } from '../../admin.service';
import { Subject, takeUntil } from 'rxjs';





@Component({
  selector: 'app-admin-deliveries',
  templateUrl: './admin-deliveries.component.html',
  styleUrls: ['./admin-deliveries.component.scss']
})
export class AdminDeliveriesComponent {
  private destroy$ = new Subject<void>();

  completedProducts: any[] = [];
  loading = true;
  error: string | null = null;
  token:any;

  constructor(private productService: AdminService) {}

  ngOnInit(): void {
    this.token = localStorage.getItem('token')
    this.getDelivery();
  
  }
  getDelivery(){
    this.productService.getCompletedProductsForAdmin(this.token).pipe(takeUntil(this.destroy$))
.subscribe({
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
    // Confirm delivery for a specific submission
    updateDelivery(requirementId:any, submissionId: string): void {
      this.productService.updateDelivery(requirementId,submissionId, this.token).pipe(takeUntil(this.destroy$))
.subscribe(
        (response) => {
          // Update the UI to reflect the confirmed delivery
          alert('Delivered successfully!');
          this.getDelivery();
      },
        (error) => {
          this.error = 'Error confirming delivery';
        }
      
    )}
    truncateText(text: string, maxLength: number): string {
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
     
 ngOnDestroy(): void {
  // Notify all subscriptions to complete
  this.destroy$.next();
  this.destroy$.complete();

}
}
