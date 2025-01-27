import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RequirementsComponent } from './requirements/requirements.component';
import { BuyerReqsComponent } from './buyer-reqs/buyer-reqs.component';

const routes: Routes = [
  {path:'buyer-requirements', component:RequirementsComponent},
  {path:'request-requirement/:customIdentifier', component:BuyerReqsComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RequirementsRoutingModule { }
