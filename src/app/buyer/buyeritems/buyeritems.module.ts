import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BuyeritemsRoutingModule } from './buyeritems-routing.module';
import { BuyeritemsComponent } from './buyeritems.component';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { BuyerSearchComponent } from '../buyer-search/buyer-search.component';
import { ComModule } from '../com/com.module';
import { AnimateOnScrollModule } from 'primeng/animateonscroll';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    BuyeritemsComponent,
  ],
  imports: [
    CommonModule,
    BuyeritemsRoutingModule,
    InputNumberModule,
    FormsModule,
    MatIconModule,
    ToastModule,
     ButtonModule,
     ComModule,
     AnimateOnScrollModule,

  ],
  providers: [MessageService],
  exports:[BuyeritemsComponent],


})
export class BuyeritemsModule { }
