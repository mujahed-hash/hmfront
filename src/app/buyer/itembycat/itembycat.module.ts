import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ItembycatRoutingModule } from './itembycat-routing.module';
import { ItembycategoryComponent } from './itembycategory/itembycategory.component';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { ComModule } from '../com/com.module';
import { BuyeritemsModule } from '../buyeritems/buyeritems.module';
import { BrowseCategoriesModule } from '../browse-categories/browse-categories.module';


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
     ComModule,
     BuyeritemsModule,
     BrowseCategoriesModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class ItembycatModule { }
