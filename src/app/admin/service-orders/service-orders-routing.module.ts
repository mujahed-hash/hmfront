import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllServiceOrdersComponent } from './all-service-orders/all-service-orders.component';
import { ServiceOrderComponent } from './service-order/service-order.component';

const routes: Routes = [
  { path: 'all', component: AllServiceOrdersComponent },
  { path: ':customIdentifier', component: ServiceOrderComponent },
  { path: '', redirectTo: 'all', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServiceOrdersRoutingModule { }
