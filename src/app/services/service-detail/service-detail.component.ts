import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ServiceService } from '../../services/service.service';
import { AllService } from '../../services/all.service'; // Corrected import
import { AuthService } from '../../auth/auth.service';
import { Service as ServiceInterface } from '../service-list/service-list.component'; // Import Service interface
import { Category as CategoryInterface } from '../../shared/custom-category-selector/custom-category-selector.component'; // Import Category interface
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-service-detail',
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.scss']
})
export class ServiceDetailComponent implements OnInit, OnDestroy {
  serviceForm!: FormGroup;
  service: ServiceInterface | undefined| any;
  customIdentifier: string | null = null;
  selectedFiles: File[] = [];
  existingImages: string[] = [];
  categories: CategoryInterface[] = [];
  loading: boolean = false;
  isEditMode: boolean = false;
  currentUserId: string | null = null;
  isAdmin: boolean = false;
  isSuperAdmin: boolean = false;
  isServiceOwner: boolean = false;
  selectedCategory: CategoryInterface | null = null;
  availableRegions: string[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private serviceService: ServiceService,
    private categoryService: AllService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserId();
    this.isAdmin = this.authService.isAdmin();
    this.isSuperAdmin = this.authService.isSuperAdmin();

    this.customIdentifier = this.route.snapshot.paramMap.get('customIdentifier');
    
    this.serviceForm = this.fb.group({
      serviceName: ['', Validators.required],
      serviceDesc: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      categoryCustomIdentifier: [''],
      availableRegions: [''],
      contactPhone: [''],
      contactEmail: ['', Validators.email],
    });

    this.loadCategories();
    this.loadAvailableRegions();
    if (this.customIdentifier) {
      this.loadServiceDetails();
    }
  }

  loadServiceDetails(): void {
    if (!this.customIdentifier) return;

    this.loading = true;
    this.serviceService.getServiceByCustomIdentifier(this.customIdentifier).pipe(takeUntil(this.destroy$)).subscribe(
      (service: ServiceInterface) => {
        console.log('Service data received:', service);
        this.service = service;
        this.existingImages = service.images || [];
        this.isServiceOwner = this.currentUserId === this.service?.user?._id; // Add safe navigation
        this.isEditMode = this.isServiceOwner || this.isAdmin || this.isSuperAdmin; // Allow owner, admin, superadmin to edit

        console.log('Service data received:', service);
        console.log('Category data:', service.category);
        console.log('Available regions:', service.availableRegions);
        console.log('Contact info:', service.contactInfo);
        console.log('Date:', service.date);

        // Set the selected category for the category selector
        if (service.category?.customIdentifier) {
          this.selectedCategory = this.categories.find(cat =>
            cat.customIdentifier === service.category?.customIdentifier ||
            cat.customIdentifer === service.category?.customIdentifier // Handle typo in backend
          ) || null;
        }

        this.serviceForm.patchValue({
          serviceName: service.serviceName,
          serviceDesc: service.serviceDesc,
          price: service.price,
          categoryCustomIdentifier: service.category?.customIdentifier || '',
          availableRegions: service.availableRegions || [],
          contactPhone: service.contactInfo?.phone || '',
          contactEmail: service.contactInfo?.email || '',
        });
        console.log('Form patched with availableRegions:', this.serviceForm.get('availableRegions')?.value);
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching service details:', error);
        this.snackBar.open('Failed to load service details.', 'Close', { duration: 3000 });
        this.loading = false;
        this.router.navigate(['/services/list']); // Redirect if service not found
      }
    );
  }

  loadCategories(): void {
    // Use the new service categories API
    this.categoryService.getServiceCategories({ active: true }).pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        if (response && Array.isArray(response)) {
          // If response is already an array
          this.categories = response.filter((cat: CategoryInterface) => cat.isActive);
        } else if (response && Array.isArray(response.categories)) {
          // If response has a categories array property
          this.categories = response.categories.filter((cat: CategoryInterface) => cat.isActive);
        } else {
          console.error('Unexpected response format from service categories API:', response);
          this.categories = [];
        }
        console.log('Loaded service categories:', this.categories);
      },
      (error) => {
        console.error('Error fetching service categories:', error);
        this.snackBar.open('Failed to load service categories.', 'Close', { duration: 3000 });
      }
    );
  }

  onFileSelected(event: any): void {
    this.selectedFiles = Array.from(event.target.files);
  }

  removeExistingImage(imageUrl: string): void {
    this.existingImages = this.existingImages.filter(img => img !== imageUrl);
    // Note: Actual deletion from backend/storage needs to be handled on form submission during update
    this.snackBar.open('Image will be removed on update.', 'Close', { duration: 2000 });
  }

  onSubmit(): void {
    if (!this.customIdentifier || this.serviceForm.invalid || !this.isEditMode) {
      this.serviceForm.markAllAsTouched();
      this.snackBar.open('Please fill in all required fields or you are not authorized.', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;
    
    const formData = new FormData();
    formData.append('serviceName', this.serviceForm.get('serviceName')?.value);
    formData.append('serviceDesc', this.serviceForm.get('serviceDesc')?.value);
    formData.append('price', this.serviceForm.get('price')?.value);
    
    if (this.serviceForm.get('categoryCustomIdentifier')?.value) {
      formData.append('categoryCustomIdentifier', this.serviceForm.get('categoryCustomIdentifier')?.value);
    }

    const regions = this.serviceForm.get('availableRegions')?.value;
    console.log('Form regions value:', regions);
    if (regions && regions.length > 0) {
      formData.append('availableRegions', JSON.stringify(regions));
      console.log('Appended regions to form data:', regions);
    } else {
      // Empty array means "All India" - send empty array to backend
      formData.append('availableRegions', JSON.stringify([]));
      console.log('Appended empty array for All India');
    }
    if (this.serviceForm.get('contactPhone')?.value) {
      formData.append('contactPhone', this.serviceForm.get('contactPhone')?.value);
    }
    if (this.serviceForm.get('contactEmail')?.value) {
      formData.append('contactEmail', this.serviceForm.get('contactEmail')?.value);
    }

    // Append new selected files
    this.selectedFiles.forEach(file => {
      formData.append('images', file, file.name);
    });

    // Backend updateService currently replaces all images. If you want to retain old ones,
    // you'd need to send existingImages separately and modify backend logic to merge.
    // For now, new uploads replace old ones based on current backend behavior.
    
    this.serviceService.updateService(this.customIdentifier, formData).pipe(takeUntil(this.destroy$)).subscribe(
      (response) => {
        this.snackBar.open('Service updated successfully!', 'Close', { duration: 3000 });
        this.loading = false;
        this.router.navigate(['/services/list']);
      },
      (error) => {
        console.error('Error updating service:', error);
        this.snackBar.open('Failed to update service.', 'Close', { duration: 3000 });
        this.loading = false;
      }
    );
  }

  deleteService(): void {
    if (confirm('Are you sure you want to delete this service?') && this.customIdentifier) {
      this.serviceService.deleteService(this.customIdentifier).subscribe(
        () => {
          this.snackBar.open('Service deleted successfully.', 'Close', { duration: 3000 });
          this.router.navigate(['/services/list']);
        },
        (error) => {
          console.error('Error deleting service:', error);
          this.snackBar.open('Failed to delete service.', 'Close', { duration: 3000 });
        }
      );
    }
  }

  approveService(): void {
    if (confirm('Are you sure you want to approve this service?') && this.customIdentifier) {
      this.serviceService.approveService(this.customIdentifier).subscribe(
        () => {
          this.snackBar.open('Service approved successfully.', 'Close', { duration: 3000 });
          this.loadServiceDetails(); // Reload to update status
        },
        (error) => {
          console.error('Error approving service:', error);
          this.snackBar.open('Failed to approve service.', 'Close', { duration: 3000 });
        }
      );
    }
  }

  toggleServiceStatus(): void {
    if (confirm('Are you sure you want to toggle the status of this service?') && this.customIdentifier) {
      this.serviceService.toggleServiceStatus(this.customIdentifier).subscribe(
        () => {
          this.snackBar.open('Service status toggled successfully.', 'Close', { duration: 3000 });
          this.loadServiceDetails(); // Reload to update status
        },
        (error) => {
          console.error('Error toggling service status:', error);
          this.snackBar.open('Failed to toggle service status.', 'Close', { duration: 3000 });
        }
      );
    }
  }

  onCategorySelect(categories: CategoryInterface[] | CategoryInterface | null): void {
    console.log('onCategorySelect called with:', categories);
    if (categories === null) {
      this.selectedCategory = null;
      this.serviceForm.get('categoryCustomIdentifier')?.setValue('');
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

  goBack(): void {
    this.router.navigate(['/services/list']);
  }

  loadAvailableRegions(): void {
    // Load available regions (cities) from a service or use a comprehensive list
    // This should include all major cities in India
    this.availableRegions = [
      'Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata',
      'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur',
      'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna',
      'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad',
      'Meerut', 'Rajkot', 'Kalyan-Dombivli', 'Vasai-Virar', 'Varanasi',
      'Amritsar', 'Allahabad', 'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur',
      'Gwalior', 'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur', 'Kota',
      'Guwahati', 'Chandigarh', 'Solapur', 'Hubli-Dharwad', 'Bareilly',
      'Moradabad', 'Mysore', 'Gurgaon', 'Aligarh', 'Jalandhar', 'Tiruchirappalli',
      'Bhubaneswar', 'Salem', 'Mira-Bhayandar', 'Warangal', 'Thiruvananthapuram',
      'Bhiwandi', 'Saharanpur', 'Gorakhpur', 'Guntur', 'Bikaner', 'Amravati',
      'Noida', 'Jamshedpur', 'Bhilai', 'Cuttack', 'Firozabad', 'Kochi',
      'Nellore', 'Bhavnagar', 'Dehradun', 'Durgapur', 'Asansol', 'Rourkela',
      'Nanded', 'Kolhapur', 'Ajmer', 'Akola', 'Gulbarga', 'Jamnagar',
      'Ujjain', 'Loni', 'Siliguri', 'Jhansi', 'Ulhasnagar', 'Sangli-Miraj & Kupwad',
      'Tirupati', 'Malegaon', 'Jammu', 'Belgaum', 'Mangalore', 'Ambattur',
      'Tirunelveli', 'Shahjahanpur', 'Bhiwandi-Nizampur', 'Purnia', 'Muzaffarpur',
      'Raebareli', 'Panihati', 'Latur', 'Dhule', 'Tirupur', 'Sagar',
      'Bhagalpur', 'Panchkula', 'Aurangabad', 'Bankura', 'Naihati', 'Serampore',
      'North Dumdum', 'Bhatpara', 'Maheshtala', 'Hapur', 'Bihar Sharif',
      'Sambalpur', 'Bardhaman', 'Raebareli', 'Kanchipuram', 'Vellore', 'Kirari Suleman Nagar'
    ];
  }

  onRegionChange(regions: string[] | string | null): void {
    console.log('onRegionChange called with:', regions);

    if (regions === null) {
      // "All India" selected - set empty array to indicate all regions
      this.serviceForm.get('availableRegions')?.setValue([]);
      console.log('Form control set to empty array for All India');
    } else if (Array.isArray(regions)) {
      this.serviceForm.get('availableRegions')?.setValue(regions);
      console.log('Form control set to array:', regions);
    } else {
      this.serviceForm.get('availableRegions')?.setValue([regions]);
      console.log('Form control set to single region array:', [regions]);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
