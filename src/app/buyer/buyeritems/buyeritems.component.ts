import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { LocalStorageService } from 'src/app/auth/login/local-storage.service'
import { SupplierService } from 'src/app/supplier/supplier.service';
import { BuyerService } from '../buyer.service';
import { MessageService } from 'primeng/api';
import { NotificationService, Notification } from 'src/app/notification.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FilterOptions } from '../marketplace-filter/marketplace-filter.component';
import { MarketplaceFilterComponent } from '../marketplace-filter/marketplace-filter.component';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-buyeritems',
  templateUrl: './buyeritems.component.html',
  styleUrls: ['./buyeritems.component.scss']
})
export class BuyeritemsComponent {
  private destroy$ = new Subject<void>();

  loggedUser!: any;
  products: any[] = [];
  start = 0;
  limit = 10;
  isLoading = false;
  event!: any;
  quantity!: any;
  quant: any;
  product: any;
  token: any;
  quantities: { [key: string]: number } = {};
  notifications: Notification[] = [];

  // Filter-related properties
  activeFilters: FilterOptions | null = null;
  isFiltering = false;
  totalProducts = 0;
  showFilters = false; // Hidden by default, toggle to show
  hasMoreProducts = true; // Initialize to true

  // Search state
  isSearchActive = false;
  isUserTyping = false;

  onSearchStateChange(isActive: boolean): void {
    this.isSearchActive = isActive;
  }

  onTypingStateChange(isTyping: boolean): void {
    this.isUserTyping = isTyping;
  }

  // View style properties
  viewStyle: 'grid' | 'compact' | 'detailed' = 'compact';
  viewStyles = [
    { value: 'grid', label: 'Grid', icon: 'grid_view' },
    { value: 'compact', label: 'Compact', icon: 'view_comfy' },
    { value: 'detailed', label: 'Detailed', icon: 'view_list' }
  ] as const;

  @ViewChild('loadingIndicator') loadingIndicator!: ElementRef;
  @ViewChild('marketplaceFilter') marketplaceFilter!: MarketplaceFilterComponent;
  constructor(
    private supplyService: SupplierService,
    private lService: LocalStorageService,
    private el: ElementRef,
    private buyerService: BuyerService,
    private messageService: MessageService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) { }
  ngOnInit() {
    this.loggedUser = this.lService.getUserIdFromToken();
    this.token = localStorage.getItem('token');

    // Load saved view style preference
    this.loadViewStylePreference();

    this.loadProducts();
    this.notificationService.notifications$.pipe(takeUntil(this.destroy$)).subscribe(notifications => {
      this.notifications = notifications; // Correctly assign the array
      // The NotificationService now handles auto-removal, so we don't need to do it here.
    });
    this.products.forEach(product => {
      this.quantities[product.id] = this.quantities[product.id] || 1; // Set default quantity to 1
    });
  }

  ngAfterViewInit(): void {
    this.initIntersectionObserver();
    // Delay checkContentHeight to ensure DOM is fully ready
    setTimeout(() => this.checkContentHeight(), 100);
  }

  loadProducts(): void {
    if (this.isLoading || !this.hasMoreProducts) return;

    this.isLoading = true;

    // Use filtered endpoint if filters are active
    if (this.isFiltering && this.activeFilters) {
      this.buyerService.getProductsWithFilters(this.activeFilters, this.start, this.limit, this.token)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            console.log('Filtered products response:', response);
            this.isLoading = false;
            if (response && response.success && Array.isArray(response.products)) {
              this.products = [...this.products, ...response.products];
              this.totalProducts = response.totalProducts || this.products.length;
              this.hasMoreProducts = response.hasMore !== undefined ? response.hasMore : response.products.length === this.limit;
              this.products.forEach(product => {
                if (!this.quantities[product._id]) {
                  this.quantities[product._id] = 1;
                }
              });
              this.start += this.limit;
              // Delay checkContentHeight to ensure DOM is ready
              setTimeout(() => this.checkContentHeight(), 100);
            } else {
              console.error('Unexpected response structure:', response);
              // Delay checkContentHeight to ensure DOM is ready
              setTimeout(() => this.checkContentHeight(), 100);
            }
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error loading filtered products:', error);
          }
        });
    } else {
      // Use regular endpoint when no filters
      this.supplyService.getProducts(this.start, this.limit).pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data: any) => {
            console.log(data);
            this.isLoading = false;
            if (data && Array.isArray(data.products)) {
              this.products = [...this.products, ...data.products];
              this.totalProducts = data.totalProducts || this.products.length;
              this.hasMoreProducts = data.hasMore !== undefined ? data.hasMore : data.products.length === this.limit;
              this.products.forEach(product => {
                if (!this.quantities[product._id]) {
                  this.quantities[product._id] = 1;
                }
              });
              this.start += this.limit;
              // Delay checkContentHeight to ensure DOM is ready
              setTimeout(() => this.checkContentHeight(), 100);
            } else {
              console.error('Unexpected response structure:', data);
              // Delay checkContentHeight to ensure DOM is ready
              setTimeout(() => this.checkContentHeight(), 100);
            }
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error loading products:', error);
          }
        });
    }
  }

  onFiltersChanged(filters: FilterOptions): void {
    console.log('Filters changed:', filters);

    // Check if all filters are empty
    const hasActiveFilters = filters.isAllIndia || // "All India" is an active filter!
      filters.cities.length > 0 ||
      filters.states.length > 0 ||
      filters.categories.length > 0 ||
      filters.condition.length > 0 ||
      filters.brand.length > 0 ||
      filters.businessType.length > 0 ||
      filters.minPrice !== null ||
      filters.maxPrice !== null ||
      filters.search.trim() !== '';

    // Create a new object reference to ensure Angular detects the change
    this.activeFilters = { ...filters };
    this.isFiltering = hasActiveFilters;

    // Note: The search component will automatically detect this change via ngOnChanges

    // Reset pagination
    this.start = 0;
    this.products = [];
    this.hasMoreProducts = true;
    this.totalProducts = 0;
    // Load products with new filters
    this.loadProducts();
  }

  onFiltersCleared(): void {
    console.log('Filters cleared');
    this.activeFilters = {
      cities: [],
      states: [],
      categories: [],
      minPrice: null,
      maxPrice: null,
      condition: [],
      brand: [],
      businessType: [],
      sortBy: 'date',
      sortOrder: 'desc',
      search: '',
      isAllIndia: false
    };
    this.isFiltering = false;
    // Reset pagination
    this.start = 0;
    this.products = [];
    this.hasMoreProducts = true;
    this.totalProducts = 0;
    // Load products without filters
    this.loadProducts();
  }


  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  clearAllFiltersFromOutside(): void {
    if (this.marketplaceFilter) {
      this.marketplaceFilter.clearAllFilters();
      this.closeFilters(); // Optionally close the filter panel after clearing
    }
  }

  closeFilters(): void {
    this.showFilters = false;
  }

  checkContentHeight() {
    const contentElement = this.el.nativeElement.querySelector('.items-container');
    if (contentElement) {
      const contentHeight = contentElement.offsetHeight;
      const windowHeight = window.innerHeight;
      // this.hasMoreProducts = contentHeight < windowHeight;
      this.hasMoreProducts = contentHeight > windowHeight;
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.checkContentHeight();
  }

  initIntersectionObserver(): void {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && this.hasMoreProducts && !this.isLoading) {
        this.loadProducts();
      }
    }, {
      rootMargin: '100px'
    });

    if (this.loadingIndicator) {
      observer.observe(this.loadingIndicator.nativeElement);
    }
  }

  addProductToCart(productId: any) {
    const quantity = this.quantities[productId] || 1;
    this.buyerService.addProductToCart(productId, quantity, this.token).pipe(takeUntil(this.destroy$))
      .subscribe(
        (data: any) => {
          this.loadProducts();
          this.notificationService.addNotification('Item added to cart!', 'success');
        },
        (error: any) => {
          console.error('Error adding product to cart:', error);
        }
      );
  }

  // View style management methods
  loadViewStylePreference(): void {
    const savedViewStyle = localStorage.getItem('buyer-marketplace-view-style') as 'grid' | 'compact' | 'detailed' | null;
    if (savedViewStyle && this.viewStyles.some(style => style.value === savedViewStyle)) {
      this.viewStyle = savedViewStyle;
    }
  }

  setViewStyle(style: 'grid' | 'compact' | 'detailed'): void {
    this.viewStyle = style;
    localStorage.setItem('buyer-marketplace-view-style', style);

    // Reset pagination when changing view styles to ensure proper loading
    setTimeout(() => {
      this.start = 0;
      this.products = [];
      this.hasMoreProducts = true;
      this.totalProducts = 0;
      this.loadProducts();
    }, 200); // Increased delay to ensure DOM is ready
  }

  getViewStyleClass(): string {
    return `view-${this.viewStyle}`;
  }

  ngOnDestroy(): void {
    // Notify all subscriptions to complete
    this.destroy$.next();
    this.destroy$.complete();

  }
  // gotocart(){
  //   this.router.navigate['/']
  // }
}
