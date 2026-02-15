import { Component, Inject } from '@angular/core';
import { AdminService } from '../admin.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-pecategories',
  templateUrl: './pecategories.component.html',
  styleUrls: ['./pecategories.component.scss']
})
export class PEcategoriesComponent {
  private destroy$ = new Subject<void>();

  token: string | null;
  categoryForm: FormGroup;
  isEditing: boolean = false;
  imageDisplay: any[] = [];
  image: File[] = [];

  constructor(
    private userService: AdminService,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PEcategoriesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { itemType?: string; itemName?: string; image?: string; id?: string }
  ) {
    this.categoryForm = this.fb.group({
      itemType: [data.itemType || '', Validators.required],
      itemName: [''],
      image: [data.image ||'']
    });

    this.token = localStorage.getItem('token');
  }

  ngOnInit() {
    this.isEditing = !!this.data.id;
    if (this.isEditing) {
      this.categoryForm.patchValue({
        itemType: this.data.itemType,
        itemName: this.data.itemName,
        image: this.data.image
      });
      if (this.data.image) {
        this.imageDisplay = [this.data.image];
      }
    }
  }

  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length) {
      this.image = Array.from(event.target.files);
      this.imageDisplay = [];

      this.image.forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imageDisplay.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });

      this.categoryForm.patchValue({ image: this.image });
    }
  }

  onSubmit() {
    const categoryFormData = new FormData();
    Object.keys(this.categoryForm.controls).forEach(key => {
      if (key !== 'image') {
        categoryFormData.append(key, this.categoryForm.get(key)?.value);
      }
    });

    this.image.forEach(file => {
      categoryFormData.append('image', file, file.name);
    });

    if (this.categoryForm.valid) {
      if (this.isEditing) {
        this.updateCategory(categoryFormData);
        console.log(categoryFormData);

      } else {
        this.createCategory(categoryFormData);
      }
    }
  }

  updateCategory(categoryFormData: FormData) {
    if (this.token && this.data.id) {
      this.userService.updateCategory(this.data.id, categoryFormData, this.token).pipe(takeUntil(this.destroy$)).subscribe(
       ( data:any) => this.dialogRef.close(true),

      
        error => console.error('Error updating category', error)
      );
    }
  }

  createCategory(categoryFormData: FormData) {
    if (this.token) {
      this.userService.postCategory(categoryFormData, this.token).pipe(takeUntil(this.destroy$)).subscribe(
        () => this.dialogRef.close(true),
        error => console.error('Error creating category', error)
      );
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    // Notify all subscriptions to complete
    this.destroy$.next();
    this.destroy$.complete();
  
  }


}
