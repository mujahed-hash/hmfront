import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupplierServiceOrderComponent } from './supplier-service-order.component';
import { SupplierServiceOrdersRoutingModule } from './supplier-service-orders-routing.module';

@NgModule({
  declarations: [SupplierServiceOrderComponent],
  imports: [
    CommonModule,
    FormsModule,
    SupplierServiceOrdersRoutingModule
  ]
})
export class SupplierServiceOrdersModule { }
