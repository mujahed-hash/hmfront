import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing.module';
import { VieworderASComponent } from './vieworder-as/vieworder-as.component';
import { VieworderBuyerComponent } from './vieworder-buyer/vieworder-buyer.component';
import { SiupComponent } from './siup/siup.component';
import { NotifiComponent } from './notifi/notifi.component';


@NgModule({
  declarations: [
    VieworderASComponent,
    VieworderBuyerComponent,
    SiupComponent,
    NotifiComponent
  ],
  imports: [
    CommonModule,
    SharedRoutingModule
  ]
})
export class SharedModule { }
