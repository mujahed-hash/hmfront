import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ServiceCategory, ServiceCategoryService } from '../../../services/service-category.service';

@Component({
  selector: 'app-service-category-form',
  templateUrl: './service-category-form.component.html',
  styleUrls: ['./service-category-form.component.scss']
})
export class ServiceCategoryFormComponent implements OnInit {
  categoryForm!: FormGroup;
  isEditMode = false;
  loading = false;
  imagePreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  categories: ServiceCategory[] = [];

  constructor(
    private fb: FormBuilder,
    private serviceCategoryService: ServiceCategoryService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<ServiceCategoryFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { category: ServiceCategory | undefined }
  ) { }

  ngOnInit(): void {
    this.isEditMode = !!this.data.category;
    
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      parentCategory: [''],
      sortOrder: [0, [Validators.min(0)]],
      isActive: [true]
    });
    
    this.loadCategories();
    
    if (this.isEditMode && this.data.category) {
      this.categoryForm.patchValue({
        name: this.data.category.name,
        description: this.data.category.description || '',
        parentCategory: this.data.category.parentCategory?._id || '',
        sortOrder: this.data.category.sortOrder || 0,
        isActive: this.data.category.isActive
      });
      
      this.imagePreview = this.data.category.image || null;
    }
  }

  loadCategories(): void {
    this.serviceCategoryService.getAllCategories().subscribe(
      (categories) => {
        // Remove current category from parent options to prevent circular reference
        if (this.isEditMode && this.data.category) {
          this.categories = categories.filter(c => c._id !== this.data.category?._id);
        } else {
          this.categories = categories;
        }
      },
      (error) => {
        console.error('Error loading service categories:', error);
        this.snackBar.open('Error loading parent category options', 'Close', { duration: 3000 });
      }
    );
  }

  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedFile = fileInput.files[0];
      
      // Preview the selected image
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  removeImage(): void {
    this.imagePreview = null;
    this.selectedFile = null;
    const fileInput = document.getElementById('categoryImage') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }
    
    this.loading = true;
    
    const formData = new FormData();
    formData.append('name', this.categoryForm.get('name')?.value);
    formData.append('description', this.categoryForm.get('description')?.value || '');
    formData.append('sortOrder', this.categoryForm.get('sortOrder')?.value);
    formData.append('isActive', this.categoryForm.get('isActive')?.value);
    
    // Handle parent category
    const parentCategory = this.categoryForm.get('parentCategory')?.value;
    if (parentCategory && parentCategory !== 'none' && parentCategory !== '') {
      formData.append('parentCategory', parentCategory);
    }
    // Don't add parentCategory to formData if it's empty or 'none'
    // The backend will treat missing field as null
    
    // Add image if selected
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }
    
    if (this.isEditMode && this.data.category) {
      // Update existing category
      this.serviceCategoryService.updateCategory(this.data.category.customIdentifier, formData).subscribe(
        () => {
          this.snackBar.open('Service category updated successfully', 'Close', { duration: 3000 });
          this.dialogRef.close('success');
        },
        (error) => {
          console.error('Error updating service category:', error);
          this.snackBar.open('Error updating service category', 'Close', { duration: 3000 });
          this.loading = false;
        }
      );
    } else {
      // Create new category
      this.serviceCategoryService.createCategory(formData).subscribe(
        () => {
          this.snackBar.open('Service category created successfully', 'Close', { duration: 3000 });
          this.dialogRef.close('success');
        },
        (error) => {
          console.error('Error creating service category:', error);
          this.snackBar.open('Error creating service category', 'Close', { duration: 3000 });
          this.loading = false;
        }
      );
    }
  }
}
