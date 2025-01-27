import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersRoutingModule } from './users-routing.module';
import { AllusersComponent } from './allusers/allusers.component';
import { AEUserComponent } from '../aeuser/aeuser.component';


@NgModule({
  declarations: [
    AllusersComponent
  ],
  imports: [
    CommonModule,
    UsersRoutingModule
  ],
})
export class UsersModule { }
