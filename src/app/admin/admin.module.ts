import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminComponent } from './admin/admin.component';
import { AEUserComponent } from './aeuser/aeuser.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationService } from '../navigation.service';
import { GetcategoriesComponent } from './getcategories/getcategories.component';
import { PEcategoriesComponent } from './pecategories/pecategories.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UsersrequestsComponent } from './usersrequests/usersrequests.component';
import { ServerMonitorComponent } from './server-monitor/server-monitor.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    DashboardComponent,
    AdminComponent,
    AEUserComponent,
    GetcategoriesComponent,
    PEcategoriesComponent,
    UsersrequestsComponent,
    ServerMonitorComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatProgressBarModule,
    MatProgressSpinnerModule
  ],
  exports: [AEUserComponent],
  providers: [NavigationService],

})
export class AdminModule { }
