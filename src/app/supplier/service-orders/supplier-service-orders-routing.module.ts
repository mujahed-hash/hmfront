import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SupplierServiceOrderComponent } from './supplier-service-order.component';

const routes: Routes = [
  { path: ':customIdentifier', component: SupplierServiceOrderComponent },
  { path: '', redirectTo: '/supplier/orders', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SupplierServiceOrdersRoutingModule { }
