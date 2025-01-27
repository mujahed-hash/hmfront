import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { BuyerService } from '../../buyer.service';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from 'src/app/notification.service';
import { Subject, takeUntil } from 'rxjs';


@Component({
  selector: 'app-itembycategory',
  templateUrl: './itembycategory.component.html',
  styleUrls: ['./itembycategory.component.scss']
})
export class ItembycategoryComponent {
  private destroy$ = new Subject<void>();

  catId:any;
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
  notifications: any[] = [];
  @ViewChild('loadingIndicator') loadingIndicator!: ElementRef;

constructor(private BuyerService:BuyerService, private actRoute: ActivatedRoute, private el: ElementRef,  private notificationService: NotificationService){}


ngOnInit(){
  this.actRoute.params.subscribe((param:any)=>{
    this.catId = param['customIdentifer']
  })
  // this.BuyerService.getProductsByCategory(this.catId).subscribe((data:any)=>{
  //   console.log(data)
  // })
  this.loadProducts();
  this.token = localStorage.getItem('token');
  console.log(this.quantity);
  this.notificationService.notifications$.pipe(takeUntil(this.destroy$)).pipe(takeUntil(this.destroy$)).subscribe(notifications => {
    this.notifications = notifications;
  });
  this.products.forEach(product => {
    this.quantities[product.id] = this.quantities[product.id] || 1; // Set default quantity to 1
  })
}


ngAfterViewInit(): void {
  this.initIntersectionObserver();
  this.checkContentHeight();
}

loadProducts(): void {
  if (this.isLoading || !this.hasMoreProducts) return;

  this.isLoading = true;
  this.token = localStorage.getItem('token');

  console.log('toke', this.token)
  this.BuyerService.getProductsByCategory(this.token,this.catId,this.start, this.limit).pipe(takeUntil(this.destroy$)).subscribe(
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
  const contentHeight = this.el.nativeElement.querySelector('.items-')!.offsetHeight;
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
  this.BuyerService.addToCart(productId, quantity, this.token).pipe(takeUntil(this.destroy$)).subscribe(
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
}
