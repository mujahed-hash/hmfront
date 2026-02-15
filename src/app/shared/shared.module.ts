import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

// Material Modules
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Components
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { OfflineComponent } from './components/offline/offline.component';
import { NotifiComponent } from './notifi/notifi.component';
import { VieworderASComponent } from './vieworder-as/vieworder-as.component';
import { SharedService } from './shared.service';
import { VieworderBuyerComponent } from './vieworder-buyer/vieworder-buyer.component';
import { SiupComponent } from './siup/siup.component';
import { CustomCategorySelectorComponent } from './custom-category-selector/custom-category-selector.component';
import { CustomRegionsSelectorComponent } from './custom-regions-selector/custom-regions-selector.component';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserModule } from '@angular/platform-browser';
import { CustomStatusSelectorComponent } from './custom-status-selector/custom-status-selector.component';
import { CustomSelectComponent } from './custom-select/custom-select.component';
import { CustomDatepickerComponent } from './custom-datepicker/custom-datepicker.component';

@NgModule({
  declarations: [
    ConfirmDialogComponent,
    OfflineComponent,
    NotifiComponent,
    VieworderASComponent,
    VieworderBuyerComponent,
    SiupComponent,
    CustomCategorySelectorComponent,
    CustomRegionsSelectorComponent,
    CustomStatusSelectorComponent,
    CustomSelectComponent,
    CustomDatepickerComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    MatDialogModule,
    MatButtonModule,
    MatChipsModule,
    MatSnackBarModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  exports: [
    ConfirmDialogComponent,
    OfflineComponent,
    NotifiComponent,
    VieworderASComponent,
    VieworderBuyerComponent,
    SiupComponent,
    CustomCategorySelectorComponent,
    CustomRegionsSelectorComponent,
    CustomStatusSelectorComponent,
    CustomSelectComponent,
    CustomDatepickerComponent,
    CommonModule, // Re-adding CommonModule to exports
    RouterModule, // Re-adding RouterModule to exports
    FormsModule, // Export FormsModule
    ReactiveFormsModule, // Export ReactiveFormsModule
    MatDialogModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SharedModule { }