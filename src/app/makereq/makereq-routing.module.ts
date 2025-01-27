import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MakereqComponent } from './makereq/makereq.component';

const routes: Routes = [
{path:'create-req', component:MakereqComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MakereqRoutingModule { }
