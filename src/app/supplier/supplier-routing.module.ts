import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SupplierOrdersComponentComponent } from './more/supplier-orders-component/supplier-orders-component.component';
import { SupplierComponent } from './supplier/supplier.component';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
const routes: Routes = [
  {path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: SupplierComponent },
  { path: 'orders', component: SupplierOrdersComponentComponent },
  { path: '', loadChildren: () => import('./more/more.module').then(m => m.MoreModule), canActivate: [AuthGuard, RoleGuard], data: { role: 'supplier' } },
  { path: '', loadChildren: () => import('./req-sup/req-sup.module').then(m => m.ReqSupModule), canActivate: [AuthGuard, RoleGuard], data: { role: 'supplier' } },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SupplierRoutingModule { }
