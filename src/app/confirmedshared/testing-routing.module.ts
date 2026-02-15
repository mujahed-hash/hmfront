import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TestingComponent } from './testing.component';
import { NotifiComponent } from '../shared/notifi/notifi.component';
import { VieworderASComponent } from '../shared/vieworder-as/vieworder-as.component';
import { SiupComponent } from '../shared/siup/siup.component';

const routes: Routes = [
  { path: 'notifications', component: NotifiComponent },
  {path:'view-order/:customIdentifier', component:VieworderASComponent },
  {path:'signup/secretly', component:SiupComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TestingRoutingModule { }
