import { Component } from '@angular/core';
import { AdminService } from '../admin.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-usersrequests',
  templateUrl: './usersrequests.component.html',
  styleUrls: ['./usersrequests.component.scss']
})
export class UsersrequestsComponent {
  private destroy$ = new Subject<void>();

  token:any;
  requests:any;
  expandedRequests: boolean[] = []; // Track expanded state of each request
  constructor(private adminService:AdminService){

  }
  
  ngOnInit(){
   this.token =  localStorage.getItem('token');
   this.getRequirements();
  }
  getRequirements(): void {
    this.adminService.getUsersRequirement(this.token).pipe(takeUntil(this.destroy$)).subscribe(reqs => {
        this.requests = reqs;
        this.expandedRequests = new Array(this.requests.length).fill(false); // Initialize array
        console.log(reqs)
    });
    
}
 // Toggle full details view for a specific request
 toggleRequestDetails(index: number): void {
  this.expandedRequests[index] = !this.expandedRequests[index];
}
ngOnDestroy(): void {
  // Notify all subscriptions to complete
  this.destroy$.next();
  this.destroy$.complete();

}

}
