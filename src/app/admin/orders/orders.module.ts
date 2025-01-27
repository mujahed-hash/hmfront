import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrdersRoutingModule } from './orders-routing.module';
import { AllordersComponent } from './allorders/allorders.component';
import { OrderComponent } from './order/order.component';


@NgModule({
  declarations: [
    AllordersComponent,
    OrderComponent
  ],
  imports: [
    CommonModule,
    OrdersRoutingModule
  ]
})
export class OrdersModule { }
