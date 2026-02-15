import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AllService } from '../../services/all.service';
import { AuthService } from '../../auth/auth.service';
import { AlertService } from '../../all-services/alert.service';

interface ServiceOrder {
  _id: string;
  service: {
    _id: string;
    serviceName: string;
    images?: string[];
    price: number;
  };
  user: string; // User ID
  supplier: {
    _id: string;
    name: string;
  };
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  notes: string;
  price: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  customIdentifier: string;
  date: Date;
  conversation?: any[]; // Optional, will be populated in detail view
}

@Component({
  selector: 'app-user-service-orders',
  templateUrl: './user-service-orders.component.html',
  styleUrls: ['./user-service-orders.component.scss']
})
export class UserServiceOrdersComponent implements OnInit, OnDestroy {
  orders: ServiceOrder[] = [];
  isLoading = false;
  error = false;
  errorMessage = '';
  
  // Pagination properties
  start = 0;
  limit = 20;
  hasMoreOrders = true;
  totalOrders = 0;
  
  // Debug properties
  apiCallStatus = 'Not started';

  private destroy$ = new Subject<void>();

  constructor(
    private allService: AllService,
    public authService: AuthService,
    private router: Router,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    console.log('🚀 UserServiceOrdersComponent initialized');
    console.log('🚀 Initial state - isLoading:', this.isLoading, 'hasMoreOrders:', this.hasMoreOrders);
    this.apiCallStatus = 'Component initialized';
    this.loadUserOrders();
  }

  ngOnDestroy(): void {
    console.log('🔄 UserServiceOrdersComponent being destroyed');
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserOrders(): void {
    console.log('loadUserOrders called - isLoading:', this.isLoading, 'hasMoreOrders:', this.hasMoreOrders);
    this.apiCallStatus = 'loadUserOrders called';
    
    if (this.isLoading) {
      console.log('Already loading, skipping...');
      this.apiCallStatus = 'Already loading, skipping...';
      return;
    }

    this.isLoading = true;
    this.error = false;
    this.errorMessage = '';

    const token = this.authService.getToken();
    console.log('Token exists:', !!token);
    console.log('Token length:', token ? token.length : 0);
    console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
    
    if (!token) {
      console.log('❌ No authentication token found');
      this.apiCallStatus = 'No authentication token found';
      this.alertService.error('You are not authenticated. Please log in.', 'Authentication Required', false);
      this.isLoading = false;
      this.error = true;
      this.router.navigate(['/login']);
      return;
    }

    console.log('Making API call with start:', this.start, 'limit:', this.limit);
    this.apiCallStatus = 'About to make API call';
    
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.error('⏰ API call timeout - no response received after 10 seconds');
      this.apiCallStatus = 'API call timeout';
      this.isLoading = false;
      this.error = true;
      this.errorMessage = 'Request timeout. Please try again.';
    }, 10000); // 10 second timeout
    
    // Add a simple test to see if the observable is being created
    console.log('🔍 About to call getUserServiceOrders...');
    
    // TEMPORARY TEST: Check if the issue is with the API call
    console.log('🧪 Testing API call...');
    this.apiCallStatus = 'Making API call...';
    
    console.log('🔍 Creating observable...');
    const observable = this.allService.getUserServiceOrders(token, this.start, this.limit);
    console.log('🔍 Observable created:', observable);
    
    console.log('🔍 Creating subscription...');
    const subscription = observable.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        console.log('🔍 Subscription next callback called');
        clearTimeout(timeout);
        this.apiCallStatus = 'API call successful';
        console.log('✅ API Response received:', response);
        console.log('Response type:', typeof response);
        console.log('Response success:', response?.success);
        console.log('Response orders:', response?.orders);
        console.log('Response pagination:', response?.pagination);
        
        this.isLoading = false;
        
        if (response && response.success && response.orders) {
          // Append new orders to existing orders for load more functionality
          this.orders = [...this.orders, ...response.orders];
          this.totalOrders = response.pagination.totalCount;
          this.hasMoreOrders = response.pagination.hasMore;
          this.start += this.limit;
          console.log('✅ Orders updated - total:', this.orders.length, 'hasMore:', this.hasMoreOrders);
        } else {
          console.log('❌ No orders found or invalid response');
          if (this.orders.length === 0) {
            this.orders = [];
            this.alertService.default('No service orders found.', 'Information');
          }
        }
      },
      error: (err: any) => { // Explicitly type err as any
        console.log('🔍 Subscription error callback called');
        clearTimeout(timeout);
        this.apiCallStatus = 'API call failed';
        console.error('❌ API Error:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        console.error('Error details:', err.error);
        
        this.error = true;
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to load service orders. Please try again later.';
        this.alertService.error(this.errorMessage, 'Error', false);
      }
    });
  }

  viewOrderDetails(orderId: string): void {
    this.router.navigate(['/my-service-orders', orderId]);
  }

  // Helper method to get display range for pagination info
  getDisplayRange(): { start: number; end: number } {
    const start = this.orders.length > 0 ? 1 : 0;
    const end = this.orders.length;
    return { start, end };
  }

  // Method to load more orders
  loadMoreOrders(): void {
    if (!this.hasMoreOrders) return;
    this.loadUserOrders();
  }

  getImageUrl(imagePath: string | undefined): string {
    if (!imagePath) return 'assets/images/no-image-placeholder.jpg';
    if (imagePath.startsWith('http')) {
      return imagePath;
    } else {
      return imagePath; // Backend now sends full URLs
    }
  }

  // Helper for status styling
  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'confirmed':
      case 'in_progress':
      case 'awaiting_admin_action':
      case 'awaiting_user_response':
        return 'status-in-progress';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  // Helper for status text
  getDisplayStatus(status: string): string {
    return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
}
