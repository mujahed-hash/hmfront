import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ServiceCategory, ServiceCategoryService } from '../../../services/service-category.service';
import { ServiceCategoryFormComponent } from '../service-category-form/service-category-form.component';
import { CategoryDetailsDialogComponent } from '../category-details-dialog/category-details-dialog.component';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-service-category-list',
  templateUrl: './service-category-list.component.html',
  styleUrls: ['./service-category-list.component.scss']
})
export class ServiceCategoryListComponent implements OnInit {
  displayedColumns: string[] = ['image', 'name', 'description', 'sortOrder', 'isActive', 'serviceCount', 'actions'];
  dataSource = new MatTableDataSource<ServiceCategory>([]);
  loading = false;
  isAdmin = false;
  isSuperAdmin = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private serviceCategoryService: ServiceCategoryService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.isSuperAdmin = this.authService.isSuperAdmin();

    if (!this.isAdmin && !this.isSuperAdmin) {
      this.snackBar.open('You do not have permission to access this page', 'Close', { duration: 3000 });
      this.router.navigate(['/']);
      return;
    }

    this.loadCategories();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadCategories() {
    this.loading = true;
    this.serviceCategoryService.getAllCategories().subscribe(
      (categories) => {
        this.dataSource.data = categories;
        this.loading = false;
      },
      (error) => {
        console.error('Error loading service categories:', error);
        this.snackBar.open('Error loading service categories', 'Close', { duration: 3000 });
        this.loading = false;
      }
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openCategoryForm(category?: ServiceCategory) {
    const dialogRef = this.dialog.open(ServiceCategoryFormComponent, {
      width: '600px',
      data: { category: category }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'success') {
        this.loadCategories();
      }
    });
  }

  deleteCategory(category: ServiceCategory) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Category',
        message: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.serviceCategoryService.deleteCategory(category.customIdentifier).subscribe(
          () => {
            this.snackBar.open('Category deleted successfully', 'Close', { duration: 3000 });
            this.loadCategories();
          },
          (error) => {
            console.error('Error deleting category:', error);
            let errorMessage = 'Failed to delete category';
            
            if (error?.error?.error) {
              errorMessage = error.error.error;
            }
            
            this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
            this.loading = false;
          }
        );
      }
    });
  }

  toggleStatus(category: ServiceCategory) {
    const formData = new FormData();
    formData.append('isActive', (!category.isActive).toString());
    
    this.loading = true;
    this.serviceCategoryService.updateCategory(category.customIdentifier, formData).subscribe(
      (updatedCategory) => {
        category.isActive = updatedCategory.isActive;
        this.snackBar.open(`Category ${updatedCategory.isActive ? 'activated' : 'deactivated'} successfully`, 'Close', { duration: 3000 });
        this.loading = false;
      },
      (error) => {
        console.error('Error toggling category status:', error);
        this.snackBar.open('Failed to update category status', 'Close', { duration: 3000 });
        this.loading = false;
      }
    );
  }

  viewServices(category: ServiceCategory) {
    this.router.navigate(['/admin/service-categories', category.customIdentifier, 'services']);
  }
  
  viewCategoryDetails(category: ServiceCategory) {
    // For now, we'll use a dialog to show the details since we haven't created a dedicated page yet
    const dialogRef = this.dialog.open(CategoryDetailsDialogComponent, {
      width: '700px',
      data: { category }
    });
  }
}
