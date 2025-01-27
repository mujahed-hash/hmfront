import { Component } from '@angular/core';
import { AdminService } from '../../admin.service';
import { Subject, takeUntil } from 'rxjs';


@Component({
  selector: 'app-allusers',
  templateUrl: './allusers.component.html',
  styleUrls: ['./allusers.component.scss']
})
export class AllusersComponent {
  private destroy$ = new Subject<void>();

  token!:any;
  users!:any;
  constructor(private adminService:AdminService){
    this.token = localStorage.getItem('token')

  }
  ngOnInit(){
    this.getAllUsers();
  }
  getAllUsers(){
    this.adminService.getUsers(this.token).pipe(takeUntil(this.destroy$))
    .subscribe((data:any)=>{
      console.log(data);
      this.users = data
    })
  }
  ngOnDestroy(): void {
    // Notify all subscriptions to complete
    this.destroy$.next();
    this.destroy$.complete();
  
  }

}
