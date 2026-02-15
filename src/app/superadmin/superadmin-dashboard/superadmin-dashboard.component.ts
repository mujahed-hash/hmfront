import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SuperadminService } from '../superadmin.service';

interface UserStats {
  totalUsers: number;
  admins: number;
  suppliers: number;
  buyers: number;
}

interface User {
  _id: string;
  isAdmin: boolean;
  isSupplier: boolean;
  isBuyer: boolean;
}

@Component({
  selector: 'app-superadmin-dashboard',
  templateUrl: './superadmin-dashboard.component.html',
  styleUrls: ['./superadmin-dashboard.component.scss']
})
export class SuperadminDashboardComponent implements OnInit {
  userStats: UserStats = {
    totalUsers: 0,
    admins: 0,
    suppliers: 0,
    buyers: 0
  };

  constructor(
    private superadminService: SuperadminService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUserStats();
  }

  loadUserStats(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.superadminService.getAllUsersWithPasswords(token).subscribe(
        (data: User[]) => {
          this.userStats.totalUsers = data.length;
          this.userStats.admins = data.filter((user: User) => user.isAdmin).length;
          this.userStats.suppliers = data.filter((user: User) => user.isSupplier).length;
          this.userStats.buyers = data.filter((user: User) => user.isBuyer).length;
        },
        (error) => {
          console.error('Error fetching user stats:', error);
        }
      );
    }
  }

  navigateToPasswordManager(): void {
    this.router.navigate(['/superadmin/password-manager']);
  }
}