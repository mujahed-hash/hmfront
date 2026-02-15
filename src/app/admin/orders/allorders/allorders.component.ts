import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { AdminService } from '../../admin.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-allorders',
  templateUrl: './allorders.component.html',
  styleUrls: ['./allorders.component.scss']
})
export class AllordersComponent {private destroy$ = new Subject<void>();

  loggedUser!:any;
  orders: any[] = [];
  start = 0;
  limit = 20;
  isLoading = false;
  hasMoreOrders = true;
  event!:any;
  token:any;
  @ViewChild('loadingIndicator') loadingIndicator!: ElementRef;

  constructor(private adminService: AdminService, private el: ElementRef){}
  ngOnInit() {
    this.token = localStorage.getItem('token')

    this.loadOrders();
  }
  ngAfterViewInit(): void {
    this.initIntersectionObserver();
    this.checkContentHeight();
  }

  loadOrders(): void {
    if (this.isLoading || !this.hasMoreOrders) return;
  
    this.isLoading = true;
    this.adminService.getOrdersAll(this.start, this.limit, this.token).pipe(takeUntil(this.destroy$))
    .subscribe(
      (data: any) => {
        this.isLoading = false;
        console.log(data)
        if (data && Array.isArray(data.orders)) {
          // Append new orders to the existing orders array
          this.orders = [...this.orders, ...data.orders];
          this.start += this.limit;
          this.checkContentHeight();
  
          // If fewer orders are returned than the limit, no more orders are available
          this.hasMoreOrders = data.orders.length === this.limit;
        } else {
          console.error('Unexpected response structure:', data);
          this.checkContentHeight();
        }
      },
      error => {
        this.isLoading = false;
        console.error('Error loading orders:', error);
      }
    );
  }
  
  // checkContentHeight() {
  //   const contentHeight = this.el.nativeElement.querySelector('.orders').offsetHeight;
  //   const windowHeight = window.innerHeight;
  //   this.hasMoreOrders = contentHeight < windowHeight;
  // }
  checkContentHeight() {
    const contentElement = this.el.nativeElement.querySelector('.items');
    if (contentElement) {
      const contentHeight = contentElement.offsetHeight;
      const windowHeight = window.innerHeight;
      this.hasMoreOrders = contentHeight < windowHeight;
    } else {
      console.error('Element with class ".items" not found.');
      this.hasMoreOrders = false;
    }
  }
  
  @HostListener('window:resize')
  onResize() {
    this.checkContentHeight();
  }
  
  initIntersectionObserver(): void {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && this.hasMoreOrders && !this.isLoading) {
        this.loadOrders();
      }
    }, {
      rootMargin: '100px'
    });
  
    if (this.loadingIndicator) {
      observer.observe(this.loadingIndicator.nativeElement);
    }
  }
  
  getAllOrders(){

  }

 ngOnDestroy(): void {
  // Notify all subscriptions to complete
  this.destroy$.next();
  this.destroy$.complete();

}

}
