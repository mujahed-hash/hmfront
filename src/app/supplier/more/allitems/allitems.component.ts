import { Component,ElementRef,HostListener, ViewChild } from '@angular/core';
import { SupplierService } from '../../supplier.service';
import { LocalStorageService } from 'src/app/auth/login/local-storage.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-allitems',
  templateUrl: './allitems.component.html',
  styleUrls: ['./allitems.component.scss']
})
export class AllitemsComponent {
  loggedUser!:any;
  products: any[] = [];
  start = 0;
  limit = 10;
  isLoading = false;
  hasMoreProducts = true;
  event!:any;
  token:any;
  private destroy$ = new Subject<void>();

  @ViewChild('loadingIndicator') loadingIndicator!: ElementRef;
   constructor(private supplyService: SupplierService,private lService:LocalStorageService,  private el: ElementRef){}
   ngOnInit() {
    this.token = localStorage.getItem('token')

    this.loggedUser = this.lService.getUserIdFromToken();
    this.loadProducts();
  }

  ngAfterViewInit(): void {
    this.initIntersectionObserver();
    this.checkContentHeight();
  }

  loadProducts(): void {
    if (this.isLoading || !this.hasMoreProducts) return;

    this.isLoading = true;
    this.supplyService.getItems(this.start, this.limit, this.token).pipe(takeUntil(this.destroy$)).subscribe(
      data => {
        this.isLoading = false;
        if (data && Array.isArray(data.products)) {
          this.products = [...this.products, ...data.products];
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
    const contentHeight = this.el.nativeElement.querySelector('.items').offsetHeight;
    const windowHeight = window.innerHeight;
    this.hasMoreProducts = contentHeight < windowHeight;
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
  ngOnDestroy(): void {
    // Notify all subscriptions to complete
    this.destroy$.next();
    this.destroy$.complete();
  
  }
}

