import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SupplierService } from 'src/app/supplier/supplier.service';
import { BuyerService } from '../buyer.service';
import { NotificationService } from 'src/app/notification.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Location } from '@angular/common';
import { AuthService } from 'src/app/auth/auth.service';
@Component({
  selector: 'app-viewitem',
  templateUrl: './viewitem.component.html',
  styleUrls: ['./viewitem.component.scss']
})
export class ViewitemComponent {
  token: any;
  notifications: any[] = [];
  private destroy$ = new Subject<void>();

  product: any;
  quantities: { [key: string]: number } = {}; // This object holds the quantity for each product
  selectedImageIndex: number = 0;

  // Image gallery methods
  selectImage(index: number): void {
    if (index >= 0 && index < this.product.images.length) {
      this.selectedImageIndex = index;
    }
  }

  nextImage(): void {
    if (this.product.images && this.product.images.length > 1) {
      this.selectedImageIndex = (this.selectedImageIndex + 1) % this.product.images.length;
    }
  }

  previousImage(): void {
    if (this.product.images && this.product.images.length > 1) {
      this.selectedImageIndex = this.selectedImageIndex === 0 ?
        this.product.images.length - 1 : this.selectedImageIndex - 1;
    }
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private productsService: SupplierService,
    private buyerService: BuyerService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) { }


  ngOnInit() {
    this.getItem();
    this.token = localStorage.getItem('token');
    this.notificationService.notifications$.pipe(takeUntil(this.destroy$)).subscribe(notifications => {
      this.notifications = notifications;
    });
  }
  getItem() {
    this.route.params.subscribe((params) => {
      this.productsService.getProductByCustomIdentifier(params['customIdentifier']).pipe(takeUntil(this.destroy$)).subscribe((data: any) => {
        this.product = data;
        if (!this.quantities[this.product.id]) {
          this.quantities[this.product.id] = 1; // Set default quantity to 1 if not already set
        }
        // Ensure the first image is selected by default
        if (this.product.images && this.product.images.length > 0) {
          this.selectedImageIndex = 0;
        }
        console.log(data);
      });
    })
  }

  addProductToCart(productId: string) {
    const quantity = this.quantities[productId] || 1;
    this.buyerService.addProductToCart(productId, quantity, this.token).pipe(takeUntil(this.destroy$)).subscribe(
      (data: any) => {
        this.notificationService.addNotification('Item added to cart!', 'success');
        this.getItem();
      },
      (error: any) => {
        console.error('Error adding product to cart:', error);
      }
    );
  }
  goBack() {
    this.location.back()
  }
  ngOnDestroy(): void {
    // Notify all subscriptions to complete
    this.destroy$.next();
    this.destroy$.complete();

  }
}
