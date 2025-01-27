import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SupplierRoutingModule } from './supplier-routing.module';
import { SupplierComponent } from './supplier/supplier.component';
import { SupplierOrdersComponentComponent } from './more/supplier-orders-component/supplier-orders-component.component';
import { NavigationService } from '../navigation.service';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    SupplierComponent,
    
  ],
  imports: [
    CommonModule,
    SupplierRoutingModule,
    FormsModule
  ],
  providers: [NavigationService],

})
export class SupplierModule { }
