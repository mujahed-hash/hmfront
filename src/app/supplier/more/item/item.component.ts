import { Component } from '@angular/core';
import { SupplierService } from '../../supplier.service';
import { LocalStorageService } from 'src/app/auth/login/local-storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent {
  product:any;
  NewCDI:any;
  token:any;
  selectedImageIndex: number = 0;
  error: string = '';
    private destroy$ = new Subject<void>();
  
  constructor(
    private route: ActivatedRoute,
    private productService: SupplierService,
    private router: Router,

    private productsService: SupplierService,
   
  ) { }


  ngOnInit(){
    this.token = localStorage.getItem('token');
    this.getItem()
  }
  getItem(){
    this.route.params.subscribe((params) => {
      this.productsService.getProductByCustomIdentifier(params['customIdentifier']).pipe(takeUntil(this.destroy$)).subscribe({
        next: (data: any) => {
          this.product = data;
          this.NewCDI = data.customIdentifier;
        },
        error: (error: any) => {
          console.error('Error loading product:', error);
          this.error = 'Failed to load product. Please try again.';
          this.product = null;
        }
      });
        })
      }

      toggleEdit(): void {
        // this.isEditing = !this.isEditing;
        this.router.navigate(['/supplier/more/product/edit/', this.NewCDI ]);
    
      }    
      deleteItem(id: any) {
        // Show confirmation dialog
        const confirmDelete = window.confirm('Are you sure you want to delete this item?');
    
        if (confirmDelete) {
          // Proceed with deletion if confirmed
          this.productService.deleteProduct(id, this.token).pipe(takeUntil(this.destroy$)).subscribe(
            (response: any) => {
              console.log(response);
              this.router.navigate(['/supplier/more/allitems']);
            },
            (error) => {
              console.error('Error deleting product:', error);
              // Handle error response if needed
            }
          );
        } else {
          // User cancelled deletion
          console.log('Deletion cancelled');
        }
      }

      ngOnDestroy(): void {
        // Notify all subscriptions to complete
        this.destroy$.next();
        this.destroy$.complete();
      
      }
}
