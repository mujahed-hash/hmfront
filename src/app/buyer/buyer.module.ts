import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BuyerRoutingModule } from './buyer-routing.module';
import { BuyerComponent } from './buyer/buyer.component';
import { BuyerDashboardComponentComponent } from './buyer-dashboard-component/buyer-dashboard-component.component';
import { BuyerPurchasesComponentComponent } from './buyer-purchases-component/buyer-purchases-component.component';
import { InputNumberModule } from 'primeng/inputnumber';
import { CartComponent } from './cart/cart.component';
import { CheckoutModalComponent } from './checkout-modal/checkout-modal.component';
import { ViewitemComponent } from './viewitem/viewitem.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CheckoutDialogComponent } from './checkout-dialog/checkout-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { BuyeritemsModule } from './buyeritems/buyeritems.module';
import { MessageService } from 'primeng/api';
import { BrowseCategoriesModule } from './browse-categories/browse-categories.module';

@NgModule({
  declarations: [
    BuyerComponent,
    BuyerDashboardComponentComponent,
    BuyerPurchasesComponentComponent,
    CartComponent,
    CheckoutModalComponent,
    ViewitemComponent,
    CheckoutDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    BuyerRoutingModule,
    InputNumberModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ToastModule,
    ButtonModule,
    BuyeritemsModule,
    BrowseCategoriesModule
  ],
  providers: [MessageService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BuyerModule { }
