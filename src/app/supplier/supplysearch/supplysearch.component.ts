import { Component } from '@angular/core';
import { SupplierService } from '../supplier.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-supplysearch',
  templateUrl: './supplysearch.component.html',
  styleUrls: ['./supplysearch.component.scss']
})
export class SupplysearchComponent {
  private destroy$ = new Subject<void>();

  products: any[]=[];
  totalResults: number = 0;
  query: string = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  start: number = 0;
  limit: number = 10;
  searchInput: string = ''; // Single input for query and price ranges
  token:any;
  hasSearched:any;
  constructor(private supplierProductService: SupplierService) {}

  ngOnInit(): void {
    this.token = localStorage.getItem('token')
    
  }

  searchProducts(): void {
    const { query, minPrice, maxPrice } = this.parseSearchInput(this.searchInput);

    this.supplierProductService
      .getSupplierSearched(query, minPrice, maxPrice, 0, 10, this.token).pipe(takeUntil(this.destroy$))
      .subscribe(
        (res) => {
          console.log(res);
          this.products = res.products || [];
          this.hasSearched = true; // Set flag to true when search is performed
        },
        (error) => {
          console.error('Error fetching products:', error);
          this.products = []; // Reset products on error
          this.hasSearched = true; // Still consider it a search attempt
        }
      );
  }

  resetSearch(): void {
    this.searchInput = '';
    this.products = [];
    this.hasSearched = false
  }

  /**
   * Parses the user input to extract query, minPrice, and maxPrice.
   * @param input User's input string.
   * @returns Parsed query, minPrice, and maxPrice.
   */
  private parseSearchInput(input: string): { query: string; minPrice: number | null; maxPrice: number | null } {
    let query = input;
    let minPrice: number | null = null;
    let maxPrice: number | null = null;

    const priceRangeRegex = /(\d+)-(\d+)/; // Matches "min-max" pattern
    const singlePriceRegex = /(\d+)$/; // Matches a single price at the end

    const rangeMatch = input.match(priceRangeRegex);
    const singleMatch = input.match(singlePriceRegex);

    if (rangeMatch) {
      minPrice = parseInt(rangeMatch[1], 10);
      maxPrice = parseInt(rangeMatch[2], 10);
      query = input.replace(priceRangeRegex, '').trim(); // Remove price range from query
    } else if (singleMatch) {
      minPrice = parseInt(singleMatch[1], 10);
      query = input.replace(singlePriceRegex, '').trim(); // Remove single price from query
    }

    return { query, minPrice, maxPrice };
  }
  ngOnDestroy(): void {
    // Notify all subscriptions to complete
    this.destroy$.next();
    this.destroy$.complete();
  
  }
}
