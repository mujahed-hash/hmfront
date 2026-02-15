import { Component, OnInit, OnDestroy } from '@angular/core';
import { AllService } from '../services/all.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  token: any;
  user: any;
  private destroy$ = new Subject<void>();

  constructor(private apiService: AllService, private location: Location,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.token = localStorage.getItem('token'); // Get the token from localStorage
    this.userProfile()
  }
  goBack() {
    this.location.back()
  }
  userProfile() {
    this.apiService.getUserProfile(this.token).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.user = data.user;
      },
      error: (error) => {
        console.error('Failed to load profile:', error);
        this.snackBar.open('Failed to load profile. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }
  ngOnDestroy(): void {
    // Notify all subscriptions to complete
    this.destroy$.next();
    this.destroy$.complete();

  }
}
