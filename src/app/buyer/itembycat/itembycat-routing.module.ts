import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ItembycategoryComponent } from './itembycategory/itembycategory.component';

const routes: Routes = [
  {path:'item/:customIdentifer', component:ItembycategoryComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ItembycatRoutingModule { }
