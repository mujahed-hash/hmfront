import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReqSupComponent } from './req-sup/req-sup.component';
import { PostSupReqComponent } from './post-sup-req/post-sup-req.component';
import { SupReqDelComponent } from './sup-req-del/sup-req-del.component';

const routes: Routes = [
  {path:'sup-requirements', component:ReqSupComponent},
  {path:'sup-requested/:customIdentifier', component:PostSupReqComponent},
  {path:'sup-deliveries', component:SupReqDelComponent},
  {path:'sup-delivery-detail/:id', component:PostSupReqComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReqSupRoutingModule { }
