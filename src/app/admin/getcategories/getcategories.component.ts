import { Component, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';
import { MatDialog } from '@angular/material/dialog';
import { PEcategoriesComponent } from '../pecategories/pecategories.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-getcategories',
  templateUrl: './getcategories.component.html',
  styleUrls: ['./getcategories.component.scss']
})
export class GetcategoriesComponent implements OnInit {
  private destroy$ = new Subject<void>();

  token: string | null;
  categories: any[] = [];

  constructor(
    private userService: AdminService,
    public dialog: MatDialog
  ) {
    this.token = localStorage.getItem('token');
  }

  ngOnInit() {
    this.getCategories();
  }

  getCategories() {
    if (this.token) {
      this.userService.getCategories(this.token).pipe(takeUntil(this.destroy$))
.subscribe(
        (data: any) => {
          this.categories = data;
          console.log(this.categories)
        },
        error => console.error('Error fetching categories', error)
      );
    }
  }

  openDialog(category?: any): void {
    const dialogRef = this.dialog.open(PEcategoriesComponent, {
      width: '400px',
      data: category ? { itemType: category.itemType, itemName: category.itemName, image: category.image, id: category._id } : {}
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$))
.subscribe(result => {
      if (result) {
        this.getCategories();
      }
    });
  }

  deleteCategory(id: any, token:any): void {
    if (this.token && confirm('Are you sure you want to delete this category?')) {
      this.userService.deleteCategory(id, token ).pipe(takeUntil(this.destroy$))
.subscribe(
        () => {
          alert('Category deleted successfully');
          this.getCategories();
        },
        error => console.error('Error deleting category', error)
      );
    }
  }
   
 ngOnDestroy(): void {
  // Notify all subscriptions to complete
  this.destroy$.next();
  this.destroy$.complete();

}

}
