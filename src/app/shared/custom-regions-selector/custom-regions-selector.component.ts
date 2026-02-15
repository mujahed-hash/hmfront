import { Component, Input, Output, EventEmitter, OnInit, OnChanges, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface Region {
  name: string;
  code?: string;
  description?: string;
}

@Component({
  selector: 'app-custom-regions-selector',
  templateUrl: './custom-regions-selector.component.html',
  styleUrls: ['./custom-regions-selector.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomRegionsSelectorComponent),
      multi: true
    }
  ]
})
export class CustomRegionsSelectorComponent implements OnInit, OnChanges, ControlValueAccessor {
  @Input() regions: string[] = [];

  ngOnChanges() {
    console.log('Regions selector ngOnChanges - regions:', this.regions);
    this.filteredRegions = [...this.regions];
    console.log('Regions selector ngOnChanges - filteredRegions:', this.filteredRegions);
  }
  @Input() placeholder: string = 'Select regions';
  @Input() showAllOption: boolean = true;
  @Input() allOptionText: string = 'All Regions';
  @Input() disabled: boolean = false;
  @Input() searchable: boolean = true;
  @Input() maxHeight: string = '500px';
  @Input() multiple: boolean = true; // Enable multiple selection
  @Input() maxSelections: number = 0; // 0 = unlimited
  
  @Output() selectionChange = new EventEmitter<string[] | string | null>();
  @Output() searchChange = new EventEmitter<string>();

  isOpen = false;
  selectedRegions: string[] = []; // Changed to array for multiple selections
  searchTerm = '';
  filteredRegions: string[] = [];
  isAllRegionsSelected = false; // Track if "All Regions" is selected

  // ControlValueAccessor implementation
  private onChange = (value: any) => {};
  private onTouched = () => {};

  ngOnInit() {
    console.log('Regions selector ngOnInit - regions:', this.regions);
    this.filteredRegions = [...this.regions];
    console.log('Regions selector ngOnInit - filteredRegions:', this.filteredRegions);
  }

  toggleDropdown() {
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.searchTerm = '';
        this.filteredRegions = [...this.regions];
      }
    }
  }

  selectRegion(region: string | null) {
    console.log('selectRegion called with:', region);
    
    if (region === null) {
      // "All Regions" option selected
      this.selectedRegions = [];
      this.isAllRegionsSelected = true;
      this.isOpen = false;
      this.onChange('');
      this.onTouched();
      this.selectionChange.emit(null);
      console.log('selectionChange emitted with: null (All Regions)');
      return;
    }
    
    if (this.multiple) {
      // Multiple selection mode
      this.isAllRegionsSelected = false; // Clear "All Regions" flag when selecting specific regions
      const index = this.selectedRegions.indexOf(region);
      if (index > -1) {
        // Region already selected, remove it
        this.selectedRegions.splice(index, 1);
      } else {
        // Check max selections limit
        if (this.maxSelections > 0 && this.selectedRegions.length >= this.maxSelections) {
          console.log(`Maximum selections (${this.maxSelections}) reached`);
          return;
        }
        // Add region to selection
        this.selectedRegions.push(region);
      }
      
      // Don't close dropdown in multiple mode
      this.onChange(this.selectedRegions.join(','));
      this.onTouched();
      this.selectionChange.emit([...this.selectedRegions]);
      console.log('selectionChange emitted with:', this.selectedRegions);
    } else {
      // Single selection mode
      this.selectedRegions = [region];
      this.isAllRegionsSelected = false; // Clear "All Regions" flag when selecting specific region
      this.isOpen = false;
      this.onChange(region);
      this.onTouched();
      this.selectionChange.emit(region);
      console.log('selectionChange emitted with:', region);
    }
  }

  onSearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.searchChange.emit(this.searchTerm);
    
    if (this.searchTerm.trim() === '') {
      this.filteredRegions = [...this.regions];
    } else {
      this.filteredRegions = this.regions.filter(region =>
        region.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  clearSearch() {
    this.searchTerm = '';
    this.filteredRegions = [...this.regions];
  }

  getDisplayText(): string {
    if (this.selectedRegions.length === 0) {
      // Check if this is "All Regions" selection
      if (this.isAllRegionsSelected) {
        return this.allOptionText || 'All Regions';
      }
      return this.placeholder;
    } else if (this.selectedRegions.length === 1) {
      return this.selectedRegions[0];
    } else if (this.selectedRegions.length <= 3) {
      // Show up to 3 region names
      return this.selectedRegions.join(', ');
    } else {
      // Show first 2 names and count of remaining
      return `${this.selectedRegions.slice(0, 2).join(', ')} and ${this.selectedRegions.length - 2} more`;
    }
  }

  getRegionIcon(region: string): string {
    return 'location_on';
  }

  // ControlValueAccessor methods
  writeValue(value: any): void {
    console.log('CustomRegionsSelector: writeValue called with:', value);

    if (value && value.length > 0) {
      if (typeof value === 'string') {
        // Single value or comma-separated string
        this.selectedRegions = value.split(',').map(r => r.trim()).filter(r => r);
        this.isAllRegionsSelected = false; // Clear "All Regions" flag when specific regions are set
      } else if (Array.isArray(value)) {
        // Array of values - include all values, even if not in regions list
        // This allows for custom regions or regions not in the predefined list
        this.selectedRegions = value.filter(r => r && r.trim());
        this.isAllRegionsSelected = false; // Clear "All Regions" flag when specific regions are set
      } else {
        this.selectedRegions = [];
        this.isAllRegionsSelected = false;
      }
    } else {
      // Value is null, undefined, or an empty array. This represents "All India".
      this.selectedRegions = [];
      this.isAllRegionsSelected = true; // Set "All Regions" flag when value is empty/null/empty array
    }
    console.log('CustomRegionsSelector: selectedRegions after writeValue:', this.selectedRegions);
    console.log('CustomRegionsSelector: isAllRegionsSelected after writeValue:', this.isAllRegionsSelected);
  }

  // Method to handle external region selection
  setSelectedRegions(regions: string[] | string | null) {
    if (regions === null) {
      this.selectedRegions = [];
      this.isAllRegionsSelected = true;
    } else if (typeof regions === 'string') {
      this.selectedRegions = regions.split(',').map(r => r.trim()).filter(r => r);
      this.isAllRegionsSelected = false;
    } else if (Array.isArray(regions)) {
      this.selectedRegions = [...regions];
      this.isAllRegionsSelected = false;
    }
    
    this.onChange(this.selectedRegions.join(','));
    this.onTouched();
    this.selectionChange.emit(this.selectedRegions.length > 0 ? [...this.selectedRegions] : null);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Close dropdown when clicking outside
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-regions-selector')) {
      this.isOpen = false;
    }
  }

  // TrackBy function for performance
  trackByRegion(index: number, region: string): string {
    return region;
  }
}

