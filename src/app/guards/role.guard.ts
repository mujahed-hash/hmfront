// src/app/guards/role.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles = route.data['role']; // Changed to expectedRoles
    const userRole = this.authService.getUserRole();

    // Special case for superadmin route - only allow superadmin
    if (expectedRoles === 'superadmin') { // Keep this for backward compatibility if 'superadmin' is passed as a string
      if (this.authService.isSuperAdmin()) {
        return true;
      } else {
        this.router.navigate(['/login']);
        return false;
      }
    }

    // Check if expectedRoles is an array and if the user has any of the roles, or is admin/superadmin
    if (Array.isArray(expectedRoles)) {
      if (expectedRoles.some(role => userRole === role) || this.authService.isAdmin() || this.authService.isSuperAdmin()) {
        return true;
      }
    } else { // Handle single expected role for backward compatibility
      if (userRole === expectedRoles || this.authService.isAdmin() || this.authService.isSuperAdmin()) {
        return true;
      }
    }

    this.router.navigate(['/login']);
    return false;
  }
}
