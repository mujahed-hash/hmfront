import { Component } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { SupplierService } from '../../supplier.service';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { NotificationService, Notification } from 'src/app/notification.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Category } from '../../../shared/custom-category-selector/custom-category-selector.component';
import { indiaLocations } from '../../../shared/data/indiaLocations';

@Component({
  selector: 'app-producedit',
  templateUrl: './producedit.component.html',
  styleUrls: ['./producedit.component.scss']
})
export class ProduceditComponent {
  editmode = false;
  form!: FormGroup<any>;
  isSubmitted = false;
  categories: any[] = [];
  imageDisplay!: string | ArrayBuffer | null;
  imagesDisplay: string[] = [];
  currentProductId!: string;
  token!: any
  clickEdit: boolean = false;
  product: any;
  isEditing!: any;
  images: any = [];
  NewCDI: any;
  currentRoute: any;
  filterText: any;
  selectedCategory: any;
  dropdownOpen: Boolean = false;
  selected: any;
  notifications: Notification[] = [];
  isLoading = false; // Loader flag;
  isUploaded!: boolean; // Flag to check if the image is uploaded
  private destroy$ = new Subject<void>();

  // Location data and filtering
  allLocations: any = indiaLocations;
  allCities: any[] = [];
  filteredCities: any[] = [];
  citySearchQuery: string = '';
  selectedLocations: Set<string> = new Set();
  isAllIndia: boolean = false;

  // Enhanced product fields
  conditionOptions = [
    { value: 'new', label: 'New' },
    { value: 'like-new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'refurbished', label: 'Refurbished' }
  ];

  businessTypeOptions = [
    { value: 'manufacturer', label: 'Manufacturer' },
    { value: 'wholesaler', label: 'Wholesaler' },
    { value: 'distributor', label: 'Distributor' },
    { value: 'retailer', label: 'Retailer' },
    { value: 'supplier', label: 'Supplier' }
  ];

  unitOptions = [
    { value: 'piece', label: 'Piece (pcs)' },
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'gram', label: 'Gram (g)' },
    { value: 'litre', label: 'Litre (L)' },
    { value: 'ml', label: 'Millilitre (ml)' },
    { value: 'packet', label: 'Packet (pkt)' },
    { value: 'box', label: 'Box' },
    { value: 'dozen', label: 'Dozen' },
    { value: 'sqft', label: 'Square Feet (sq ft)' },
    { value: 'meter', label: 'Meter (m)' },
    { value: 'mm', label: 'Millimetre (mm)' },
    { value: 'set', label: 'Set' },
    { value: 'bundle', label: 'Bundle' },
    { value: 'roll', label: 'Roll' }
  ];

  // Section toggles
  showLocationSection = true;
  showEnhancedDetailsSection = true;

  constructor(
    private route: ActivatedRoute,
    private supplierService: SupplierService,
    private fb: FormBuilder,
    private router: Router,

    private formBuilder: FormBuilder,
    private productsService: SupplierService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this._initForm();
    this.extractCities();
    this.token = localStorage.getItem('token');

    // Handle route params for add/edit mode
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const customId = params['customIdentifier'];

      if (customId) {
        // Edit mode
        this.editmode = true;
        this.currentProductId = customId;

        // First load categories
        this.supplierService.getCategories().pipe(
          takeUntil(this.destroy$)
        ).subscribe({
          next: (categories: any) => {
            this.categories = categories;
            console.log('Categories loaded for edit mode:', categories);

            // Now load product
            this.productsService.getProductByCustomIdentifier(customId).pipe(
              takeUntil(this.destroy$)
            ).subscribe({
              next: (product: any) => {
                this.product = product;
                this.NewCDI = product.customIdentifier;

                // Set form values now that categories are loaded
                this.form.patchValue({
                  category: product.category._id || product.category.customIdentifier || product.category,
                  prodName: product.prodName,
                  prodDesc: product.prodDesc,
                  prodPrice: product.prodPrice,
                  countInStock: product.countInStock,
                  isFeatured: product.isFeatured,
                  prodSize: product.prodSize,
                  brand: product.brand || '',
                  condition: product.condition || 'new',
                  minOrderQuantity: product.minOrderQuantity || 1,
                  maxOrderQuantity: product.maxOrderQuantity || '',
                  businessType: product.businessType || 'supplier',
                  deliveryAvailable: product.deliveryAvailable !== undefined ? product.deliveryAvailable : true,
                  estimatedDeliveryDays: product.estimatedDeliveryDays || 7,
                  freeDeliveryAbove: product.freeDeliveryAbove || '',
                  tags: product.tags?.join(', ') || ''
                });

                // Load existing locations
                if (product.locations && product.locations.length > 0) {
                  product.locations.forEach((loc: any) => {
                    this.selectedLocations.add(loc.cityCode);
                  });
                }

                // Handle locations for edit mode
                if (product.locations && product.locations.length > 0) {
                  // Product has specific locations, populate selectedLocations Set
                  product.locations.forEach((location: any) => {
                    if (location.cityCode) {
                      this.selectedLocations.add(location.cityCode);
                    }
                  });
                  this.isAllIndia = false;
                } else {
                  // Product has no specific locations, assume it's All India
                  this.isAllIndia = true;
                }

                // Handle images for edit mode
                this.imagesDisplay = product.images || [];
                this.form.get('images')?.clearValidators();
                this.form.get('images')?.updateValueAndValidity();
              },
              error: (error) => {
                console.error('Error loading product for edit:', error);
                this.notificationService.addNotification('Failed to load product details.', 'error');
              }
            });
          },
          error: (error) => {
            console.error('Error loading categories for edit:', error);
            this.notificationService.addNotification('Failed to load categories. Please try again.', 'error');
          }
        });
      } else {
        // Add mode
        this.editmode = false;
        this._getCategories();
      }
    });

    // Router events subscription
    this.router.events.pipe(
      filter((event: any) => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      console.log('Route navigated:', this.router.url);
    });

    // Monitor form category changes and update selectedCategory
    this.form.get('category')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(value => {
      console.log('Form category value changed to:', value);
      if (value) {
        // Find the category in the loaded categories
        this.selected = this.categories.find((cat: any) => {
          const catId = cat._id || cat.customIdentifier || cat.id;
          return catId === value;
        });
        this.selectedCategory = this.selected || null;
        console.log('Updated selectedCategory to:', this.selectedCategory);
      } else {
        this.selected = null;
        this.selectedCategory = null;
        console.log('Cleared selectedCategory');
      }
    });
  }

  private _initForm() {
    this.form = this.formBuilder.group({
      // Existing fields
      prodName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)]],
      prodDesc: ['', Validators.required],
      prodPrice: ['', [Validators.required, Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/), Validators.min(0)]],
      images: [],
      category: ['', Validators.required],
      countInStock: ['', [Validators.required, Validators.pattern(/^[0-9]+$/), Validators.min(0)]],
      prodSize: ['piece', [Validators.required]],
      isFeatured: [false],

      // New enhanced fields
      brand: ['', [Validators.pattern(/^[a-zA-Z\s]*$/)]],
      condition: ['new'],
      minOrderQuantity: [1, [Validators.pattern(/^[0-9]+$/), Validators.min(1)]],
      maxOrderQuantity: ['', [Validators.pattern(/^[0-9]*$/)]],
      businessType: ['supplier'],
      deliveryAvailable: [true],
      estimatedDeliveryDays: [7, [Validators.pattern(/^[0-9]+$/), Validators.min(1)]],
      freeDeliveryAbove: ['', [Validators.pattern(/^[0-9]*$/)]],
      tags: ['']
    });
  }
  // isEditRoute(): boolean {
  //   // This method checks if the current route matches the edit route pattern
  //   return this.currentRoute.startsWith('/supplier/product/edit/');
  // }
  private _getCategories() {
    console.log('Loading categories...');
    this.supplierService.getCategories().subscribe({
      next: (categories: any) => {
        this.categories = categories;
        console.log('Categories loaded successfully:', categories);
        console.log('Categories length:', categories?.length);
        console.log('First category sample:', categories?.[0]);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        // Show error to user
        alert('Failed to load categories. Please check your connection and try again.');
      }
    });
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }
  onCategorySelect(categories: Category[] | Category | null) {
    console.log('onCategorySelect called with:', categories);
    if (categories === null) {
      this.selectedCategory = null;
      this.form.get('category')?.setValue('');
      console.log('Cleared category selection');
    } else if (Array.isArray(categories)) {
      // For multiple selection, take the first category
      this.selectedCategory = categories.length > 0 ? categories[0] : null;
      // The selector already updated the form via formControlName binding
      console.log('Selected category (array mode):', this.selectedCategory);
    } else {
      // Single category
      this.selectedCategory = categories;
      // The selector already updated the form via formControlName binding
      console.log('Selected category (single mode):', this.selectedCategory);
    }
  }
  selectCategory(category: any) {
    this.selectedCategory = category;
    this.form.get('category')?.setValue(category._id || category.customIdentifier); // Use _id or customIdentifier
    this.dropdownOpen = false;
  }
  filteredCategories() {
    if (!this.filterText) {
      return this.categories;
    }
    return this.categories.filter(category =>
      category.itemType.toLowerCase().includes(this.filterText.toLowerCase())
    );
  }

  private _addProduct(productData: FormData) {
    this.isUploaded = true;
    console.log('Submitting product data...');

    this.productsService.createProduct(productData, this.token)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          console.log('Product created successfully:', data);
          this.isUploaded = false;
          this.isLoading = false;
          this.notificationService.addNotification('Product added successfully!', 'success');
          this.form.reset();
          this.selectedLocations.clear();
          this.images = [];
          this.imagesDisplay = [];
          this.router.navigate(['/supplier/more/allitems']);
        },
        error: (error) => {
          console.error('Error creating product:', error);
          this.isUploaded = false;
          this.isLoading = false;

          let errorMessage = 'Failed to create product. Please try again.';
          if (error.error?.error) {
            errorMessage = error.error.error;
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }

          this.notificationService.addNotification(errorMessage, 'error');
          alert(errorMessage);
        }
      });
  }


  _updateProduct(productFormData: FormData) {
    this.isUploaded = true;
    console.log('Updating product...');

    this.productsService.updateProduct(productFormData, this.currentProductId, this.token)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          console.log('Product updated successfully:', data);
          this.isUploaded = false;
          this.isLoading = false;
          this.notificationService.addNotification('Product updated successfully!', 'success');
          this.router.navigate(['/supplier/product/view/', data.customIdentifier]);
        },
        error: (error) => {
          console.error('Error updating product:', error);
          this.isUploaded = false;
          this.isLoading = false;

          let errorMessage = 'Failed to update product. Please try again.';
          if (error.error?.error) {
            errorMessage = error.error.error;
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }

          this.notificationService.addNotification(errorMessage, 'error');
          alert(errorMessage);
        }
      });
  }


  // async _addProduct(productFormData: FormData) {
  //   try {
  //     const data = await this.productService.addProduct(productFormData).toPromise();
  //     this.router.navigate(['/supplier/products']);
  //   } catch (error) {
  //     console.error('Error adding product:', error);
  //   }
  // }

  onSubmit() {
    this.isSubmitted = true;

    // Debug logging
    console.log('onSubmit called');
    console.log('selectedLocations.size:', this.selectedLocations.size);
    console.log('isAllIndia:', this.isAllIndia);
    console.log('Form valid:', this.form.valid);
    console.log('Form errors:', this.form.errors);

    // Check if at least one location is selected (either specific cities or All India)
    if (this.selectedLocations.size === 0 && !this.isAllIndia) {
      console.log('Location validation failed - no locations selected and All India not selected');
      alert('Please select at least one location for this product');
      this.isLoading = false;
      return;
    } else {
      console.log('Location validation passed');
    }

    // Validate form
    if (this.form.invalid) {
      console.log('Form is invalid:', this.form.errors);
      alert('Please fill in all required fields');
      this.isLoading = false;
      return;
    }

    // Check if category is selected
    const categoryValue = this.form.get('category')?.value;
    if (!categoryValue) {
      alert('Please select a category');
      this.isLoading = false;
      return;
    }

    console.log('Form data before submission:', {
      category: categoryValue,
      locations: this.getSelectedLocationsData(),
      imageCount: this.images.length
    });

    this.isLoading = true; // Start loader
    const productFormData = new FormData();

    // Append regular form fields
    Object.keys(this.form.controls).forEach((key) => {
      if (key !== 'tags' && key !== 'images') { // Handle tags and images separately
        const value = this.form.get(key)?.value;
        if (value !== null && value !== undefined) {
          productFormData.append(key, value);
        }
      }
    });

    // Process tags (convert comma-separated string to array)
    const tagsValue = this.form.get('tags')?.value;
    if (tagsValue && tagsValue.trim() !== '') {
      const tagsArray = tagsValue.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag !== '');
      productFormData.append('tags', JSON.stringify(tagsArray));
    } else {
      productFormData.append('tags', JSON.stringify([]));
    }

    // Add locations
    const locations = this.getSelectedLocationsData();
    productFormData.append('locations', JSON.stringify(locations));

    // Add images
    if (this.images.length > 0) {
      this.images.forEach((file: any, index: any) => {
        productFormData.append('images', file, file.name);
      });
    }

    // Log FormData contents (for debugging)
    console.log('FormData contents:');
    productFormData.forEach((value, key) => {
      console.log(`${key}:`, value);
    });

    if (this.editmode) {
      this._updateProduct(productFormData);
    } else {
      this._addProduct(productFormData);
    }
  }
  onImageUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.form.patchValue({ image: file });
      this.form.get('image')?.updateValueAndValidity();
      const fileReader = new FileReader();
      fileReader.onload = () => {
        this.imageDisplay = fileReader.result;
      };
      fileReader.readAsDataURL(file);
    }
  }

  onImagesUpload(event: any) {
    for (let i = 0; i < event.target.files.length; i++) {
      const file = event.target.files[i];
      const fileReader = new FileReader();
      fileReader.onload = () => {
        this.imagesDisplay.push(fileReader.result as string);
      };
      fileReader.readAsDataURL(file);
    }
  }

  get productForm() {
    return this.form.controls;
  }

  // Helper method to get validation error messages
  getErrorMessage(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return 'This field is required';
    }
    if (control.errors['pattern']) {
      switch (fieldName) {
        case 'prodName':
          return 'Product name should only contain letters and spaces';
        case 'brand':
          return 'Brand name should only contain letters and spaces';
        case 'prodPrice':
          return 'Price should be a valid number (e.g., 100 or 99.99)';
        case 'countInStock':
          return 'Stock count should be a whole number';
        case 'prodSize':
          return 'Size should only contain letters and spaces';
        case 'minOrderQuantity':
        case 'maxOrderQuantity':
        case 'estimatedDeliveryDays':
        case 'freeDeliveryAbove':
          return 'This field should only contain numbers';
        default:
          return 'Invalid format';
      }
    }
    if (control.errors['min']) {
      return `Minimum value is ${control.errors['min'].min}`;
    }
    return '';
  }

  // Helper method to check if a field has errors
  hasError(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!(control && control.errors && control.touched);
  }

  onCancel(): void {
    this.router.navigate(['/supplier/more/allitems']);
  }

  toggleEdit(): void {
    this.router.navigate(['/supplier/more/product/edit/', this.NewCDI]);
  }

  // onFileChange(event: any) {
  //   const imagesControl = this.form.get('images');
  //   imagesControl?.updateValueAndValidity();

  //   if (event.target.files && event.target.files.length) {
  //     const filesAmount = event.target.files.length;

  //     for (let i = 0; i < filesAmount; i++) {
  //       const reader = new FileReader();

  //       reader.onload = (e: any) => {
  //         this.imagesDisplay.push(e.target.result);

  //         // Assuming 'images' control is supposed to hold an array of base64 strings
  //         let currentImages = imagesControl?.value || [];
  //         if (!Array.isArray(currentImages)) {
  //           currentImages = [];
  //         }
  //         currentImages.push(e.target.result);
  //         this.form.patchValue({
  //           images: currentImages
  //         });
  //         imagesControl?.updateValueAndValidity();
  //       };

  //       reader.readAsDataURL(event.target.files[i]);
  //     }
  //   }
  // }
  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length) {
      this.images = Array.from(event.target.files);

      const fileReaders: FileReader[] = [];
      this.imagesDisplay = [];

      this.images.forEach((file: File) => {
        const fileReader = new FileReader();
        fileReader.onload = (e: any) => {
          this.imagesDisplay.push(e.target.result);
        };
        fileReader.readAsDataURL(file);
        fileReaders.push(fileReader);
      });

      this.form.patchValue({
        images: this.images
      });
      this.form.get('images')?.updateValueAndValidity();
    }
  }

  // Location handling methods
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

  toggleLocation(cityCode: string): void {
    if (this.isAllIndia) {
      // If All India is selected, don't allow individual city selection
      return;
    }

    if (this.selectedLocations.has(cityCode)) {
      this.selectedLocations.delete(cityCode);
    } else {
      this.selectedLocations.add(cityCode);
    }
  }

  removeLocation(cityCode: string): void {
    this.selectedLocations.delete(cityCode);
  }

  toggleAllIndia(): void {
    console.log('toggleAllIndia called, current isAllIndia:', this.isAllIndia);
    this.isAllIndia = !this.isAllIndia;
    console.log('toggleAllIndia after toggle, isAllIndia:', this.isAllIndia);

    if (this.isAllIndia) {
      // Clear all individual city selections when All India is selected
      this.selectedLocations.clear();
      console.log('Cleared selectedLocations, size:', this.selectedLocations.size);
    }
    // Note: When All India is deselected, we don't automatically select anything
    // Users can then select individual cities
  }

  getCityName(cityCode: string): string {
    const city = this.allCities.find(c => c.code === cityCode);
    return city ? `${city.name}, ${city.stateName}` : cityCode;
  }

  getSelectedLocationsData(): any[] {
    // If All India is selected, return empty array (backend will handle no location filtering)
    if (this.isAllIndia) {
      return [];
    }

    const locations: any[] = [];
    this.selectedLocations.forEach(cityCode => {
      const city = this.allCities.find(c => c.code === cityCode);
      if (city) {
        locations.push({
          state: city.stateName,
          city: city.name,
          stateCode: city.stateCode,
          cityCode: city.code
        });
      }
    });
    return locations;
  }

  ngOnDestroy(): void {
    // Notify all subscriptions to complete
    this.destroy$.next();
    this.destroy$.complete();

  }
}