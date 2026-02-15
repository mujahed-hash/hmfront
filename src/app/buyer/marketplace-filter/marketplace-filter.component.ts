import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { BuyerService } from '../buyer.service';
import { indiaLocations } from '../../shared/data/indiaLocations';

export interface FilterOptions {
  cities: string[];
  states: string[];
  categories: string[];
  minPrice: number | null;
  maxPrice: number | null;
  condition: string[];
  brand: string[];
  businessType: string[];
  sortBy: string;
  sortOrder: string;
  search: string;
  isAllIndia?: boolean; // Add flag to explicitly indicate "All India" selection
}

@Component({
  selector: 'app-marketplace-filter',
  templateUrl: './marketplace-filter.component.html',
  styleUrls: ['./marketplace-filter.component.scss']
})
export class MarketplaceFilterComponent implements OnInit {
  @Output() filtersChanged = new EventEmitter<FilterOptions>();
  @Output() filtersCleared = new EventEmitter<void>();
  @Output() closeFilters = new EventEmitter<void>();

  // Filter state
  selectedCities: Set<string> = new Set();
  selectedStates: Set<string> = new Set();
  selectedCategories: Set<string> = new Set();
  selectedConditions: Set<string> = new Set();
  selectedBrands: Set<string> = new Set();
  selectedBusinessTypes: Set<string> = new Set();
  isAllIndiaSelected: boolean = false;
  
  minPrice: number | null = null;
  maxPrice: number | null = null;
  sortBy: string = 'date';
  sortOrder: string = 'desc';
  searchQuery: string = '';

  // Location data
  allLocations: any = null;
  allCities: any[] = [];
  filteredCities: any[] = [];
  citySearchQuery: string = '';

  // Categories
  categories: any[] = [];

  // Filter section toggles
  showLocationFilter: boolean = true;
  showPriceFilter: boolean = true;
  showConditionFilter: boolean = true;
  showBusinessTypeFilter: boolean = true;
  showSortOptions: boolean = true;

  // Condition options
  conditionOptions = [
    { value: 'new', label: 'New' },
    { value: 'like-new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'refurbished', label: 'Refurbished' }
  ];

  // Business type options
  businessTypeOptions = [
    { value: 'manufacturer', label: 'Manufacturer' },
    { value: 'wholesaler', label: 'Wholesaler' },
    { value: 'distributor', label: 'Distributor' },
    { value: 'retailer', label: 'Retailer' },
    { value: 'supplier', label: 'Supplier' }
  ];

  // Sort options
  sortOptions = [
    { value: 'date', label: 'Latest First' },
    { value: 'price', label: 'Price' },
    { value: 'name', label: 'Name' },
    { value: 'rating', label: 'Rating' }
  ];

  constructor(private buyerService: BuyerService) {}

  ngOnInit(): void {
    this.loadLocations();
    this.loadCategories();
  }

  loadLocations(): void {
    // Use local location data (no API call required)
    this.allLocations = indiaLocations;
    this.extractCities();
  }

  extractCities(): void {
    this.allCities = [];
    if (this.allLocations && this.allLocations.states) {
      this.allLocations.states.forEach((state: any) => {
        state.cities.forEach((city: any) => {
          this.allCities.push({
            ...city,
            stateName: state.name,
            stateCode: state.code
          });
        });
      });
    }
    this.filteredCities = [...this.allCities];
  }

  loadCategories(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.buyerService.getCategories(token).subscribe({
        next: (categories: any) => {
          this.categories = categories;
        },
        error: (error) => {
          console.error('Error loading categories:', error);
        }
      });
    }
  }

  searchCities(): void {
    const query = this.citySearchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredCities = [...this.allCities];
    } else {
      this.filteredCities = this.allCities.filter(city => 
        city.name.toLowerCase().includes(query) ||
        city.stateName.toLowerCase().includes(query)
      );
    }
  }

  toggleCity(cityCode: string): void {
    if (this.selectedCities.has(cityCode)) {
      this.selectedCities.delete(cityCode);
    } else {
      this.selectedCities.add(cityCode);
    }
    this.applyFilters();
  }

  toggleAllIndia(): void {
    this.isAllIndiaSelected = !this.isAllIndiaSelected;

    if (this.isAllIndiaSelected) {
      // Clear all city selections when All India is selected
      this.selectedCities.clear();
    }

    this.applyFilters();
  }

  toggleState(stateCode: string): void {
    if (this.selectedStates.has(stateCode)) {
      this.selectedStates.delete(stateCode);
    } else {
      this.selectedStates.add(stateCode);
    }
    this.applyFilters();
  }

  toggleCategory(categoryId: string): void {
    if (this.selectedCategories.has(categoryId)) {
      this.selectedCategories.delete(categoryId);
    } else {
      this.selectedCategories.add(categoryId);
    }
    this.applyFilters();
  }

  toggleCondition(condition: string): void {
    if (this.selectedConditions.has(condition)) {
      this.selectedConditions.delete(condition);
    } else {
      this.selectedConditions.add(condition);
    }
    this.applyFilters();
  }

  toggleBusinessType(type: string): void {
    if (this.selectedBusinessTypes.has(type)) {
      this.selectedBusinessTypes.delete(type);
    } else {
      this.selectedBusinessTypes.add(type);
    }
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  onPriceChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    const filters: FilterOptions = {
      cities: this.isAllIndiaSelected ? ['all-india'] : Array.from(this.selectedCities),
      states: Array.from(this.selectedStates),
      categories: Array.from(this.selectedCategories),
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      condition: Array.from(this.selectedConditions),
      brand: Array.from(this.selectedBrands),
      businessType: Array.from(this.selectedBusinessTypes),
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
      search: this.searchQuery,
      isAllIndia: this.isAllIndiaSelected // Include the All India flag
    };

    // Check if all filters are empty
    const hasActiveFilters = this.isAllIndiaSelected || // "All India" is an active filter!
                           filters.cities.length > 0 ||
                           filters.states.length > 0 ||
                           filters.categories.length > 0 ||
                           filters.condition.length > 0 ||
                           filters.brand.length > 0 ||
                           filters.businessType.length > 0 ||
                           filters.minPrice !== null ||
                           filters.maxPrice !== null ||
                           filters.search.trim() !== '';

    this.filtersChanged.emit(filters);

    if (!hasActiveFilters) {
      this.filtersCleared.emit();
    }
  }

  clearAllFilters(): void {
    this.selectedCities.clear();
    this.selectedStates.clear();
    this.selectedCategories.clear();
    this.selectedConditions.clear();
    this.selectedBrands.clear();
    this.selectedBusinessTypes.clear();
    this.isAllIndiaSelected = false;
    this.minPrice = null;
    this.maxPrice = null;
    this.sortBy = 'date';
    this.sortOrder = 'desc';
    this.searchQuery = '';
    this.citySearchQuery = '';
    this.filteredCities = [...this.allCities];

    this.filtersChanged.emit({
      cities: [],
      states: [],
      categories: [],
      minPrice: null,
      maxPrice: null,
      condition: [],
      brand: [],
      businessType: [],
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
      search: '',
      isAllIndia: false
    });

    this.filtersCleared.emit();
  }

  closeFilterPanel(): void {
    this.closeFilters.emit();
  }

  get activeFilterCount(): number {
    return (
      (this.isAllIndiaSelected ? 1 : this.selectedCities.size) +
      this.selectedStates.size +
      this.selectedCategories.size +
      this.selectedConditions.size +
      this.selectedBrands.size +
      this.selectedBusinessTypes.size +
      (this.minPrice !== null ? 1 : 0) +
      (this.maxPrice !== null ? 1 : 0) +
      (this.searchQuery.trim() !== '' ? 1 : 0)
    );
  }

  removeCity(cityCode: string): void {
    this.selectedCities.delete(cityCode);
    this.applyFilters();
  }

  removeCategory(categoryId: string): void {
    this.selectedCategories.delete(categoryId);
    this.applyFilters();
  }

  removeCondition(condition: string): void {
    this.selectedConditions.delete(condition);
    this.applyFilters();
  }

  removeBrand(brand: string): void {
    this.selectedBrands.delete(brand);
    this.applyFilters();
  }

  removeBusinessType(type: string): void {
    this.selectedBusinessTypes.delete(type);
    this.applyFilters();
  }

  clearSearchQuery(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  clearPriceFilters(): void {
    this.minPrice = null;
    this.maxPrice = null;
    this.applyFilters();
  }

  getCityName(cityCode: string): string {
    const city = this.allCities.find(c => c.code === cityCode);
    return city ? `${city.name}, ${city.stateName}` : cityCode;
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.itemType : categoryId;
  }
}
