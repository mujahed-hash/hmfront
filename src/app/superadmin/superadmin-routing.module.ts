import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SuperadminDashboardComponent } from './superadmin-dashboard/superadmin-dashboard.component';
import { PasswordManagerComponent } from './password-manager/password-manager.component';
import { TestComponent } from './test/test.component';
import { AuthGuard } from '../guards/auth.guard';
import { SuperadminGuard } from './superadmin.guard';

const routes: Routes = [
  { path: '', redirectTo: 'test', pathMatch: 'full' },
  { path: 'test', component: TestComponent },
  { path: 'dashboard', component: SuperadminDashboardComponent, canActivate: [SuperadminGuard] },
  { path: 'password-manager', component: PasswordManagerComponent, canActivate: [SuperadminGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SuperadminRoutingModule { }