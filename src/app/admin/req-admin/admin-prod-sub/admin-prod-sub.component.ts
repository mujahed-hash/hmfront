import { Component } from '@angular/core';
import { AdminService } from '../../admin.service';
import { Subject, takeUntil } from 'rxjs';


@Component({
  selector: 'app-admin-prod-sub',
  templateUrl: './admin-prod-sub.component.html',
  styleUrls: ['./admin-prod-sub.component.scss']
})
export class AdminProdSubComponent {
  private destroy$ = new Subject<void>();

  token:any;;
  requirements:any[]=[];
  errorMessage:any;
  constructor(private adminService:AdminService){

  }
  ngOnInit(): void {
    this.token = localStorage.getItem('token')

    this.loadProductSubmissions();
}
loadProductSubmissions() {

  this.adminService.getProductSubmissions(this.token).pipe(takeUntil(this.destroy$))
.subscribe(reqs => {
      this.requirements = reqs.productSubmissions;
      console.log(reqs)
  });
}
truncateText(text: string, maxLength: number): string {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}
forwardSubmission(submissionId: string, requirementId: string, token:any): void {
  this.adminService.forwardProductSubmission(submissionId, requirementId, this.token).pipe(takeUntil(this.destroy$))
.subscribe(
    (response) => {
      alert('Product submission forwarded successfully');
      this.loadProductSubmissions(); // Reload the submissions after forwarding
    },
    (error) => {
      this.errorMessage = `Error forwarding product submission: ${error.message}`;
      console.error('Error details:', error); // Log error details for debugging
    }
  );
}
 
ngOnDestroy(): void {
  // Notify all subscriptions to complete
  this.destroy$.next();
  this.destroy$.complete();

}
}
