import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { SuperadminRoutingModule } from './superadmin-routing.module';
import { SuperadminDashboardComponent } from './superadmin-dashboard/superadmin-dashboard.component';
import { PasswordManagerComponent } from './password-manager/password-manager.component';
import { SuperadminService } from './superadmin.service';
import { TestComponent } from './test/test.component';

@NgModule({
  declarations: [
    SuperadminDashboardComponent,
    PasswordManagerComponent,
    TestComponent
  ],
  imports: [
    CommonModule,
    SuperadminRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatCardModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  providers: [SuperadminService]
})
export class SuperadminModule { }