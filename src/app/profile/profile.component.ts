import { Component } from '@angular/core';
import { AllService } from '../services/all.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  token:any;
  user:any;
    private destroy$ = new Subject<void>();
  
   constructor(private apiService: AllService){}

   ngOnInit(){
    this.token = localStorage.getItem('token'); // Get the token from localStorage
    this.userProfile()
   }

   userProfile(){
    this.apiService.getUserProfile(this.token).pipe(takeUntil(this.destroy$)).subscribe((data:any)=>{
      console.log(data);
      this.user = data.user
    })
   }
   ngOnDestroy(): void {
    // Notify all subscriptions to complete
    this.destroy$.next();
    this.destroy$.complete();
  
  }
}
