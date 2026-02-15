import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { AllService } from '../services/all.service';
import { AuthService } from '../auth/auth.service';
import { FormControl } from '@angular/forms';
import { Category } from '../shared/custom-category-selector/custom-category-selector.component';

interface Service {
  _id: string;
  serviceName: string;
  serviceDesc: string;
  price: number;
  images?: string[];
  category?: {
    _id: string;
    name: string;
    customIdentifier: string;
  };
  user?: {
    _id: string;
    name: string;
    customIdentifier: string;
    email?: string;
    phone?: string;
    image?: string;
  };
  availableRegions: string[];
  contactInfo?: {
    phone: string;
    email: string;
    address: string;
  };
  ratings: number;
  averageRating: number;
  customIdentifier: string;
  isApproved: boolean;
  isActive: boolean;
  date: Date;
}

@Component({
  selector: 'app-all-services',
  templateUrl: './all-services.component.html',
  styleUrls: ['./all-services.component.scss']
})
export class AllServicesComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  services: Service[] = [];
  filteredServices: Service[] = [];
  isLoading = true;
  error = false;
  errorMessage = '';

  // Search properties
  searchTerm = '';
  searchPerformed = false;
  isSearching = false;

  // Filter properties
  selectedCategory = '';
  selectedRegion = '';
  
  // Form controls for selectors
  categoryControl = new FormControl('');
  regionControl = new FormControl('');
  
  // Pagination
  start = 0;
  limit = 10;
  hasMoreServices = true;
  totalServices = 0;
  
  // Available filter options
  categories: any[] = [];
  regions: string[] = [];
  
  private destroy$ = new Subject<void>();

  // Reference to the main scrollable element (mat-sidenav-content)
  private mainScrollElement: HTMLElement | null = null;
  private scrollListener: ((event: Event) => void) | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private allService: AllService,
    private authService: AuthService,
    private ngZone: NgZone
  ) {}
  
  // Helper function to get correct image URL
  getImageUrl(imagePath: string): string {
    if (!imagePath) return 'assets/images/no-image-placeholder.jpg';
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    } else {
      return imagePath; // Backend now sends full URLs
    }
  }
  
  // Handle image loading errors
  handleImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/images/no-image-placeholder.jpg';
    imgElement.onerror = null; // Prevent infinite loop if placeholder also fails
  }
  
  ngOnInit() {
    console.log('ngOnInit starting...');

    // Initialize form controls with current values first
    this.categoryControl.setValue(this.selectedCategory, {emitEvent: false});
    this.regionControl.setValue(this.selectedRegion, {emitEvent: false});

    // Load data - start with browse mode (filters only, no search)
    this.loadAllServices();
    this.loadCategories();
    this.loadAllRegions();

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
  
      // Subscribe to form control changes (only for filters, not search)
    this.categoryControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      const newValue = value || '';
      this.selectedCategory = newValue;
      this.onFilterChange();
    });

    this.regionControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      const newValue = value || '';
      this.selectedRegion = newValue;
      this.onFilterChange();
    });
  }
  
  ngAfterViewInit() {
    // Placeholder for future view initialization
  }
  
  ngOnDestroy() {
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
   
    loadAllServices(reset: boolean = false) {
    if (reset) {
      this.start = 0;
      this.services = [];
      this.hasMoreServices = true;
    }

    if (!this.hasMoreServices && !reset) return;

    // Save scroll position BEFORE any DOM changes
    const scrollElement = this.mainScrollElement || document.documentElement || document.body;
    const currentScrollPosition = scrollElement.scrollTop;

    this.isLoading = true;
    this.error = false;
    
    const params: any = {
      start: this.start,
      limit: this.limit
    };

    if (this.selectedCategory) {
      params.categoryCustomIdentifier = this.selectedCategory;
    }

    if (this.selectedRegion) {
      params.region = this.selectedRegion;
    }

    // Always include search term if search was performed
    if (this.searchPerformed && this.searchTerm) {
      params.search = this.searchTerm;
    }

    console.log('Requesting services with params:', params);
    console.log('Selected region:', this.selectedRegion);
    console.log('Region parameter being sent:', params.region);

    this.allService.getActiveServices(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log('Active services loaded:', response);
          console.log('Response structure:', Object.keys(response));
          console.log('Services array length:', response.services?.length || 0);
          console.log('Total services:', response.totalServices);

          // Append new services to existing array
          this.services = reset ? response.services : [...this.services, ...response.services];
          console.log('Services loaded into component:', this.services);
          this.totalServices = response.totalServices;
          this.hasMoreServices = this.services.length < response.totalServices;

          // Update start for next pagination
          this.start += this.limit;

          // Regions are now loaded separately from backend
          // this.extractFilterOptions(); // No longer needed
          // this.applyFilters(); // Remove this line, as applyFilters will now trigger loadAllServices(true)
          this.isLoading = false;

          // Restore scroll position to where it was BEFORE loading new data
          // This ensures new items appear below the current view without jumping.
          this.ngZone.runOutsideAngular(() => {
            setTimeout(() => {
              if (scrollElement) {
                scrollElement.scrollTop = currentScrollPosition;
                console.log(`Scroll restored to original position: ${currentScrollPosition}`);
              }
            }, 50); // Small delay to allow DOM to update
          });
        },
        error: (error) => {
          console.error('Error loading active services:', error);
          this.isLoading = false;
          this.error = true;
          
          if (error.status === 401) {
            this.errorMessage = 'Authentication error. Please log in and try again.';
          } else if (error.status === 0) {
            this.errorMessage = 'Network error. Please check your connection and try again.';
          } else {
            this.errorMessage = error.error?.message || 'Failed to load services. Please try again later.';
          }
        }
      });
  }
  
  loadMoreServices() {
    this.loadAllServices();
  }
  
  loadCategories() {
    this.allService.getServiceCategories().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.categories = response.categories || response || [];
        console.log('Categories loaded:', this.categories);
        console.log('Current selectedCategory:', this.selectedCategory);

        // After categories are loaded, ensure the form control reflects the selected category
        if (this.selectedCategory && this.categories.length > 0) {
          // Check if the selectedCategory exists in the loaded categories
          const categoryExists = this.categories.some(cat => cat.customIdentifier === this.selectedCategory);
          if (categoryExists) {
            this.categoryControl.setValue(this.selectedCategory, {emitEvent: false});
            console.log('categoryControl set after categories loaded:', this.categoryControl.value);
          } else {
            console.warn('Selected category not found in loaded categories:', this.selectedCategory);
            this.categoryControl.setValue('', {emitEvent: false});
          }
        } else {
          // No category selected, ensure control is empty
          this.categoryControl.setValue('', {emitEvent: false});
        }
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        // We don't show error UI for categories as it's not critical
        // Just use an empty array
        this.categories = [];
      }
    });
  }

  loadAllRegions() {
    this.allService.getAllRegions().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.regions = response.regions || [];
        console.log('All regions loaded from backend:', this.regions);
        console.log('Total regions:', this.regions.length);
      },
      error: (error) => {
        console.error('Error loading regions:', error);
        // Fallback to extracting from loaded services
        this.extractFilterOptions();
      }
    });
  }
  
  retryLoading() {
    this.loadAllServices();
    this.loadCategories();
    this.loadAllRegions();
  }
  
  extractFilterOptions() {
    // Extract unique regions from services, handling case-insensitive duplicates
    const regionMap = new Map<string, string>(); // Store original case for display
    const allRegions: string[] = []; // Track all regions for debugging
    
    console.log('Extracting regions from services:', this.services.length);
    
    this.services.forEach((service, serviceIndex) => {
      if (service.availableRegions) {
        console.log(`Service ${serviceIndex} regions:`, service.availableRegions);
        service.availableRegions.forEach(region => {
          if (region && region.trim()) {
            const normalizedRegion = region.trim();
            const lowerCaseRegion = normalizedRegion.toLowerCase();
            allRegions.push(normalizedRegion);
            
            // Always keep the first occurrence, or replace with better casing
            if (!regionMap.has(lowerCaseRegion)) {
              regionMap.set(lowerCaseRegion, normalizedRegion);
              console.log(`Added new region: ${normalizedRegion}`);
            } else {
              const existingRegion = regionMap.get(lowerCaseRegion);
              // Keep the version with proper capitalization (first letter uppercase)
              if (normalizedRegion[0] === normalizedRegion[0].toUpperCase() && 
                  existingRegion && existingRegion[0] !== existingRegion[0].toUpperCase()) {
                regionMap.set(lowerCaseRegion, normalizedRegion);
                console.log(`Updated region casing: ${existingRegion} -> ${normalizedRegion}`);
              }
            }
          }
        });
      }
    });
    
    console.log('All regions found:', allRegions);
    console.log('Unique regions (case-insensitive):', Array.from(regionMap.keys()));
    
    // Convert map values to array and sort
    this.regions = Array.from(regionMap.values()).sort();
    console.log('Final extracted regions:', this.regions);
    console.log('Total unique regions:', this.regions.length);
  }
  
  applyFilters() {
    console.log('applyFilters called');
    console.log('Current filters:', {
      searchTerm: this.searchTerm,
      selectedCategory: this.selectedCategory,
      selectedRegion: this.selectedRegion
    });

    // Reset to first page and reload services with new filters
    this.loadAllServices(true);
  }
  
  onSearch() {
    if (!this.searchTerm.trim()) {
      // If search term is empty, treat as filter-only operation
      this.searchPerformed = false;
      this.applyFilters();
      return;
    }

    this.searchPerformed = true;
    this.isSearching = true;

    // Reset pagination for new search
    this.start = 0;
    this.services = [];
    this.hasMoreServices = true;
    this.totalServices = 0;

    this.loadAllServices(true);
  }

  onQueryChange() {
    // Only clear search state if query becomes empty and we had performed a search
    if (!this.searchTerm.trim() && this.searchPerformed) {
      this.searchPerformed = false;
      this.services = [];
      this.totalServices = 0;
      this.start = 0;
      this.hasMoreServices = true;
      
      // Reload services to show normal filtered results (browse mode)
      this.loadAllServices(true);
    }
  }
  
  onCategoryChange(categories: Category[] | Category | null) {
    console.log('onCategoryChange called with:', categories);
    
    if (categories === null) {
      this.selectedCategory = '';
    } else if (Array.isArray(categories)) {
      this.selectedCategory = categories.map(cat => cat.customIdentifier).join(',');
    } else {
      this.selectedCategory = categories.customIdentifier || '';
    }
    
    console.log('selectedCategory set to:', this.selectedCategory);
    this.applyFilters();
  }
  
  onRegionChange(regions: string[] | string | null) {
    console.log('onRegionChange called with:', regions);
    
    if (regions === null) {
      this.selectedRegion = '';
    } else if (Array.isArray(regions)) {
      this.selectedRegion = regions.join(',');
    } else {
      this.selectedRegion = regions;
    }
    
    console.log('selectedRegion set to:', this.selectedRegion);
    this.applyFilters();
  }
  
  onFilterChange() {
    this.applyFilters();
  }
  
  clearFilters() {
    this.searchTerm = '';
    this.searchPerformed = false;
    this.selectedCategory = '';
    this.selectedRegion = '';

    // Update form controls
    this.categoryControl.setValue('', {emitEvent: false});
    this.regionControl.setValue('', {emitEvent: false});

    this.applyFilters();
  }
  
  viewServiceDetail(service: Service) {
    this.router.navigate(['/all-services', service.customIdentifier]);
  }
  
  contactSupplier(service: Service) {
    // Navigate to supplier profile or open contact dialog
    console.log('Contacting supplier:', service.user);
    if (service.user?.customIdentifier) {
      // You can implement navigation to supplier profile here
      // this.router.navigate(['/supplier-profile', service.user.customIdentifier]);
    }
  }
  
  getStarArray(rating: number): boolean[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating);
    }
    return stars;
  }

  getMaxHeight(): string {
    // Return different heights based on screen size
    if (window.innerWidth <= 480) {
      return '500px';
    } else if (window.innerWidth <= 768) {
      return '450px';
    } else {
      return '400px';
    }
  }
}
