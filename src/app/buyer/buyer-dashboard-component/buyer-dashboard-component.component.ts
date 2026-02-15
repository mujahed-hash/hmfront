import { Component } from '@angular/core';
import { BuyerService } from '../buyer.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-buyer-dashboard-component',
  templateUrl: './buyer-dashboard-component.component.html',
  styleUrls: ['./buyer-dashboard-component.component.scss']
})
export class BuyerDashboardComponentComponent {
  private destroy$ = new Subject<void>();

  token!: string | null;
  categories: any[] = [];
  constructor(private buyerService:BuyerService){}
  ngOnInit(){
    this.token = localStorage.getItem('token');
   this.getCategories();
  }

  getCategories() {
    if (this.token) {
      this.buyerService.getCategories(this.token).pipe(takeUntil(this.destroy$))
      .subscribe(
        (data: any) => {
          this.categories = data;
          console.log(this.categories)
        },
        (error:any) => console.error('Error fetching categories', error)
      );
    }
  }


 
 ngOnDestroy(): void {
  // Notify all subscriptions to complete
  this.destroy$.next();
  this.destroy$.complete();

}

}
