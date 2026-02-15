import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiceService } from '../../services/service.service';
import { AllService } from '../../services/all.service'; // Corrected import
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Service } from '../service-list/service-list.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface Category {
  _id: string;
  name: string;
  icon: string;
  customIdentifier: string;
  description?: string;
  image?: string;
  isActive?: boolean;
}

@Component({
  selector: 'app-service-create',
  templateUrl: './service-create.component.html',
  styleUrls: ['./service-create.component.scss']
})
export class ServiceCreateComponent implements OnInit, OnDestroy {
  serviceForm!: FormGroup;
  selectedFiles: File[] = [];
  categories: Category[] = [];
  loading: boolean = false;
  isEditMode: boolean = false;
  existingService: any = null;
  availableRegions: string[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private serviceService: ServiceService,
    private categoryService: AllService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // Check if we're in edit mode
    this.route.data.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.isEditMode = data['editMode'] || false;
    });

    this.loadAvailableRegions();

    this.serviceForm = this.fb.group({
      serviceName: ['', Validators.required],
      serviceDesc: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      categoryCustomIdentifier: [''], // Optional category
      availableRegions: [[]], // Array of regions
      contactPhone: [''],
      contactEmail: ['', Validators.email],
      // images handled separately
    });

    this.loadCategories();

    if (this.isEditMode) {
      const customIdentifier = this.route.snapshot.paramMap.get('customIdentifier');
      if (customIdentifier) {
        this.loadServiceForEdit(customIdentifier);
      }
    }
  }

  loadCategories(): void {
    // Use the new service categories API
    this.categoryService.getServiceCategories({ active: true }).pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        if (response && Array.isArray(response)) {
          // If response is already an array
          this.categories = response.filter((cat: Category) => cat.isActive);
        } else if (response && Array.isArray(response.categories)) {
          // If response has a categories array property
          this.categories = response.categories.filter((cat: Category) => cat.isActive);
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

  loadServiceForEdit(customIdentifier: string): void {
    this.loading = true;
    this.serviceService.getServiceByCustomIdentifier(customIdentifier).pipe(takeUntil(this.destroy$)).subscribe(
      (service: Service) => {
        this.existingService = service;
        this.selectedFiles = []; // Reset selected files for edit mode

        this.serviceForm.patchValue({
          serviceName: service.serviceName,
          serviceDesc: service.serviceDesc,
          price: service.price,
          categoryCustomIdentifier: service.category?.customIdentifier || '',
          availableRegions: service.availableRegions || [],
          contactPhone: service.contactInfo?.phone || '',
          contactEmail: service.contactInfo?.email || '',
        });
        this.loading = false;
      },
      (error) => {
        console.error('Error loading service for edit:', error);
        this.snackBar.open('Failed to load service for editing.', 'Close', { duration: 3000 });
        this.loading = false;
      }
    );
  }

  onFileSelected(event: any): void {
    this.selectedFiles = Array.from(event.target.files);
  }

  onSubmit(): void {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      this.snackBar.open('Please fill in all required fields correctly.', 'Close', { duration: 3000 });
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
    if (regions && regions.length > 0) {
      formData.append('availableRegions', JSON.stringify(regions));
    }

    if (this.serviceForm.get('contactPhone')?.value) {
      formData.append('contactPhone', this.serviceForm.get('contactPhone')?.value);
    }
    if (this.serviceForm.get('contactEmail')?.value) {
      formData.append('contactEmail', this.serviceForm.get('contactEmail')?.value);
    }

    this.selectedFiles.forEach(file => {
      formData.append('images', file, file.name);
    });

    if (this.isEditMode && this.existingService) {
      // Update existing service
      this.serviceService.updateService(this.existingService.customIdentifier, formData).pipe(takeUntil(this.destroy$)).subscribe(
        (response) => {
          this.snackBar.open('Service updated successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/services/list']);
        },
        (error) => {
          console.error('Error updating service:', error);
          this.snackBar.open('Failed to update service.', 'Close', { duration: 3000 });
          this.loading = false;
        }
      );
    } else {
      // Create new service
      this.serviceService.createService(formData).pipe(takeUntil(this.destroy$)).subscribe(
        (response) => {
          this.snackBar.open('Service created successfully! Awaiting admin approval.', 'Close', { duration: 3000 });
          this.router.navigate(['/services/list']);
        },
        (error) => {
          console.error('Error creating service:', error);
          this.snackBar.open('Failed to create service.', 'Close', { duration: 3000 });
          this.loading = false;
        }
      );
    }
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
      this.serviceForm.get('availableRegions')?.setValue([]);
    } else if (Array.isArray(regions)) {
      this.serviceForm.get('availableRegions')?.setValue(regions);
    } else {
      this.serviceForm.get('availableRegions')?.setValue([regions]);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
