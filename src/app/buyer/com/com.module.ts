import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuyerSearchComponent } from '../buyer-search/buyer-search.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [
    BuyerSearchComponent

  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule
  ],
  exports:[    BuyerSearchComponent  ]
})
export class ComModule { }
