import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor(public authService: AuthService, private router: Router) {
  
  }
  ngOnInit(): void {
    if(this.authService.isLoggedIn()){
      if (this.authService.isAdmin()) {
        this.router.navigate(['/admin/home']);
      } else if (this.authService.isSupplier()) {
        this.router.navigate(['/supplier']);
      } else if (this.authService.isBuyer()) {
        this.router.navigate(['/buyer']);
      } else {
        this.router.navigate(['/login']);
        
      }
    }
    else{
      this.router.navigate(['/login']);

    }
   
  }

}
