import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

// Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field'; // Import MatFormFieldModule

import { AllServicesRoutingModule } from './all-services-routing.module';
import { AllServicesComponent } from './all-services.component';
import { ServiceDetailComponent } from './service-detail/service-detail.component';
import { OrderDialogComponent } from './order-dialog/order-dialog.component';
import { AlertComponent } from './alert/alert.component';
import { MatInputModule } from '@angular/material/input';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    AllServicesComponent,
    ServiceDetailComponent,
    OrderDialogComponent,
    AlertComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatDialogModule,
    MatCheckboxModule,
    MatDividerModule,
    MatSnackBarModule,
    MatFormFieldModule, // Add MatFormFieldModule here
    MatInputModule,
    SharedModule,
    AllServicesRoutingModule,
  ]
})
export class AllServicesModule { }
