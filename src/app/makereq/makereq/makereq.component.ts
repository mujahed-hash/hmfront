import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AllService } from 'src/app/services/all.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-makereq',
  templateUrl: './makereq.component.html',
  styleUrls: ['./makereq.component.scss']
})
export class MakereqComponent {
  requestForm!: FormGroup; // Define the form group
  token:any;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder, // Form builder to create the form
    private requestService: AllService // Service to make the API call
  ) {}

  ngOnInit(): void {
    this.token = localStorage.getItem('token');

    // Initialize the form with validation for the note field
    this.requestForm = this.fb.group({
      note: ['', [Validators.required, Validators.maxLength(500)]] // Only the note field with validation
    });
  }

  // Method to handle form submission
  onSubmit(): void {
    if (this.requestForm.valid) {
      const note = this.requestForm.value.note;

      // Call the service to submit the request
      this.requestService.Makerequest(note, this.token).pipe(takeUntil(this.destroy$)).subscribe(response => {
        console.log('Request submitted successfully', response);
        this.requestForm.reset();
        // Handle success (e.g., display success message)
      }, error => {
        console.error('Error submitting request', error);
        // Handle error (e.g., display error message)
      });
    } else {
      console.log('Form is invalid');
    }
  }
  ngOnDestroy(): void {
    // Notify all subscriptions to complete
    this.destroy$.next();
    this.destroy$.complete();
  
  }
}
