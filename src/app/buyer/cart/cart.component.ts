import { Component, OnInit } from '@angular/core';
import { BuyerService } from '../buyer.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  token: any;
  cart: any = [];
  user: any = {}; // Initialize user as an empty object
  showModal: boolean = false;
  showModal2: boolean = false;
  private destroy$ = new Subject<void>();

  notes: any;
  constructor(
    private buyerService: BuyerService,
    private router: Router,
    private authService: AuthService
  ) { }
  ngOnInit() {
    this.token = localStorage.getItem('token')
    this.loadCart(); // Reload cart after checkout
    this.loadUser();
  }
  loadCart(): void {
    this.buyerService.getCart(this.token).pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.cart = data.items;
      });
  }
  loadUser(): void {
    this.buyerService.getUserProfile(this.token).pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.user = data.user;
        this.user = data.user;
      });
  }
  checkoutAllItems(): void {
    this.showModal = true;
  }

  // confirmCheckout(confirmed: boolean): void {
  //   this.showModal = false;
  //   if (confirmed) {
  //     this.buyerService.checkoutAllItems(this.token, this.notes).subscribe(response => {
  //       console.log('Checkout all items:', response);
  //       this.loadCart(); // Reload cart after checkout
  //     });
  //   }
  // }
  confirmCheckout(event: { confirmed: boolean, notes: string }): void {
    this.showModal = false;
    if (event.confirmed) {
      this.notes = event.notes;
      this.buyerService.checkoutAllItems(this.token, this.notes).pipe(takeUntil(this.destroy$))
        .subscribe(response => {
          // Checkout successful
          this.loadCart(); // Reload cart after checkout
        });
    }
  }

  checkoutSingleItem(): void {
    this.showModal2 = true;

  }
  confirmCheckoutSingle(productId: string, event: { confirmed: boolean, notes: string }): void {
    this.showModal2 = false;
    if (event.confirmed) {
      this.notes = event.notes;
      this.buyerService.checkoutSingleItem(productId, this.token, this.notes).pipe(takeUntil(this.destroy$))
        .subscribe(response => {
          // Single item checkout successful
          this.router.navigate(['/buyer/purchases'])

          this.loadCart(); // Reload cart after checkout
        });
    }
  }
  deleteCart(id: string, token: any, quantity: number = 1): void {
    if (confirm('Are you sure you want to delete this Cart?')) {
      this.buyerService.deleteCartItem(id, this.token, quantity).pipe(takeUntil(this.destroy$))
        .subscribe(
          response => {
            this.loadCart(); // Reload the cart after deletion
          },
          error => {
            console.error('There was an error!', error);
          }
        );
    }
  }

  ngOnDestroy(): void {
    // Notify all subscriptions to complete
    this.destroy$.next();
    this.destroy$.complete();

  }

}
