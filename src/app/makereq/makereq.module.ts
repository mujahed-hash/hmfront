import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MakereqRoutingModule } from './makereq-routing.module';
import { MakereqComponent } from './makereq/makereq.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    MakereqComponent
  ],
  imports: [
    CommonModule,
    MakereqRoutingModule,
    ReactiveFormsModule,
    
  ]
})
export class MakereqModule { }
