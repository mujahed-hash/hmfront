import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReqSupRoutingModule } from './req-sup-routing.module';
import { ReqSupComponent } from './req-sup/req-sup.component';
import { PostSupReqComponent } from './post-sup-req/post-sup-req.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SupReqDelComponent } from './sup-req-del/sup-req-del.component';


@NgModule({
  declarations: [
    ReqSupComponent,
    PostSupReqComponent,
    SupReqDelComponent
  ],
  imports: [
    CommonModule,
    ReqSupRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ReqSupModule { }
