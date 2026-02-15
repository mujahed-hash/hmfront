import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SupplierRoutingModule } from './supplier-routing.module';
import { SupplierComponent } from './supplier/supplier.component';
import { SupplierOrdersComponentComponent } from './more/supplier-orders-component/supplier-orders-component.component';
import { NavigationService } from '../navigation.service';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { SupplierServiceOrdersModule } from './service-orders/supplier-service-orders.module';


@NgModule({
  declarations: [
    SupplierComponent,
    
  ],
  imports: [
    CommonModule,
    SupplierRoutingModule,
    FormsModule,
    SharedModule,
    SupplierServiceOrdersModule
  ],
  providers: [NavigationService],

})
export class SupplierModule { }
