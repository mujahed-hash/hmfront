import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllitemsComponent } from './allitems/allitems.component';
import { OrderdeliveredComponent } from './orderdelivered/orderdelivered.component';
import { SupplierOrdersComponentComponent } from './supplier-orders-component/supplier-orders-component.component';
import { SellComponent } from './sell/sell.component';
import { ProduceditComponent } from './producedit/producedit.component';
import { ItemComponent } from './item/item.component';
import { SupplierapproveComponent } from '../supplierapprove/supplierapprove.component';
import { OrdercancelledComponent } from './ordercancelled/ordercancelled.component';

const routes: Routes = [
  {path:'allitems', component:AllitemsComponent},
  {path:'orders-delivered', component:OrderdeliveredComponent},
  {path:'orders-recieved', component: SupplierOrdersComponentComponent},
  {path:'orders-approved', component: SupplierapproveComponent},
  // {path:'orders-delivered', component: OrderdeliveredComponent},
  {path:'orders-cancelled', component: OrdercancelledComponent},

  {path: 'sell', component:SellComponent},
  // { path: 'product/:customIdentifier', component: ProduceditComponent },
    { path: 'product/edit/:customIdentifier', component: ProduceditComponent },
    { path: 'product/view/:customIdentifier', component: ItemComponent },
    { path: 'product/add', component: ProduceditComponent },

    {path:'orders-delivered/:status', component:OrderdeliveredComponent},
    {path:'orders-recieved/:status', component: SupplierOrdersComponentComponent},
    {path:'orders-approved/:status', component: SupplierapproveComponent},
    {path:'orders-pending/:status', component: SupplierOrdersComponentComponent},
    {path:'orders-cancelled/:status', component: OrdercancelledComponent},
  

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MoreRoutingModule { }
