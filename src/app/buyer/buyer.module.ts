import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BuyerRoutingModule } from './buyer-routing.module';
import { BuyerComponent } from './buyer/buyer.component';
import { BuyerDashboardComponentComponent } from './buyer-dashboard-component/buyer-dashboard-component.component';
import { BuyerPurchasesComponentComponent } from './buyer-purchases-component/buyer-purchases-component.component';
import { InputNumberModule } from 'primeng/inputnumber';
import { CartComponent } from './cart/cart.component';
import { CheckoutModalComponent } from './checkout-modal/checkout-modal.component';
import { ViewitemComponent } from './viewitem/viewitem.component';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CheckoutDialogComponent } from './checkout-dialog/checkout-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { BuyeritemsModule } from './buyeritems/buyeritems.module';
import { BrowserModule } from '@angular/platform-browser';
import { BuyeritemsRoutingModule } from './buyeritems/buyeritems-routing.module';
import { BuyerSearchComponent } from './buyer-search/buyer-search.component';
import { ComModule } from './com/com.module';
@NgModule({
  declarations: [
    BuyerComponent,
    BuyerDashboardComponentComponent,
    BuyerPurchasesComponentComponent,
    CartComponent,
    CheckoutModalComponent,
    ViewitemComponent,
    CheckoutDialogComponent,

  ],
  imports: [
    CommonModule,
    BuyerRoutingModule,
    InputNumberModule,
    MatIconModule,
    FormsModule,
    MatFormFieldModule,
    MatDialogModule,
    ToastModule,
     ButtonModule,
     BuyeritemsModule,
     ComModule
  ],
  providers: [MessageService],
  

})
export class BuyerModule { }
