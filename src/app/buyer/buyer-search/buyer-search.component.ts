import { Component } from '@angular/core';
import { SharedService } from 'src/app/shared/shared.service';
import { Subject, takeUntil } from 'rxjs';



@Component({
  selector: 'app-buyer-search',
  templateUrl: './buyer-search.component.html',
  styleUrls: ['./buyer-search.component.scss']
})
export class BuyerSearchComponent {
  private destroy$ = new Subject<void>();

  query: string = ''; // User's search input
  products: any[] = []; // Store search results
  totalProducts: number = 0; // Total products for pagination
  start: number = 0; // Pagination start index
  limit: number = 10; // Number of items per page
  searchPerformed: boolean = false; // New flag
  constructor(private productService: SharedService) {}

  ngOnInit(): void {
    // Optionally perform a search on load (for example, with an empty query)
    // this.onSearch();
  }

  // Search products with the given query and token authorization
  onSearch(): void {
    const token = localStorage.getItem('token'); // Get token from localStorage
    this.searchPerformed = true; // Mark search as performed
    if (this.query.trim()) {
      this.productService.searchProducts(this.query, this.start, this.limit, token).pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            this.products = data.products;
            this.totalProducts = data.totalProducts;
          },
          error: (err) => {
            console.error('Search error:', err);
          }
        });
    } else {
      // Reset products if query is empty
      this.products = [];
      this.totalProducts = 0;
    }
  }

  // Navigate to the next page of results
  nextPage(): void {
    if (this.start + this.limit < this.totalProducts) {
      this.start += this.limit;
      this.onSearch();
    }
  }

  // Navigate to the previous page of results
  prevPage(): void {
    if (this.start > 0) {
      this.start -= this.limit;
      this.onSearch();
    }
  }

 
 ngOnDestroy(): void {
  // Notify all subscriptions to complete
  this.destroy$.next();
  this.destroy$.complete();

}

}
