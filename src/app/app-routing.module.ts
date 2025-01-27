import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { LoginComponent } from './auth/login/login.component';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { SignupComponent } from './auth/signup/signup.component';
import { AEUserComponent } from './admin/aeuser/aeuser.component';
import { ProfileComponent } from './profile/profile.component';
const routes: Routes = [
  { path: 'login', component: LoginComponent},
    { path: 'supplier', loadChildren: () => import('./supplier/supplier.module').then(m => m.SupplierModule), canActivate: [AuthGuard, RoleGuard], data: { role: 'supplier' } },
  { path: 'buyer', loadChildren: () => import('./buyer/buyer.module').then(m => m.BuyerModule), canActivate: [AuthGuard, RoleGuard], data: { role: 'buyer' } },
  { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule), canActivate: [AuthGuard, RoleGuard], data: { role: 'admin' } },
  {path:'s', loadChildren:()=>import('./shared/shared.module').then(m=>m.SharedModule)},
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard]},
  {path:'profile', component:ProfileComponent },
  { path: 'make', loadChildren: () => import('./makereq/makereq.module').then(m => m.MakereqModule)},

  {path:'',redirectTo:'home', pathMatch:'full'},

  { path: '**', redirectTo: 'home' }, // Fallback for unknown paths

   // Default route for logged-in users
  // { path: '**', redirectTo: 'home' , canActivate: [AuthGuard]} // Redirect to home for any unknown routes
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{ scrollPositionRestoration: 'enabled' , useHash:true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
