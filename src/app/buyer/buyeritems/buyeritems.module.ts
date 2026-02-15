import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BuyeritemsRoutingModule } from './buyeritems-routing.module';
import { BuyeritemsComponent } from './buyeritems.component';
import { InputNumberModule } from 'primeng/inputnumber';
import { MatIconModule } from '@angular/material/icon';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { BuyerSearchComponent } from '../buyer-search/buyer-search.component';
import { AnimateOnScrollModule } from 'primeng/animateonscroll';
import { MarketplaceFilterComponent } from '../marketplace-filter/marketplace-filter.component';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowseCategoriesModule } from '../browse-categories/browse-categories.module';

@NgModule({
  declarations: [
    BuyeritemsComponent,
    BuyerSearchComponent,
    MarketplaceFilterComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    BuyeritemsRoutingModule,
    InputNumberModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    ToastModule,
    ButtonModule,
    AnimateOnScrollModule,
    BrowseCategoriesModule
  ],
  providers: [MessageService],
  exports: [BuyeritemsComponent, BuyerSearchComponent, MarketplaceFilterComponent]
})
export class BuyeritemsModule { }
