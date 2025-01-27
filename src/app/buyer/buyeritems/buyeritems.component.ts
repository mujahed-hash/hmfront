import { Component,ElementRef,HostListener, ViewChild } from '@angular/core';
import { LocalStorageService } from 'src/app/auth/login/local-storage.service'
import { SupplierService } from 'src/app/supplier/supplier.service';
import { BuyerService } from '../buyer.service';
import { MessageService } from 'primeng/api';
import { NotificationService,Notification  } from 'src/app/notification.service';
import { Subject, takeUntil } from 'rxjs';
 

@Component({
  selector: 'app-buyeritems',
  templateUrl: './buyeritems.component.html',
  styleUrls: ['./buyeritems.component.scss']
})
export class BuyeritemsComponent {
  private destroy$ = new Subject<void>();

  loggedUser!:any;
  products: any[] = [];
  start = 0;
  limit = 10;
  isLoading = false;
  hasMoreProducts = true;
  event!:any;
  quantity!:any;
  quant:any;
  product:any;
  token:any;
  quantities: { [key: string]: number } = {}; 
  notifications: Notification[] = [];
    // This object holds the quantity for each product
  @ViewChild('loadingIndicator') loadingIndicator!: ElementRef;
   constructor(private supplyService: SupplierService,private lService:LocalStorageService,  private el: ElementRef, 
    private buyerService:BuyerService, private messageService: MessageService, private notificationService: NotificationService ){
    }
   ngOnInit() {
    this.loggedUser = this.lService.getUserIdFromToken();
    this.loadProducts();
    this.token = localStorage.getItem('token');
    console.log(this.quantity);
    this.notificationService.notifications$.pipe(takeUntil(this.destroy$)).subscribe(notifications => {
      this.notifications = notifications;
      console.log(this.notifications)
    });
    this.products.forEach(product => {
      this.quantities[product.id] = this.quantities[product.id] || 1; // Set default quantity to 1
    });
  }

  ngAfterViewInit(): void {
    this.initIntersectionObserver();
    this.checkContentHeight();
  }

  loadProducts(): void {
    if (this.isLoading || !this.hasMoreProducts) return;

    this.isLoading = true;
    this.supplyService.getProducts(this.start, this.limit).pipe(takeUntil(this.destroy$))
.subscribe(
      (data:any) => {
        console.log(data)
        this.isLoading = false;
        if (data && Array.isArray(data.products)) {
          this.products = [...this.products, ...data.products];
          this.products.forEach(product => {
            if (!this.quantities[product._id]) {
              this.quantities[product._id] = 1; // Set default quantity to 1 if not already set
            }
            // this.incart[product.id] = data.inCart?.includes(product.id);
          });
          this.start += this.limit;
          this.checkContentHeight();

          // If fewer products are returned than the limit, no more products are available
          this.hasMoreProducts = data.products.length === this.limit;
        } else {
          console.error('Unexpected response structure:', data);
          this.checkContentHeight();
        }
      },
      error => {
        this.isLoading = false;
        console.error('Error loading products:', error);
      }
    );
  }

  checkContentHeight() {
    const contentHeight = this.el.nativeElement.querySelector('.items-').offsetHeight;
    const windowHeight = window.innerHeight;
    // this.hasMoreProducts = contentHeight < windowHeight;
    this.hasMoreProducts = contentHeight > windowHeight;
  }

  @HostListener('window:resize')
  onResize() {
    this.checkContentHeight();
  }

  initIntersectionObserver(): void {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && this.hasMoreProducts && !this.isLoading) {
        this.loadProducts();
      }
    }, {
      rootMargin: '100px'
    });

    if (this.loadingIndicator) {
      observer.observe(this.loadingIndicator.nativeElement);
    }
  }

  addProductToCart(productId: any) {
    const quantity = this.quantities[productId] || 1;
    console.log()
    this.buyerService.addToCart(productId, quantity, this.token).pipe(takeUntil(this.destroy$))
.subscribe(
      (data: any) => {
        this.loadProducts();
        this.notificationService.addNotification('Item added to cart!', 'success');
        console.log(data);
      },
      (error: any) => {
        console.error('Error adding product to cart:', error);
      }
    );

  }
  
  ngOnDestroy(): void {
    // Notify all subscriptions to complete
    this.destroy$.next();
    this.destroy$.complete();
  
  }
  // gotocart(){
  //   this.router.navigate['/']
  // }
}
