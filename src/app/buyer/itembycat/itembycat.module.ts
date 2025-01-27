import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ItembycatRoutingModule } from './itembycat-routing.module';
import { ItembycategoryComponent } from './itembycategory/itembycategory.component';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { BuyerModule } from '../buyer.module';
import { BuyerSearchComponent } from '../buyer-search/buyer-search.component';
import { ComModule } from '../com/com.module';


@NgModule({
  declarations: [
    ItembycategoryComponent,
  ],
  imports: [
    CommonModule,
    ItembycatRoutingModule,
    FormsModule,
    MatIconModule,
    ToastModule,
     ButtonModule,
     InputNumberModule,
     ComModule
  ],

})
export class ItembycatModule { }
