import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { AdminServiceOrderService } from '../admin-service-order.service';
import { Router } from '@angular/router';
import { StatusOption } from 'src/app/shared/custom-status-selector/custom-status-selector.component'; // Import StatusOption

@Component({
  selector: 'app-all-service-orders',
  templateUrl: './all-service-orders.component.html',
  styleUrls: ['./all-service-orders.component.scss']
})
export class AllServiceOrdersComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>(); // Subject for search term debouncing
  private searchSubscription!: Subscription; // To hold the subscription
  private isDeleting = false; // Track if user is currently deleting characters
  private searchInputFocused = false; // Track if search input is focused

  serviceOrders: any[] = [];
  filteredOrders: any[] = [];
  stats: any = {};
  isLoading = false;
  error: string = '';

  // Filtering and pagination (infinite scroll)
  start = 0;
  limit = 10;
  hasMoreOrders = true;
  totalOrders = 0;

  // Filter options
  searchTerm = '';
  selectedStatus = '';
  dateFrom = '';
  dateTo = '';
  sortBy = 'date';
  sortOrder = 'desc';

  statusOptions: StatusOption[] = [
    { value: 'pending', label: 'Pending', icon: 'schedule' },
    { value: 'confirmed', label: 'Confirmed', icon: 'check_circle' },
    { value: 'in_progress', label: 'In Progress', icon: 'sync' },
    { value: 'completed', label: 'Completed', icon: 'done' },
    { value: 'cancelled', label: 'Cancelled', icon: 'cancel' },
    { value: 'awaiting_user_response', label: 'Awaiting User Response', icon: 'person_outline' },
    { value: 'awaiting_admin_action', label: 'Awaiting Admin Action', icon: 'admin_panel_settings' },
  ];

  // This `statuses` array is for the filter dropdown, not the custom status selector.
  statuses = [
    { value: '', label: 'All Statuses' }, // Option to show all statuses
    ...this.statusOptions.map(s => ({ value: s.value, label: s.label })) // Spread only value and label
  ];

  sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'totalPrice', label: 'Total Price' },
    { value: 'status', label: 'Status' },
    { value: 'customerInfo.name', label: 'Customer Name' },
    { value: 'asc', label: 'Ascending' }, // Added for sort order
    { value: 'desc', label: 'Descending' } // Added for sort order
  ];

  // Reference to the main scrollable element (mat-sidenav-content)
  private mainScrollElement: HTMLElement | null = null;

  constructor(
    private serviceOrderService: AdminServiceOrderService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.setupSearchDebounce(); // Call this to set up debouncing
    this.setupKeyEventListeners(); // Set up key event listeners for delete/backspace detection
    this.loadServiceOrders(true); // true indicates initial load
    this.loadStats();
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
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe(); // Unsubscribe to prevent memory leaks
    }
    // Remove scroll listener
    if (this.mainScrollElement && this.scrollListener) {
      this.mainScrollElement.removeEventListener('scroll', this.scrollListener);
    }
  }

  private setupKeyEventListeners(): void {
    // We'll listen to keydown and keyup events on the document to detect backspace/delete globally
    // This is more reliable than trying to find the specific input element
    this.ngZone.runOutsideAngular(() => {
      const keydownHandler = (event: KeyboardEvent) => {
        if (event.key === 'Backspace' || event.key === 'Delete') {
          this.isDeleting = true;
        }
      };

      const keyupHandler = (event: KeyboardEvent) => {
        if (event.key === 'Backspace' || event.key === 'Delete') {
          this.isDeleting = false;
          // Trigger search immediately when user releases backspace/delete if input is empty
          if (this.searchTerm.trim() === '') {
            this.ngZone.run(() => {
              this.start = 0;
              this.hasMoreOrders = true;
              this.serviceOrders = [];
              this.filteredOrders = [];
              this.loadServiceOrders(true); // true indicates initial load for search
              // Maintain focus after clearing search
              setTimeout(() => this.maintainSearchInputFocus(), 100);
            });
          }
        }
      };

      document.addEventListener('keydown', keydownHandler);
      document.addEventListener('keyup', keyupHandler);

      // Clean up listeners on destroy
      this.destroy$.subscribe(() => {
        document.removeEventListener('keydown', keydownHandler);
        document.removeEventListener('keyup', keyupHandler);
      });
    });
  }

  // Initialize scroll position tracking
  private scrollListener: ((event: Event) => void) | null = null;

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

      // Log frequently during active scrolling (minimal throttling)
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

    // Test if listener is working by triggering a fake scroll event
    setTimeout(() => {
      console.log('🔍 Testing scroll listener on mat-sidenav-content...');
      const testEvent = new Event('scroll', { bubbles: true });
      this.mainScrollElement?.dispatchEvent(testEvent);
    }, 1000);
  }

  loadServiceOrders(isInitialLoad: boolean = false): void {
    if (this.isLoading || !this.hasMoreOrders) return;

    // Store scroll position before loading more data
    const scrollPosition = this.mainScrollElement?.scrollTop || 0;
    
    // Don't block the UI during search - remove loading state for search operations
    // This prevents the input from becoming unresponsive during searches
    const isSearchOperation = this.searchTerm.trim() !== '';

    if (!isSearchOperation) {
      this.isLoading = true;
    }
    this.error = '';

    const params = {
      start: this.start,
      limit: this.limit,
      status: this.selectedStatus,
      search: this.searchTerm,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };

    this.serviceOrderService.getAllServiceOrders(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (!isSearchOperation) {
            this.isLoading = false;
          }
          if (response.success) {
            // Update data first
            this.serviceOrders = [...this.serviceOrders, ...response.orders];
            this.filteredOrders = this.serviceOrders;
            this.totalOrders = response.pagination.totalCount;
            this.hasMoreOrders = response.pagination.hasMore;
            this.start += this.limit;

            // Maintain focus on search input after search completes
            this.maintainSearchInputFocus();
            
            // If this is not an initial load (i.e., it's a "Load More" action), restore scroll position
            if (!isInitialLoad) {
              setTimeout(() => {
                if (this.mainScrollElement) {
                  this.mainScrollElement.scrollTop = scrollPosition;
                  console.log('📜 Restored scroll position to:', scrollPosition);
                }
              }, 100);
            }
          } else {
            this.error = response.message || 'Failed to load service orders';
            // Maintain focus even on error
            this.maintainSearchInputFocus();
          }
        },
        error: (error) => {
          if (!isSearchOperation) {
            this.isLoading = false;
          }
          this.error = 'Failed to load service orders. Please try again.';
          console.error('Error loading service orders:', error);
          // Maintain focus even on error
          this.maintainSearchInputFocus();
        }
      });
  }

  loadStats(): void {
    this.serviceOrderService.getServiceOrderStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.stats = response.stats;
          }
        },
        error: (error) => {
          console.error('Error loading stats:', error);
        }
      });
  }

  onFilterChange(): void {
    // Trigger immediate search for filter changes (status, date, sort)
    this.start = 0;
    this.hasMoreOrders = true;
    this.serviceOrders = [];
    this.filteredOrders = [];
    this.loadServiceOrders(true); // true indicates initial load for filter changes

    // Maintain focus for search input operations
    if (this.searchInputFocused) {
      setTimeout(() => this.maintainSearchInputFocus(), 100);
    }
  }

  onSearchInputChange(): void {
    // Handle search input changes with debounced search (unless actively deleting)
    if (!this.isDeleting) {
      this.searchSubject.next(this.searchTerm);
    } else {
      // If user was deleting and now stopped, trigger search immediately if input is empty
      if (this.searchTerm.trim() === '') {
        this.start = 0;
        this.hasMoreOrders = true;
        this.serviceOrders = [];
        this.filteredOrders = [];
        this.loadServiceOrders(true); // true indicates initial load for search
        // Maintain focus after clearing search
        setTimeout(() => this.maintainSearchInputFocus(), 100);
      }
    }
  }

  onEnterKey(): void {
    // When Enter is pressed, trigger search immediately regardless of deleting state
    this.start = 0;
    this.hasMoreOrders = true;
    this.serviceOrders = [];
    this.filteredOrders = [];
    this.loadServiceOrders(true); // true indicates initial load for search

    // Maintain focus after Enter key search
    if (this.searchInputFocused) {
      setTimeout(() => this.maintainSearchInputFocus(), 100);
    }
  }

  onSearchInputFocus(): void {
    this.searchInputFocused = true;
  }

  onSearchInputBlur(): void {
    this.searchInputFocused = false;
  }

  // Ensure search input maintains focus during search operations
  private maintainSearchInputFocus(): void {
    if (this.searchInputFocused) {
      // Use setTimeout to ensure focus is maintained after DOM updates
      setTimeout(() => {
        const searchInput = document.querySelector('input[placeholder="Order ID, customer name, email, phone"]') as HTMLInputElement;
        if (searchInput && document.activeElement !== searchInput) {
          searchInput.focus();
        }
      }, 100);
    }
  }

  private setupSearchDebounce(): void {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(800), // Increased to 800ms to reduce API calls and improve responsiveness
      distinctUntilChanged(), // Only emit when the current value is different from the last
      takeUntil(this.destroy$)
    ).subscribe(() => {
      // This block will be executed only after the user stops typing for 800ms
      this.start = 0;
      this.hasMoreOrders = true;
      this.serviceOrders = [];
      this.filteredOrders = [];
      this.loadServiceOrders(true); // true indicates initial load for search
    });
  }


  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.sortBy = 'date';
    this.sortOrder = 'desc';
    this.start = 0;
    this.hasMoreOrders = true;
    this.serviceOrders = [];
    this.filteredOrders = [];
    this.loadServiceOrders();
  }

  // onDateRangeChange method removed as we're using separate date pickers with onFilterChange

  updateOrderStatus(order: any, newStatus: string): void {
    this.serviceOrderService.updateServiceOrder(order.customIdentifier, { status: newStatus })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            order.status = newStatus;
            this.loadStats(); // Refresh stats
          }
        },
        error: (error) => {
          console.error('Error updating order status:', error);
        }
      });
  }

  cancelOrder(order: any, reason: string): void {
    this.serviceOrderService.cancelServiceOrder(order.customIdentifier, { reason })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            order.status = 'cancelled';
            order.cancellationReason = reason;
            this.loadStats(); // Refresh stats
          }
        },
        error: (error) => {
          console.error('Error cancelling order:', error);
        }
      });
  }

  deleteOrder(order: any): void {
    if (confirm('Are you sure you want to delete this service order? This action cannot be undone.')) {
      this.serviceOrderService.deleteServiceOrder(order.customIdentifier)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.serviceOrders = this.serviceOrders.filter(o => o._id !== order._id);
              this.loadStats(); // Refresh stats
            }
          },
          error: (error) => {
            console.error('Error deleting order:', error);
          }
        });
    }
  }

  viewOrderDetails(customIdentifier: string): void {
    this.router.navigate(['/admin/service-orders', customIdentifier]);
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'pending': 'status-pending',
      'confirmed': 'status-confirmed',
      'in_progress': 'status-in-progress',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled',
      'awaiting_user_response': 'status-awaiting-user',
      'awaiting_admin_action': 'status-awaiting-admin'
    };
    return statusClasses[status] || '';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getDisplayRange(): { start: number, end: number } {
    const start = 1;
    const end = Math.min(this.serviceOrders.length, this.totalOrders);
    return { start, end };
  }

  capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
