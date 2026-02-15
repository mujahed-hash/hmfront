import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  canActivate(): boolean {
    if (this.authService.isAdmin() || this.authService.isSuperAdmin()) {
      return true;
    } else {
      this.snackBar.open('Access denied. Admin privileges required.', 'Close', {
        duration: 3000
      });
      this.router.navigate(['/']);
      return false;
    }
  }
}
