import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReqAdminComponent } from './req-admin/req-admin.component';
import { AdminProdSubComponent } from './admin-prod-sub/admin-prod-sub.component';
import { AdminDelReqsComponent } from './admin-del-reqs/admin-del-reqs.component';
import { AdminDeliveriesComponent } from './admin-deliveries/admin-deliveries.component';

const routes: Routes = [
  {path:'admin-requirements', component:ReqAdminComponent},
  {path:'submitted-prod-info', component:AdminProdSubComponent},
  {path:'deliveries-reqs', component:AdminDelReqsComponent},
  {path:'admin-deliveries', component:AdminDeliveriesComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReqAdminRoutingModule { }
