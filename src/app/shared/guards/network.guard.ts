import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { NetworkService } from '../services/network.service';

@Injectable({
  providedIn: 'root'
})
export class NetworkGuard implements CanActivate {
  constructor(
    private networkService: NetworkService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean> {
    const isOnline = await this.networkService.checkNetworkStatus();
    
    if (!isOnline) {
      await this.router.navigate(['/offline']);
      return false;
    }
    
    return true;
  }
} 