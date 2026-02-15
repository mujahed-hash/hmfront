import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RequirementsRoutingModule } from './requirements-routing.module';
import { RequirementsComponent } from './requirements/requirements.component';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BuyerReqsComponent } from './buyer-reqs/buyer-reqs.component';
import {MatDialogModule} from '@angular/material/dialog'; 
import {MatFormFieldModule} from '@angular/material/form-field'; 
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner'; 
@NgModule({
  declarations: [
    RequirementsComponent,
    BuyerReqsComponent
  ],
  imports: [
    CommonModule,
    RequirementsRoutingModule,
    DialogModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatProgressSpinnerModule
  ]
})
export class RequirementsModule { }
