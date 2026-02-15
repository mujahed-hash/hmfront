import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ServicesRoutingModule } from './services-routing.module';
import { ServiceListComponent } from './service-list/service-list.component';
import { ServiceCreateComponent } from './service-create/service-create.component';
import { ServiceDetailComponent } from './service-detail/service-detail.component';
import { AngularmaterialModule } from '../angularmaterial/angularmaterial.module'; // Import Angular Material Module
import { ServiceService } from './service.service'; // Import ServiceService
import { SharedModule } from '../shared/shared.module';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Import MatProgressSpinnerModule
import { MatChipsModule } from '@angular/material/chips'; // Import MatChipsModule for service category chips

@NgModule({
  declarations: [
    ServiceListComponent,
    ServiceCreateComponent,
    ServiceDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ServicesRoutingModule,
    AngularmaterialModule,
    SharedModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatProgressSpinnerModule, // Add MatProgressSpinnerModule here
    MatChipsModule // Add MatChipsModule for service category chips
  ],
  providers: [ServiceService] // Explicitly provide ServiceService
})
export class ServicesModule { }
