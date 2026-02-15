import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServiceListComponent } from './service-list/service-list.component';
import { ServiceCreateComponent } from './service-create/service-create.component';
import { ServiceDetailComponent } from './service-detail/service-detail.component';
import { NetworkGuard } from '../shared/guards/network.guard';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'list',
    component: ServiceListComponent,
    canActivate: [NetworkGuard, AuthGuard], // All authenticated users can list services
    data: { animation: 'fadingPage' }
  },
  {
    path: 'my-services',
    component: ServiceListComponent,
    canActivate: [NetworkGuard, AuthGuard],
    data: { animation: 'fadingPage', isMyServicesView: true }
  },
  {
    path: 'create',
    component: ServiceCreateComponent,
    canActivate: [NetworkGuard], // Added AuthGuard and RoleGuard
    data: { role: ['isSupplier', 'isAdmin', 'isSuperAdmin'], animation: 'fadingPage' }
  },
  {
    path: ':customIdentifier',
    component: ServiceDetailComponent,
    canActivate: [NetworkGuard, AuthGuard], // All authenticated users can view, owner/admin can edit
    data: { animation: 'fadingPage' }
  },
  {
    path: ':customIdentifier/edit',
    component: ServiceCreateComponent,
    canActivate: [NetworkGuard, AuthGuard, RoleGuard],
    data: { role: ['isSupplier', 'isAdmin', 'isSuperAdmin'], animation: 'fadingPage', editMode: true }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServicesRoutingModule { }






