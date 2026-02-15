import { CUSTOM_ELEMENTS_SCHEMA, NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { HttpClientModule } from '@angular/common/http';
import { JwtModule } from '@auth0/angular-jwt';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularmaterialModule } from './angularmaterial/angularmaterial.module';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NavigationService } from './navigation.service';
import { MessageService } from 'primeng/api';
import { ProfileComponent } from './profile/profile.component';
import { BuyeritemsModule } from './buyer/buyeritems/buyeritems.module';
import { NotificationService } from './notification.service';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { SharedService } from './shared/shared.service';
import { AllServicesModule } from './all-services/all-services.module';
import { UserServiceOrdersComponent } from './profile/user-service-orders/user-service-orders.component';
import { ServiceOrderConversationComponent } from './profile/service-order-conversation/service-order-conversation.component'; // Import AllServicesModule
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CustomStatusSelectorComponent } from './shared/custom-status-selector/custom-status-selector.component';
import { ServiceWorkerModule } from '@angular/service-worker';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    HomeComponent,
    SidebarComponent,
    ProfileComponent,
    UserServiceOrdersComponent,
    ServiceOrderConversationComponent,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: () => {
          return localStorage.getItem('token');
        },
      },
    }),
    FormsModule,
    MatBadgeModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    AngularmaterialModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    AllServicesModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }), // Add AllServicesModule here
 
  ],
  providers: [NavigationService, MessageService, NotificationService,SharedService],
  bootstrap: [AppComponent],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
