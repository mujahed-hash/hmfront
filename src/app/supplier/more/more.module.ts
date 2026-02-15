import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MoreRoutingModule } from './more-routing.module';
import { OrderdeliveredComponent } from './orderdelivered/orderdelivered.component';
import { OrdereditComponent } from './orderedit/orderedit.component';
import { ProduceditComponent } from './producedit/producedit.component';
import { AllitemsComponent } from './allitems/allitems.component';
import { SupplierOrdersComponentComponent } from './supplier-orders-component/supplier-orders-component.component';
import { SellComponent } from './sell/sell.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NavigationService } from 'src/app/navigation.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ItemComponent } from './item/item.component';

import {DropdownModule} from 'primeng/dropdown';


import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatButtonModule} from '@angular/material/button';
import {MatBadgeModule} from '@angular/material/badge';
import { SupplierapproveComponent } from '../supplierapprove/supplierapprove.component';
import { OrderdekiveredComponent } from './orderdekivered/orderdekivered.component';
import { OrdercancelledComponent } from './ordercancelled/ordercancelled.component';
import { MatIconModule } from '@angular/material/icon';
import { SupplysearchComponent } from '../supplysearch/supplysearch.component';
import { SharedModule } from '../../shared/shared.module';
@NgModule({
  declarations: [
    OrderdeliveredComponent,
    OrdereditComponent,
    ProduceditComponent,
    AllitemsComponent,
    SupplierOrdersComponentComponent,
    SellComponent,
    ItemComponent,
    SupplierapproveComponent,
    OrderdekiveredComponent,
    OrdercancelledComponent,
   SupplysearchComponent

  ],
  imports: [
    CommonModule,
    MoreRoutingModule,
    ScrollingModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatBadgeModule,
    MatIconModule,
    SharedModule
  ],
  providers: [NavigationService],

})
export class MoreModule { }
