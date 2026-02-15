import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowseCategoriesComponent } from './browse-categories.component';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router'; // Import RouterModule

@NgModule({
  declarations: [
    BrowseCategoriesComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    RouterModule // Add RouterModule here
  ],
  exports: [
    BrowseCategoriesComponent
  ]
})
export class BrowseCategoriesModule { }
