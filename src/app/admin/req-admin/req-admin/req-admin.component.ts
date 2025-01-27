import { Component } from '@angular/core';
import { AdminService } from '../../admin.service';
import { Subject, takeUntil } from 'rxjs';


@Component({
  selector: 'app-req-admin',
  templateUrl: './req-admin.component.html',
  styleUrls: ['./req-admin.component.scss']
})
export class ReqAdminComponent {
  private destroy$ = new Subject<void>();

  token;
  requirements:any;
  constructor(private adminService:AdminService){
    this.token = localStorage.getItem('token')

  }
  ngOnInit(): void {
    this.getRequirements();
}

getRequirements(): void {
    this.adminService.getAllRequirements(this.token).pipe(takeUntil(this.destroy$))
.subscribe(reqs => {
        this.requirements = reqs;
        console.log(reqs)
    });
}
truncateText(text: string, maxLength: number): string {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}
forwardToSuppliers(requirementId: string): void {
    this.adminService.forwardRequirement(requirementId, this.token).pipe(takeUntil(this.destroy$))
.subscribe(response => {
      console.log(response);
      this.getRequirements();

        // this.notificationService.showSuccess(response.message);
    }, error => {
        // this.notificationService.showError(error.message);
    });
}

 
ngOnDestroy(): void {
  // Notify all subscriptions to complete
  this.destroy$.next();
  this.destroy$.complete();

}

}
