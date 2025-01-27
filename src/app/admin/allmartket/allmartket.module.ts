import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AllmartketRoutingModule } from './allmartket-routing.module';
import { ViewEditItemComponent } from './view-edit-item/view-edit-item.component';


@NgModule({
  declarations: [
    ViewEditItemComponent
  ],
  imports: [
    CommonModule,
    AllmartketRoutingModule
  ]
})
export class AllmartketModule { }
