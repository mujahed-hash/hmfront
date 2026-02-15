import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllServicesComponent } from './all-services.component';
import { ServiceDetailComponent } from './service-detail/service-detail.component';

const routes: Routes = [
  { path: '', component: AllServicesComponent },
  { path: ':customIdentifier', component: ServiceDetailComponent } // Dedicated service detail component
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AllServicesRoutingModule { }
