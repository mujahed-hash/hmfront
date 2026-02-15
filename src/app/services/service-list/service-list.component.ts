import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { ServiceService } from '../../services/service.service';
import { AuthService } from '../../auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface Service {
  _id: string;
  serviceName: string;
  serviceDesc: string;
  user?: { _id: string; name?: string; }; // Made user object optional
  images: string[];
  customIdentifier: string;
  price: number;
  category: {
    _id: string;
    name: string;
    description?: string;
    icon?: string;
    image?: string;
    customIdentifier: string;
    isActive?: boolean;
    sortOrder?: number;
  } | null;
  availableRegions: string[];
  contactInfo: { phone: string; email: string; };
  date: Date;
  isApproved: boolean;
  isActive: boolean;
}

@Component({
  selector: 'app-service-list',
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.scss']
})
export class ServiceListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  services: Service[] = [];
  loading: boolean = false;
  error: string = '';

  // Pagination (manual load more)
  start = 0;
  limit = 10; // Production limit for better user experience
  hasMoreServices = true;
  totalServices: number = 0;

  searchTerm: string = '';
  selectedFilter: string = 'all';
  currentUserId: string | null = null;
  isAdmin: boolean = false;
  isSuperAdmin: boolean = false;
  isMyServicesView: boolean = false; // New property to track if it's the 'My Services' view
  isAdminView: boolean = false; // New property to track if it's the 'Admin Services' view

  // Reference to the main scrollable element (mat-sidenav-content)
  private mainScrollElement: HTMLElement | null = null;
  private scrollListener: ((event: Event) => void) | null = null;

  constructor(
    private serviceService: ServiceService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private ngZone: NgZone,
    private route: ActivatedRoute // Inject ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserId();
    this.isAdmin = this.authService.isAdmin();
    this.isSuperAdmin = this.authService.isSuperAdmin();
    this.isMyServicesView = this.route.snapshot.data['isMyServicesView'] || false; // Set based on route data
    this.isAdminView = this.route.snapshot.data['isAdminView'] || false; // Set based on route data

    console.log('=== COMPONENT INIT DEBUG ===');
    console.log('Current user ID:', this.currentUserId);
    console.log('isMyServicesView flag:', this.isMyServicesView);
    console.log('isAdminView flag:', this.isAdminView);
    console.log('Route data:', this.route.snapshot.data);

    this.loadServices();

    // Defer scroll tracking initialization until mat-sidenav-content is available
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.mainScrollElement = document.querySelector('mat-sidenav-content');
        if (this.mainScrollElement) {
          this.initScrollTracking();
        } else {
          console.warn('mat-sidenav-content not found. Scroll tracking disabled.');
        }
      }, 500); // Give Angular time to render mat-sidenav-content
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.mainScrollElement && this.scrollListener) {
      this.mainScrollElement.removeEventListener('scroll', this.scrollListener);
    }
  }

  // Initialize scroll position tracking
  initScrollTracking(): void {
    let lastLoggedPosition = -1;
    let logThrottleTimer: any | null = null;

    if (!this.mainScrollElement) {
      console.warn('Cannot initialize scroll tracking: mainScrollElement is null.');
      return;
    }

    this.scrollListener = (event: Event) => {
      const scrollElement = this.mainScrollElement as HTMLElement;
      const currentScrollTop = scrollElement.scrollTop;
      const scrollHeight = scrollElement.scrollHeight;
      const clientHeight = scrollElement.clientHeight;

      const maxScroll = Math.max(0, scrollHeight - clientHeight);
      const scrollPercentage = maxScroll > 0 ? Math.round((currentScrollTop / maxScroll) * 100) : 0;

      if (Math.abs(currentScrollTop - lastLoggedPosition) >= 5 || scrollPercentage % 2 === 0 || currentScrollTop === 0 || currentScrollTop >= maxScroll - 20) {
        if (logThrottleTimer) {
          clearTimeout(logThrottleTimer);
        }

        logThrottleTimer = setTimeout(() => {
          console.log('🔍 Scroll Position:', {
            scrollTop: currentScrollTop,
            scrollHeight: scrollHeight,
            clientHeight: clientHeight,
            maxScroll: maxScroll,
            scrollPercentage: scrollPercentage + '%',
            timestamp: new Date().toLocaleTimeString(),
            url: window.location.href,
            eventType: event.type,
            target: (event.target as HTMLElement)?.tagName || 'unknown'
          });
          lastLoggedPosition = currentScrollTop;
        }, 20); // Very minimal throttle time for active tracking
      }
    };

    this.mainScrollElement.addEventListener('scroll', this.scrollListener, { passive: true });
    console.log('📊 Scroll tracking initialized on mat-sidenav-content');

    setTimeout(() => {
      console.log('🔍 Testing scroll listener on mat-sidenav-content...');
      const testEvent = new Event('scroll', { bubbles: true });
      this.mainScrollElement?.dispatchEvent(testEvent);
    }, 1000);
  }

  loadServices(reset: boolean = false): void {
    if (this.loading && !reset) return; // Prevent multiple loads unless resetting
    if (!this.hasMoreServices && !reset) return; // No more services to load unless resetting

    if (reset) {
      this.start = 0;
      this.services = [];
      this.hasMoreServices = true;
    }

    // Save scroll position BEFORE any DOM changes
    const scrollElement = this.mainScrollElement || document.documentElement || document.body;
    const currentScrollPosition = scrollElement.scrollTop;

    this.loading = true;
    this.error = '';

    const queryParams: any = {
      start: this.start,
      limit: this.limit,
      search: this.searchTerm
    };

    if (this.isMyServicesView) {
      queryParams.isMyServicesView = 'true'; // Add isMyServicesView flag as string for backend filtering
    } else if (this.isAdminView) {
      queryParams.isAdminView = 'true'; // Add isAdminView flag as string for backend filtering
    }

    if (this.selectedFilter === 'active') {
      queryParams.isActive = 'true';
      queryParams.isApproved = 'true';
    } else if (this.selectedFilter === 'pending') {
      queryParams.isApproved = 'false';
    }

    console.log('=== FRONTEND DEBUG: My Services API Call ===');
    console.log('Query params being sent:', queryParams);
    console.log('isMyServicesView flag:', this.isMyServicesView);
    console.log('Current user ID:', this.currentUserId);

    this.serviceService.getAllServices(queryParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('API Response:', response);
          this.loading = false;
          // Handle response - backend may or may not have 'success' field
          if (response.success !== false && response.services) {
            // Append new services to existing ones for manual pagination
            this.services = [...this.services, ...response.services];
            this.totalServices = response.totalServices || 0;
            this.hasMoreServices = response.services.length === this.limit; // Check if the number of returned services equals the limit
            this.start += this.limit;

            console.log(`Loaded ${response.services.length} services for user ${this.currentUserId}`);

            // Restore scroll position to where it was BEFORE loading new data
            this.ngZone.runOutsideAngular(() => {
              setTimeout(() => {
                if (scrollElement) {
                  scrollElement.scrollTop = currentScrollPosition;
                  console.log(`Scroll restored to original position: ${currentScrollPosition}`);
                }
              }, 50); // Small delay to allow DOM to update
            });
          } else {
            console.log('API response indicates failure:', response);
            this.error = response.message || 'Failed to load services';
          }
        },
        error: (error) => {
          console.error('Error fetching services:', error);
          this.snackBar.open('Failed to load services.', 'Close', { duration: 3000 });
          this.loading = false;
          this.error = 'Failed to load services. Please try again.';
        }
      });
  }

  applyFilter(): void {
    // No longer takes an event object, as search term is directly bound
    // this.searchTerm = (event.target as HTMLInputElement).value;
    this.loadServices(true); // Reset and load from start
  }

  setFilter(filter: string): void {
    this.selectedFilter = filter;
    this.loadServices(true); // Reset and load from start
  }

  viewService(customIdentifier: string): void {
    this.router.navigate(['/services', customIdentifier]);
  }

  editService(customIdentifier: string): void {
    this.router.navigate(['/services', customIdentifier, 'edit']);
  }

  deleteService(customIdentifier: string): void {
    if (confirm('Are you sure you want to delete this service?')) {
      this.serviceService.deleteService(customIdentifier).subscribe(
        () => {
          this.snackBar.open('Service deleted successfully.', 'Close', { duration: 3000 });
          this.loadServices(true); // Reload services after deletion
        },
        (error) => {
          console.error('Error deleting service:', error);
          this.snackBar.open('Failed to delete service.', 'Close', { duration: 3000 });
        }
      );
    }
  }

  approveService(customIdentifier: string): void {
    if (confirm('Are you sure you want to approve this service?')) {
      this.serviceService.approveService(customIdentifier).subscribe(
        () => {
          this.snackBar.open('Service approved successfully.', 'Close', { duration: 3000 });
          this.loadServices(true); // Reload to update status
        },
        (error) => {
          console.error('Error approving service:', error);
          this.snackBar.open('Failed to approve service.', 'Close', { duration: 3000 });
        }
      );
    }
  }

  toggleServiceStatus(customIdentifier: string): void {
    if (confirm('Are you sure you want to toggle the status of this service?')) {
      this.serviceService.toggleServiceStatus(customIdentifier).subscribe(
        () => {
          this.snackBar.open('Service status toggled successfully.', 'Close', { duration: 3000 });
          this.loadServices(true); // Reload to update status
        },
        (error) => {
          console.error('Error toggling service status:', error);
          this.snackBar.open('Failed to toggle service status.', 'Close', { duration: 3000 });
        }
      );
    }
  }

  isServiceOwner(service: Service): boolean {
    const isOwner = this.currentUserId === service.user?._id;
    console.log('🔍 Ownership check:', {
      currentUserId: this.currentUserId,
      serviceUserId: service.user?._id,
      serviceName: service.serviceName,
      isOwner: isOwner
    });
    return isOwner;
  }

  getDisplayRange(): { start: number; end: number } {
    if (this.services.length === 0) {
      return { start: 0, end: 0 };
    }
    const start = this.start - this.limit + 1;
    const end = Math.min(this.start, this.totalServices);
    return { start, end };
  }

  // No longer needed for manual pagination
  // onPageChange(event: PageEvent): void {
  //   this.pageIndex = event.pageIndex;
  //   this.pageSize = event.pageSize;
  //   this.loadServices();
  // }
}
