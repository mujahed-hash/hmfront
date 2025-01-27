import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReqAdminRoutingModule } from './req-admin-routing.module';
import { ReqAdminComponent } from './req-admin/req-admin.component';
import { AdminProdSubComponent } from './admin-prod-sub/admin-prod-sub.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminDelReqsComponent } from './admin-del-reqs/admin-del-reqs.component';
import { AdminDeliveriesComponent } from './admin-deliveries/admin-deliveries.component';


@NgModule({
  declarations: [
    ReqAdminComponent,
    AdminProdSubComponent,
    AdminDelReqsComponent,
    AdminDeliveriesComponent
  ],
  imports: [
    CommonModule,
    ReqAdminRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ReqAdminModule { }
