import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { BuyerService } from '../../buyer.service';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from 'src/app/notification.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Location } from '@angular/common';
import { FilterOptions } from '../../marketplace-filter/marketplace-filter.component';
import { MarketplaceFilterComponent } from '../../marketplace-filter/marketplace-filter.component';
import { AuthService } from 'src/app/auth/auth.service';
@Component({
  selector: 'app-itembycategory',
  templateUrl: './itembycategory.component.html',
  styleUrls: ['./itembycategory.component.scss']
})
export class ItembycategoryComponent {
  private destroy$ = new Subject<void>();

  catId: any;
  loggedUser!: any;
  products: any[] = [];
  start = 0;
  limit = 10;
  isLoading = false;
  hasMoreProducts = true;
  event!: any;
  quantity!: any;
  quant: any;
  product: any;
  token: any;
  quantities: { [key: string]: number } = {};
  notifications: any[] = [];
  @ViewChild('loadingIndicator') loadingIndicator!: ElementRef;
  @ViewChild('marketplaceFilter') marketplaceFilter!: MarketplaceFilterComponent;

  // View style properties
  viewStyle: 'grid' | 'compact' | 'detailed' = 'compact';
  viewStyles = [
    { value: 'grid', label: 'Grid', icon: 'grid_view' },
    { value: 'compact', label: 'Compact', icon: 'view_comfy' },
    { value: 'detailed', label: 'Detailed', icon: 'view_list' }
  ] as const;
  activeFilters: boolean = false; // New property to track active filters
  showFilterAndClear: boolean = true; // New property to control visibility of filter/clear buttons

  // Filter-related properties
  activeFiltersData: FilterOptions | null = null;
  isFiltering = false;
  totalProducts = 0;
  showFilters = false; // Hidden by default, toggle to show

  constructor(
    private location: Location,
    private BuyerService: BuyerService,
    private actRoute: ActivatedRoute,
    private el: ElementRef,
    private notificationService: NotificationService,
    private authService: AuthService
  ) { }


  ngOnInit() {
    this.actRoute.params.subscribe((param: any) => {
      const newCatId = param['customIdentifer'];
      console.log('ngOnInit: newCatId =', newCatId);
      if (this.catId !== newCatId) {
        this.catId = newCatId;
        // Heuristic to determine if it's a product ID (e.g., "veggie-1724733751238")
        // This assumes product custom identifiers contain a hyphen followed by a number.
        // A more robust solution would involve checking the backend for the type of ID.
        const isProductId = newCatId && newCatId.includes('-') && !isNaN(Number(newCatId.split('-').pop()));
        // For now, always show filter controls since this is the itembycategory component
        // The routing should ensure this component only gets called for categories
        this.showFilterAndClear = true;
        console.log('ngOnInit: showFilterAndClear (after heuristic) =', this.showFilterAndClear);
        // Reset product list, pagination, and filters when category changes
        this.start = 0;
        this.products = [];
        this.hasMoreProducts = true; // Assume there are more products for the new category
        this.isLoading = false; // Reset loading state
        this.isFiltering = false; // Reset filters
        this.activeFiltersData = null; // Clear active filters
        this.showFilters = false; // Close filter panel
        console.log('ngOnInit: showFilters (after reset) =', this.showFilters);
        this.loadProducts();
      } else if (this.products.length === 0) {
        // Load products initially if no category change but products are empty
        this.loadProducts();
      }
    })
    this.token = localStorage.getItem('token');
    console.log(this.quantity);
    this.notificationService.notifications$.pipe(takeUntil(this.destroy$)).pipe(takeUntil(this.destroy$)).subscribe(notifications => {
      this.notifications = notifications;
    });
    this.products.forEach(product => {
      this.quantities[product.id] = this.quantities[product.id] || 1; // Set default quantity to 1
    })
    // Load saved view style preference
    this.loadViewStylePreference();
  }


  ngAfterViewInit(): void {
    this.initIntersectionObserver();
    this.checkContentHeight();
  }

  loadProducts(): void {
    if (this.isLoading || !this.hasMoreProducts) return;

    this.isLoading = true;
    this.token = localStorage.getItem('token');

    console.log('toke', this.token)

    // Use filtered endpoint if filters are active
    if (this.isFiltering && this.activeFiltersData) {
      // Add the current category to the filters
      const categoryFilters = {
        ...this.activeFiltersData,
        categories: [this.catId] // Force the current category
      };

      this.BuyerService.getProductsWithFilters(categoryFilters, this.start, this.limit, this.token)
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
              this.checkContentHeight();
            } else {
              console.error('Unexpected response structure:', response);
              this.checkContentHeight();
            }
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error loading filtered products:', error);
          }
        });
    } else {
      // Use regular category endpoint when no filters
      this.BuyerService.getProductsByCategory(this.token, this.catId, this.start, this.limit).pipe(takeUntil(this.destroy$)).subscribe(
        (data: any) => {
          console.log(data)
          this.isLoading = false;
          if (data && Array.isArray(data.products)) {
            this.products = [...this.products, ...data.products];
            this.totalProducts = data.totalProducts || this.products.length;
            this.hasMoreProducts = data.hasMore !== undefined ? data.hasMore : data.products.length === this.limit;
            this.products.forEach(product => {
              if (!this.quantities[product._id]) {
                this.quantities[product._id] = 1; // Set default quantity to 1 if not already set
              }
              // this.incart[product.id] = data.inCart?.includes(product.id);
            });
            this.start += this.limit;
            this.checkContentHeight();
          } else {
            console.error('Unexpected response structure:', data);
            this.checkContentHeight();
          }
        },
        error => {
          this.isLoading = false;
          console.error('Error loading products:', error);
        }
      );
    }
  }

  checkContentHeight() {
    const contentHeight = this.el.nativeElement.querySelector('.items-')!.offsetHeight;
    const windowHeight = window.innerHeight;
    // this.hasMoreProducts = contentHeight < windowHeight;
    this.hasMoreProducts = contentHeight > windowHeight;
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
    this.BuyerService.addProductToCart(productId, quantity, this.token).pipe(takeUntil(this.destroy$)).subscribe(
      (data: any) => {
        this.loadProducts();
        this.notificationService.addNotification('Item added to cart!', 'success');
      },
      (error: any) => {
        console.error('Error adding product to cart:', error);
      }
    );
  }
  loadViewStylePreference(): void {
    const savedViewStyle = localStorage.getItem('itembycategory-view-style') as 'grid' | 'compact' | 'detailed' | null;
    if (savedViewStyle && this.viewStyles.some(style => style.value === savedViewStyle)) {
      this.viewStyle = savedViewStyle;
    }
  }

  setViewStyle(style: 'grid' | 'compact' | 'detailed'): void {
    this.viewStyle = style;
    localStorage.setItem('itembycategory-view-style', style);

    setTimeout(() => {
      this.start = 0;
      this.products = [];
      this.hasMoreProducts = true;
      this.loadProducts();
    }, 200);
  }

  getViewStyleClass(): string {
    return `view-${this.viewStyle}`;
  }

  goBack() {
    this.location.back()
  }

  openFilter(): void {
    console.log('Open filter panel');
    // TODO: Implement logic to open a filter modal or sidebar
    this.activeFilters = true; // For demonstration, assume filter is applied when opened
  }

  clearFilters(): void {
    console.log('Clear all filters');
    this.activeFilters = false; // Reset active filters
    this.start = 0;
    this.products = [];
    this.hasMoreProducts = true;
    this.loadProducts(); // Reload products without filters
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

    this.activeFiltersData = hasActiveFilters ? filters : null;
    this.isFiltering = hasActiveFilters;

    // Reset and reload products with new filters
    this.start = 0;
    this.products = [];
    this.hasMoreProducts = true;
    this.loadProducts();
  }

  onFiltersCleared(): void {
    console.log('Filters cleared');
    this.activeFiltersData = null;
    this.isFiltering = false;
    this.start = 0;
    this.products = [];
    this.hasMoreProducts = true;
    this.loadProducts();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
    console.log('toggleFilters called: showFilters =', this.showFilters);
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

  ngOnDestroy(): void {
    // Notify all subscriptions to complete
    this.destroy$.next();
    this.destroy$.complete();

  }
}
