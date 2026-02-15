import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthStateService } from 'src/app/auth-state.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  errorMessage: string = ''; // Store the error message here

  loginForm: FormGroup;
  loggedIn: boolean = false;
  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private router: Router,
    private authStateService: AuthStateService,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3)]]
    });
  }
  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);

    }
  }
  //   login() {
  //     if (this.loginForm.valid) {
  //       const { email, password } = this.loginForm.value;
  //       this.authService.login(email, password).subscribe(
  //         response => {
  //           localStorage.setItem('token', response.token);
  //           this.router.navigate(['/home']);
  //           this.loggedIn = true;
  //         },
  //         error => {
  //           console.error('Login failed', error);
  //         }
  //       );
  //     }
  //   }
  login() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      const normalizedEmail = email.trim().toLowerCase();

      this.authService.login(normalizedEmail, password)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          response => {
            localStorage.setItem('token', response.token);
            this.router.navigate(['/home']);
            this.authStateService.notifyLogin(); // Notify all components
          },
          error => {
            if (error.status === 400) {
              this.errorMessage = 'Invalid email or password. Please try again.';
            } else if (error.status === 500) {
              this.errorMessage = 'An unexpected error occurred. Please try again later.';
            } else {
              this.errorMessage = 'Login failed. Please check your details and try again.';
            }
          }
        );
    } else {
      this.loginForm.markAllAsTouched();
      this.errorMessage = 'Please fill in all required fields.';
    }
  }


  ngOnDestroy(): void {
    // Notify all subscriptions to complete
    this.destroy$.next();
    this.destroy$.complete();

  }


  navigateToWhatsApp(): void {
    const phoneNumber = '+917095008786';
    const message = 'Hello, I need assistance with HotelMart App.';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }
}
