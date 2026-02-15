import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AllService } from 'src/app/services/all.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-post-sup-req',
  templateUrl: './post-sup-req.component.html',
  styleUrls: ['./post-sup-req.component.scss']
})
export class PostSupReqComponent implements OnInit {
  requirement: any;
  customIdentifier: string = '';
  name: string = '';
  price: number = 0;
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  token: string | null = null;
  loading: boolean = false;
  error: string | null = null;
  isDeliveryDetail: boolean = false;
  deliveryProduct: any = null;
  SubmittedProd: any = null;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private allService: AllService
  ) {}

  ngOnInit(): void {
    this.token = localStorage.getItem('token');
    this.route.params.subscribe(params => {
      if (params['customIdentifier']) {
        this.customIdentifier = params['customIdentifier'];
        this.loadRequirement();
      } else if (params['id']) {
        this.customIdentifier = params['id'];
        this.isDeliveryDetail = true;
        this.loadDeliveryDetail();
      }
    });
  }

  loadRequirement(): void {
    this.loading = true;
    this.error = null;
    this.allService.getRequirementByCustomIdentifier(this.customIdentifier, this.token)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.requirement = data;
          if (data && data.productSubmission) {
            this.SubmittedProd = data.productSubmission;
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = err.message || 'Failed to load requirement';
          this.loading = false;
        }
      });
  }

  loadDeliveryDetail(): void {
    this.loading = true;
    this.error = null;
    
    // First try to load as a requirement
    this.allService.getRequirementByIdentifier(this.customIdentifier, this.token)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.requirement = data;
          
          // If this requirement has a completed product, load it
          if (this.requirement && this.requirement.completedProducts && this.requirement.completedProducts.length > 0) {
            this.deliveryProduct = this.requirement.completedProducts[0];
            this.SubmittedProd = this.deliveryProduct;
          }
          
          // Set SubmittedProd for backward compatibility
          if (data && data.productSubmission) {
            this.SubmittedProd = data.productSubmission;
          }
          
          this.loading = false;
        },
        error: (err) => {
          this.error = err.message || 'Failed to load delivery details';
          this.loading = false;
        }
      });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Preview the image
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  isFormValid(): boolean {
    return !!this.name && this.price > 0 && !!this.selectedFile;
  }

  postProductInfo(): void {
    if (!this.token || !this.requirement || !this.selectedFile) {
      return;
    }
    
    this.loading = true;
    this.allService.postProductInfo(
      this.requirement._id,
      this.name,
      this.price,
      this.selectedFile,
      this.token
    ).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        // Reset the form
        this.name = '';
        this.price = 0;
        this.selectedFile = null;
        this.imagePreview = null;
        
        // Reload the requirement to see the changes
        this.loadRequirement();
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to post product information';
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
