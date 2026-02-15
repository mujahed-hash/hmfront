import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AllService } from '../../services/all.service';
import { AuthService } from '../../auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrderDialogComponent } from '../order-dialog/order-dialog.component';
import { AlertService } from '../alert.service'; // Import AlertService

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
  selector: 'app-service-detail',
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.scss']
})
export class ServiceDetailComponent implements OnInit, OnDestroy {
  service: Service | null = null;
  isLoading = true;
  error = false;
  errorMessage = '';
  currentImageIndex = 0;
  showContactInfo = false;
  imageLoading = false;
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private allService: AllService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private alertService: AlertService // Inject AlertService
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
    this.imageLoading = false;
  }
  
  ngOnInit() {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const customIdentifier = params.get('customIdentifier');
      if (customIdentifier) {
        this.loadServiceDetail(customIdentifier);
      }
    });
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  loadServiceDetail(customIdentifier: string) {
    this.isLoading = true;
    this.error = false;
    
    this.allService.getServiceByIdentifier(customIdentifier).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        console.log('Service detail loaded:', response);
        this.service = response.service || response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading service detail:', error);
        this.isLoading = false;
        this.error = true;
        
        if (error.status === 404) {
          this.errorMessage = 'Service not found. It may have been removed or is no longer available.';
        } else if (error.status === 401) {
          this.errorMessage = 'Authentication error. Please log in and try again.';
        } else if (error.status === 0) {
          this.errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          this.errorMessage = error.error?.message || 'Failed to load service details. Please try again later.';
        }
      }
    });
  }
  
  backToList() {
    this.router.navigate(['/all-services']);
  }
  
  orderService() {
    if (!this.service) return;
    
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      this.alertService.default('Please log in to order this service', 'Authentication Required', false);
      this.router.navigate(['/login'], { 
        queryParams: { 
          returnUrl: `/all-services/${this.service?.customIdentifier}` 
        }
      });
      return;
    }
    
    // Open order dialog
    const dialogRef = this.dialog.open(OrderDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: { service: this.service }
    });
    
    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result) {
        // User submitted the order form
        console.log('Order data:', result);
        
        // Prepare order data for API
        const orderData: any = {
          serviceId: this.service?._id,
          name: result.name,
          email: result.email,
          phone: result.phone,
          address: result.address,
          quantity: result.quantity,
          notes: result.notes
        };
        
        // We don't need to include supplierId since the backend will handle finding a supplier
        // The service.user is null, so we'll let the backend handle finding an appropriate supplier
        console.log('Service user data:', this.service?.user);
        
        console.log('Service object:', this.service);
        console.log('Order data being sent:', orderData);
        
        // Submit order to backend
        this.allService.createServiceOrder(orderData).pipe(takeUntil(this.destroy$)).subscribe({
          next: (response) => {
            console.log('Order created successfully:', response);
            
            // Show success message and navigate after a delay
            this.alertService.success('Your order has been placed successfully!', 'Order Confirmation', true, 2000); // Show for 2 seconds
            setTimeout(() => {
              this.router.navigate(['/profile/orders']);
            }, 2000); // Navigate after 2 seconds
          },
          error: (error) => {
            console.error('Error creating order:', error);
            
            // Show error message and do not navigate
            this.alertService.error('Failed to place order. Please try again.', 'Order Failed', true, 2000); // Show for 2 seconds
          }
        });
      }
    });
  }
  
  contactSupplier() {
    if (this.service?.user?.customIdentifier) {
      this.showContactInfo = !this.showContactInfo;
    }
  }
  
  getStarArray(rating: number): boolean[] {
    const stars: boolean[] = [];
    const roundedRating = Math.round(rating * 2) / 2; // Round to nearest 0.5
    
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= roundedRating);
    }
    
    return stars;
  }
  
  nextImage() {
    if (this.service?.images && this.service.images.length > 0) {
      this.imageLoading = true;
      this.currentImageIndex = (this.currentImageIndex + 1) % this.service.images.length;
      // Preload the next image
      const nextIndex = (this.currentImageIndex + 1) % this.service.images.length;
      this.preloadImage(this.service.images[nextIndex]);
    }
  }
  
  prevImage() {
    if (this.service?.images && this.service.images.length > 0) {
      this.imageLoading = true;
      this.currentImageIndex = (this.currentImageIndex - 1 + this.service.images.length) % this.service.images.length;
      // Preload the previous image
      const prevIndex = (this.currentImageIndex - 1 + this.service.images.length) % this.service.images.length;
      this.preloadImage(this.service.images[prevIndex]);
    }
  }
  
  selectImage(index: number) {
    this.imageLoading = true;
    this.currentImageIndex = index;
  }
  
  // Preload image to improve navigation experience
  private preloadImage(imagePath: string): void {
    if (!imagePath) return;
    
    const img = new Image();
    img.src = this.getImageUrl(imagePath);
    img.onload = () => {
      // Image loaded successfully
      setTimeout(() => {
        this.imageLoading = false;
      }, 300); // Small delay to avoid flashing
    };
    img.onerror = () => {
      // Image failed to load
      this.imageLoading = false;
    };
  }
  
  callPhone(phone: string) {
    window.location.href = `tel:${phone}`;
  }
  
  sendEmail(email: string) {
    window.location.href = `mailto:${email}`;
  }
  
  openMaps(address: string) {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
  }
  
  retryLoading() {
    const customIdentifier = this.route.snapshot.paramMap.get('customIdentifier');
    if (customIdentifier) {
      this.loadServiceDetail(customIdentifier);
    } else {
      this.backToList();
    }
  }
  
  shareService() {
    if (navigator.share && this.service) {
      navigator.share({
        title: this.service.serviceName,
        text: `Check out this service: ${this.service.serviceName}`,
        url: window.location.href
      })
      .catch(error => console.error('Error sharing:', error));
    } else {
      // Fallback for browsers that don't support Web Share API
      this.snackBar.open('Link copied to clipboard!', 'Close', {
        duration: 3000
      });
      
      // Copy to clipboard
      const dummy = document.createElement('textarea');
      document.body.appendChild(dummy);
      dummy.value = window.location.href;
      dummy.select();
      document.execCommand('copy');
      document.body.removeChild(dummy);
    }
  }
}