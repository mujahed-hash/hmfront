import { Component,ElementRef,HostListener, ViewChild } from '@angular/core';
import { SupplierService } from '../../supplier.service';
import { LocalStorageService } from 'src/app/auth/login/local-storage.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
@Component({
  selector: 'app-allitems',
  templateUrl: './allitems.component.html',
  styleUrls: ['./allitems.component.scss']
})
export class AllitemsComponent {
  loggedUser!:any;
  products: any[] = [];
  start = 0;
  limit = 10;
  isLoading = false;
  hasMoreProducts = true;
  event!:any;
  token:any;
  error: string = '';
  private destroy$ = new Subject<void>();

  @ViewChild('loadingIndicator') loadingIndicator!: ElementRef;

  // View style properties
  viewStyle: 'grid' | 'compact' | 'detailed' = 'compact';
  viewStyles = [
    { value: 'grid', label: 'Grid', icon: 'grid_view' },
    { value: 'compact', label: 'Compact', icon: 'view_comfy' },
    { value: 'detailed', label: 'Detailed', icon: 'view_list' }
  ] as const;

   constructor(private supplyService: SupplierService,private lService:LocalStorageService,  private el: ElementRef){}
   ngOnInit() {
    this.token = localStorage.getItem('token')

    this.loggedUser = this.lService.getUserIdFromToken();
    this.loadProducts();
    this.loadViewStylePreference();
  }

  ngAfterViewInit(): void {
    this.initIntersectionObserver();
    this.checkContentHeight();
  }

  loadProducts(): void {
    if (this.isLoading || !this.hasMoreProducts) return;

    this.isLoading = true;
    console.log('Loading products with token:', this.token ? 'present' : 'missing');

    this.supplyService.getItems(this.start, this.limit, this.token).pipe(takeUntil(this.destroy$)).subscribe(
      data => {
        this.isLoading = false;
        console.log('API Response:', data);

        if (data && Array.isArray(data.products)) {
          this.products = [...this.products, ...data.products];
          this.start += this.limit;
          this.checkContentHeight();

          // If fewer products are returned than the limit, no more products are available
          this.hasMoreProducts = data.products.length === this.limit;
          console.log(`Loaded ${data.products.length} products. Total: ${this.products.length}`);

          // Debug: Check if products have customIdentifier
          if (data.products.length > 0) {
            console.log('Sample product customIdentifier:', data.products[0].customIdentifier || 'MISSING!');
          }
        } else {
          console.error('Unexpected response structure:', data);
          this.error = 'Invalid response format from server.';
          this.checkContentHeight();
        }
      },
      error => {
        this.isLoading = false;
        console.error('Error loading products:', error);
        if (error.status === 0) {
          this.error = 'Cannot connect to server. Please check if the backend server is running.';
        } else if (error.status === 401) {
          this.error = 'Authentication failed. Please log in again.';
        } else if (error.status === 403) {
          this.error = 'Access denied. You may not have supplier permissions.';
        } else if (error.status === 404) {
          this.error = 'Products not found. You may not have posted any products yet.';
        } else {
          this.error = `Server error (${error.status}). Please try again.`;
        }
      }
    );
  }

  checkContentHeight() {
    const contentHeight = this.el.nativeElement.querySelector('.items').offsetHeight;
    const windowHeight = window.innerHeight;
    this.hasMoreProducts = contentHeight < windowHeight;
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

  loadViewStylePreference(): void {
    const savedViewStyle = localStorage.getItem('allitems-view-style') as 'grid' | 'compact' | 'detailed' | null;
    if (savedViewStyle && this.viewStyles.some(style => style.value === savedViewStyle)) {
      this.viewStyle = savedViewStyle;
    }
  }

  setViewStyle(style: 'grid' | 'compact' | 'detailed'): void {
    this.viewStyle = style;
    localStorage.setItem('allitems-view-style', style);

    // Reload products to apply new view style if necessary (e.g., if rendering changes layout significantly)
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

  ngOnDestroy(): void {
    // Notify all subscriptions to complete
    this.destroy$.next();
    this.destroy$.complete();
  }
}

