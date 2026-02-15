import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';

import { ServiceOrdersRoutingModule } from './service-orders-routing.module';
import { AllServiceOrdersComponent } from './all-service-orders/all-service-orders.component';
import { ServiceOrderComponent } from './service-order/service-order.component';
import { SharedModule } from 'src/app/shared/shared.module'; // Import SharedModule

@NgModule({
  declarations: [
    AllServiceOrdersComponent,
    ServiceOrderComponent
  ],
  imports: [
    CommonModule,
    // FormsModule, // Now provided by SharedModule
    // ReactiveFormsModule, // Now provided by SharedModule
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    ServiceOrdersRoutingModule,
    SharedModule // Import SharedModule here
  ]
})
export class ServiceOrdersModule { }
