import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './home/home.component';
import { SignupComponent } from './auth/signup/signup.component';
import { ProfileComponent } from './profile/profile.component';
import { NetworkGuard } from './shared/guards/network.guard';
import { OfflineComponent } from './shared/components/offline/offline.component';
import { UserServiceOrdersComponent } from './profile/user-service-orders/user-service-orders.component'; // Import new components
import { ServiceOrderConversationComponent } from './profile/service-order-conversation/service-order-conversation.component'; // Import new components
import { ServiceListComponent } from './services/service-list/service-list.component'; // Import for admin services route
import { SidebarComponent } from './sidebar/sidebar.component';

const routes: Routes = [

  // Offline route - no guards needed
  {
    path: 'offline',
    component: OfflineComponent,
    data: { animation: 'fadingPage' }
  },
  // Auth routes - no guards needed
  {
    path: 'login',
    component: LoginComponent,
    data: { animation: 'fadingPage' }
  },
  {
    path: 'signup',
    component: SignupComponent,
    data: { animation: 'fadingPage' }
  },
  // Protected routes - need network and auth, wrapped in Sidebar layout
  {
    path: '',
    component: SidebarComponent,
    canActivate: [NetworkGuard, AuthGuard],
    children: [
      {
        path: 'supplier',
        loadChildren: () => import('./supplier/supplier.module').then(m => m.SupplierModule),
        canActivate: [RoleGuard],
        data: { role: 'supplier', animation: 'fadingPage' }
      },
      {
        path: 'buyer',
        loadChildren: () => import('./buyer/buyer.module').then(m => m.BuyerModule),
        canActivate: [RoleGuard],
        data: { role: 'buyer', animation: 'fadingPage' }
      },
      {
        path: 'admin',
        loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
        canActivate: [RoleGuard],
        data: { role: 'admin', animation: 'fadingPage' }
      },
      {
        path: 'superadmin',
        loadChildren: () => import('./superadmin/superadmin.module').then(m => m.SuperadminModule),
        canActivate: [RoleGuard],
        data: { role: 'superadmin', animation: 'fadingPage' }
      },
      {
        path: 'services',
        loadChildren: () => import('./services/services.module').then(m => m.ServicesModule),
        data: { animation: 'fadingPage' }
      },
      {
        path: 'home',
        component: HomeComponent,
        data: { animation: 'fadingPage' }
      },
      {
        path: 'profile',
        component: ProfileComponent,
        data: { animation: 'fadingPage' }
      },
      {
        path: 'my-service-orders',
        component: UserServiceOrdersComponent,
        data: { animation: 'fadingPage' }
      },
      {
        path: 'my-service-orders/:customIdentifier',
        component: ServiceOrderConversationComponent,
        data: { animation: 'fadingPage' }
      },
      {
        path: 'make',
        loadChildren: () => import('./makereq/makereq.module').then(m => m.MakereqModule),
        data: { animation: 'fadingPage' }
      },
      {
        path: 'admin/services',
        component: ServiceListComponent,
        canActivate: [RoleGuard],
        data: { role: ['isAdmin', 'isSuperAdmin'], animation: 'fadingPage', isAdminView: true }
      },
      {
        path: 'app-developer',
        loadChildren: () => import('./developer/developer.module').then(m => m.DeveloperModule),
        data: { animation: 'fadingPage' }
      },
      {
        path: 'settings',
        loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule),
        data: { animation: 'fadingPage' }
      },
      {
        path: 'see',
        loadChildren: () => import('./shared/shared.module').then(m => m.SharedModule),
        data: { animation: 'fadingPage' }
      },
      {
        path: 's',
        loadChildren: () => import('./confirmedshared/testing.module').then(m => m.TestingModule),
        data: { animation: 'fadingPage' }
      },
      {
        path: 'all-services',
        loadChildren: () => import('./all-services/all-services.module').then(m => m.AllServicesModule),
        data: { animation: 'fadingPage' }
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  },
  // Default routes
  {
    path: 'See',
    redirectTo: 'see',
    pathMatch: 'full'
  },

  // Catch-all route - must be last
  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      preloadingStrategy: PreloadAllModules
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
