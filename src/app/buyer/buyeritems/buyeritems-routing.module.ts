import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BuyeritemsComponent } from './buyeritems.component';

const routes: Routes = [
  {path:'marketplace', component:BuyeritemsComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BuyeritemsRoutingModule { }
