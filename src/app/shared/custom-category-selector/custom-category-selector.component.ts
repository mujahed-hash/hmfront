import { Component, Input, Output, EventEmitter, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface Category {
  _id?: string;
  id?: string;
  name?: string;
  itemType?: string; // Database field - main display name
  itemName?: string; // Database field - alternative name
  customIdentifier?: string;
  customIdentifer?: string; // Database field (typo in backend)
  icon?: string;
  image?: string | string[]; // Can be string or array of strings from backend
  description?: string;
  isActive?: boolean;
}

@Component({
  selector: 'app-custom-category-selector',
  templateUrl: './custom-category-selector.component.html',
  styleUrls: ['./custom-category-selector.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomCategorySelectorComponent),
      multi: true
    }
  ]
})
export class CustomCategorySelectorComponent implements OnInit, ControlValueAccessor {
  @Input() set categories(value: Category[]) {
    this._categories = value;
    this.filteredCategories = [...value];
    // When categories are loaded/updated, re-apply the pending value if exists
    if (this.pendingValue !== undefined && value.length > 0) {
      this.writeValue(this.pendingValue);
      this.pendingValue = undefined;
    }
  }
  get categories(): Category[] {
    return this._categories;
  }
  private _categories: Category[] = [];

  @Input() placeholder: string = 'Select categories';
  @Input() showAllOption: boolean = true;
  @Input() allOptionText: string = 'All Categories';
  @Input() disabled: boolean = false;
  @Input() searchable: boolean = true;
  @Input() showIcons: boolean = true;
  @Input() maxHeight: string = '300px';
  @Input() multiple: boolean = true; // Enable multiple selection
  @Input() maxSelections: number = 0; // 0 = unlimited
  
  @Output() selectionChange = new EventEmitter<Category[] | Category | null>();
  @Output() searchChange = new EventEmitter<string>();

  isOpen = false;
  selectedCategories: Category[] = []; // Changed to array for multiple selections
  searchTerm = '';
  filteredCategories: Category[] = [];
  private isInternalUpdate = false; // Flag to prevent writeValue loops
  private pendingValue: any; // Store value if categories aren't loaded yet

  // ControlValueAccessor implementation
  private onChange = (value: any) => {};
  private onTouched = () => {};

  ngOnInit() {
    this.filteredCategories = [...this._categories];
  }

  toggleDropdown() {
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.searchTerm = '';
        this.filteredCategories = [...this._categories];
      }
    }
  }

  selectCategory(category: Category | null) {
    console.log('selectCategory called with:', category);
    if (category === null) {
      // "All Categories" option selected
      this.selectedCategories = [];
      this.isOpen = false;
      this.isInternalUpdate = true;
      this.onChange('');
      this.isInternalUpdate = false;
      this.onTouched();
      this.selectionChange.emit(null);
      console.log('Cleared selection');
      return;
    }

    if (this.multiple) {
      // Multiple selection mode - simplified like regions selector
      const categoryId = category.customIdentifer || category.customIdentifier || category._id || category.id;
      console.log('Multiple mode, categoryId:', categoryId);
      const index = this.selectedCategories.findIndex(cat => {
        const selectedId = cat.customIdentifer || cat.customIdentifier || cat._id || cat.id;
        return selectedId === categoryId;
      });

      if (index > -1) {
        // Category already selected, remove it
        this.selectedCategories.splice(index, 1);
        console.log('Removed category from selection');
      } else {
        // Check max selections limit
        if (this.maxSelections > 0 && this.selectedCategories.length >= this.maxSelections) {
          console.log('Max selections reached');
          return;
        }
        // Add category to selection
        this.selectedCategories.push(category);
        console.log('Added category to selection');
      }

      // Don't close dropdown in multiple mode
      this.isInternalUpdate = true;
      const selectedIds = this.selectedCategories.map(cat => cat.customIdentifer || cat.customIdentifier || cat._id || cat.id).join(',');
      console.log('Calling onChange with:', selectedIds);
      this.onChange(selectedIds);
      this.isInternalUpdate = false;
      this.onTouched();
      this.selectionChange.emit([...this.selectedCategories]);
    } else {
      // Single selection mode
      console.log('Single mode, setting selectedCategories to:', [category]);
      this.selectedCategories = [category];
      this.isOpen = false;
      this.isInternalUpdate = true;
      const categoryId = category.customIdentifer || category.customIdentifier || category._id || category.id;
      console.log('Calling onChange with:', categoryId);
      this.onChange(categoryId);
      this.isInternalUpdate = false;
      this.onTouched();
      this.selectionChange.emit(category);
    }
  }

  onSearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.searchChange.emit(this.searchTerm);
    
    if (this.searchTerm.trim() === '') {
      this.filteredCategories = [...this._categories];
    } else {
      this.filteredCategories = this._categories.filter(category => {
        const categoryName = category.itemType || category.name || '';
        return categoryName.toLowerCase().includes(this.searchTerm.toLowerCase());
      });
    }
  }

  clearSearch() {
    this.searchTerm = '';
    this.filteredCategories = [...this._categories];
  }

  getDisplayText(): string {
    if (this.selectedCategories.length === 0) {
      return this.placeholder;
    } else if (this.selectedCategories.length === 1) {
      const categoryName = this.selectedCategories[0].itemType || this.selectedCategories[0].name || 'Category';
      return categoryName;
    } else {
      return `${this.selectedCategories.length} categories selected`;
    }
  }

  getCategoryIcon(category: Category): string {
    return category.icon || 'category';
  }

  getCategoryImage(category: Category): string {
    // Handle image as array (backend returns array) or string
    if (Array.isArray(category.image) && category.image.length > 0) {
      return category.image[0];
    } else if (typeof category.image === 'string') {
      return category.image;
    }
    return '';
  }

  // ControlValueAccessor methods
  writeValue(value: any): void {
    // Skip if this is an internal update to prevent loops
    if (this.isInternalUpdate) {
      return;
    }

    console.log('writeValue called with:', value, 'categories length:', this._categories.length);

    // If categories aren't loaded yet, store the value for later
    if (this._categories.length === 0 && value) {
      console.log('Categories not loaded yet, storing pending value:', value);
      this.pendingValue = value;
      return;
    }

    if (value) {
      if (typeof value === 'string') {
        // Single value or comma-separated string
        const identifiers = value.split(',').map(id => id.trim()).filter(id => id);
        console.log('Looking for categories with identifiers:', identifiers);
        this.selectedCategories = this._categories.filter(cat => {
          // Check ALL possible identifier fields to find a match
          const catIds = [
            cat._id,
            cat.id,
            cat.customIdentifer,
            cat.customIdentifier
          ].filter(id => id); // Remove undefined/null values
          
          const found = identifiers.some(searchId => catIds.includes(searchId));
          if (found) {
            console.log('Found matching category:', cat);
          }
          return found;
        });
        console.log('Selected categories after writeValue:', this.selectedCategories);
      } else if (Array.isArray(value)) {
        // Array of values
        this.selectedCategories = value.filter(cat =>
          this._categories.some(availableCat =>
            availableCat.customIdentifer === cat.customIdentifer ||
            availableCat.customIdentifier === cat.customIdentifier ||
            availableCat._id === cat._id ||
            availableCat.id === cat.id
          )
        );
      } else {
        this.selectedCategories = [];
      }
    } else {
      this.selectedCategories = [];
    }
  }

  // Method to handle external category selection
  setSelectedCategories(categories: Category[] | Category | null) {
    if (categories === null) {
      this.selectedCategories = [];
    } else if (Array.isArray(categories)) {
      this.selectedCategories = [...categories];
    } else {
      this.selectedCategories = [categories];
    }
    
    this.isInternalUpdate = true;
    this.onChange(this.selectedCategories.map(cat => cat.customIdentifer || cat.customIdentifier || cat._id || cat.id).join(','));
    this.isInternalUpdate = false;
    this.onTouched();
    this.selectionChange.emit(this.selectedCategories.length > 0 ? [...this.selectedCategories] : null);
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
    if (!target.closest('.custom-category-selector')) {
      this.isOpen = false;
    }
  }

  // TrackBy function for performance
  trackByCategory(index: number, category: Category): string {
    return category.customIdentifer || category.customIdentifier || category._id || category.id || index.toString();
  }

  isCategorySelected(category: Category): boolean {
    // Simple comparison like regions selector - use the most reliable identifier
    const categoryId = category.customIdentifer || category.customIdentifier || category._id || category.id;
    return this.selectedCategories.some(cat => {
      const selectedId = cat.customIdentifer || cat.customIdentifier || cat._id || cat.id;
      return selectedId === categoryId;
    });
  }
}
