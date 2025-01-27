import { Component } from '@angular/core';
import { AdminService } from '../../admin.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-admin-del-reqs',
  templateUrl: './admin-del-reqs.component.html',
  styleUrls: ['./admin-del-reqs.component.scss']
})
export class AdminDelReqsComponent {
  private destroy$ = new Subject<void>();

  requestedSubmissions: any[] = [];
  loading = false;
  error = '';
  token:any; 
  constructor(private deliveryService: AdminService) {}
  ngOnInit(): void {
    this.token = localStorage.getItem('token')

    this.getRequestedSubmissions();
  }

  // Fetch requested submissions
  getRequestedSubmissions(): void {
    this.loading = true;
    this.deliveryService.getRequestedSubmissions(this.token).pipe(takeUntil(this.destroy$))
.subscribe(
      (data) => {
        this.requestedSubmissions = data;
        this.loading = false;
        console.log(data)
      },
      (error) => {
        this.error = 'Error fetching requested submissions';
        this.loading = false;
      }
    );
  }

  // Confirm delivery for a specific submission
  confirmDelivery(submissionId: string): void {
    this.deliveryService.confirmDelivery(submissionId, this.token).pipe(takeUntil(this.destroy$))
.subscribe(
      (response) => {
        // Update the UI to reflect the confirmed delivery
        this.requestedSubmissions = this.requestedSubmissions.filter(
          (submission) => submission._id !== submissionId
        );
        alert('Delivery confirmed successfully!');
      },
      (error) => {
        this.error = 'Error confirming delivery';
      }
    );
  }
   
 ngOnDestroy(): void {
  // Notify all subscriptions to complete
  this.destroy$.next();
  this.destroy$.complete();

}

}
