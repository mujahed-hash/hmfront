import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ServiceCategory } from '../../../services/service-category.service';

@Component({
  selector: 'app-category-details-dialog',
  templateUrl: './category-details-dialog.component.html',
  styleUrls: ['./category-details-dialog.component.scss']
})
export class CategoryDetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CategoryDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { category: ServiceCategory }
  ) { }

  close(): void {
    this.dialogRef.close();
  }
  
  // Format date for display
  formatDate(date: string | Date): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  }
}
