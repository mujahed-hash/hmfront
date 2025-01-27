import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VieworderASComponent } from './vieworder-as/vieworder-as.component';
import { SiupComponent } from './siup/siup.component';
import { NotifiComponent } from './notifi/notifi.component';

const routes: Routes = [
  {path:'view-order/:customIdentifier', component:VieworderASComponent },
  {path:'signup/secretly', component:SiupComponent},
  {path:'notifications', component:NotifiComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SharedRoutingModule { }
