import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AEUserComponent } from './aeuser/aeuser.component';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { GetcategoriesComponent } from './getcategories/getcategories.component';
import { PEcategoriesComponent } from './pecategories/pecategories.component';
import { UsersrequestsComponent } from './usersrequests/usersrequests.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'dashboard', component: AdminComponent },
  { path: 'home', component: AdminComponent },
  {path:'adduser', component:AEUserComponent},
  {path:'secret/signupAz', component:AEUserComponent},

  {path:'aeuser/:customIdentifer', component:AEUserComponent},
  {path:'', loadChildren:()=> import('./orders/orders.module').then(m=>m.OrdersModule), canActivate: [AuthGuard, RoleGuard], data: { role: 'admin' }},
  { path: '', loadChildren: () => import('./users/users.module').then(m => m.UsersModule), canActivate: [AuthGuard, RoleGuard], data: { role: 'admin' } },
  { path: '', loadChildren: () => import('./req-admin/req-admin.module').then(m => m.ReqAdminModule), canActivate: [AuthGuard, RoleGuard], data: { role: 'admin' } },

  {path:'categories', component:GetcategoriesComponent},
  {path:'add-category', component:PEcategoriesComponent},
  {path:'get-category', component:PEcategoriesComponent},
  {path:'all-reqs-by-users', component:UsersrequestsComponent}
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
