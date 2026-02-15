import { Component, TemplateRef, ViewChild } from '@angular/core';
import { AllService } from 'src/app/services/all.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-requirements',
  templateUrl: './requirements.component.html',
  styleUrls: ['./requirements.component.scss']
})
export class RequirementsComponent {
  title: string = '';
  reqDetails: string = '';
  visible: boolean = false;
  token:any;
  requirements:any[] = [];
  notifications:any;
  dialogRef!: MatDialogRef<any>; // Store reference to the open dialog
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>; // Reference to the dialog template

  start = 0;
  limit = 10;
  isLoading = false;
  hasMoreRequirements = true;
  totalRequirements = 0;

private destroy$ = new Subject<void>();


  constructor(public dialog: MatDialog,private requirementService: AllService) {}
  ngOnInit(){
    this.token = localStorage.getItem('token');
    this.loadRequirements();
    // this.getNotifications();
  }
  // Function to show the dialog
  showDialog(): void {
    this.visible = true;
    console.log('clikced')
  }


  // Open the dialog and store its reference
  openPostDialog(): void {
    this.dialogRef = this.dialog.open(this.dialogTemplate, {
      width: '400px',
      maxWidth: '90vw', // Make it responsive
    });

    // Handle the dialog closure and capture the result
    this.dialogRef.afterClosed().pipe(takeUntil(this.destroy$))
.subscribe((result) => {
      if (result) {
        this.reqDetails = result;
        this.postRequirement(); // Call the function to post the requirement
        this.requirements = []; // Reset requirements array
        this.start = 0; // Reset pagination
        this.hasMoreRequirements = true; // Reset hasMore flag
        this.loadRequirements(); // Reload requirements from start
      }
    });
  }

  // Close the dialog and pass optional data
  closeDialog(data: string | null = null): void {
    this.dialogRef.close(data); // Use MatDialogRef to close the dialog
    this.requirements = []; // Reset requirements array
    this.start = 0; // Reset pagination
    this.hasMoreRequirements = true; // Reset hasMore flag
    this.loadRequirements(); // Reload requirements from start
  }

  // Function to post the requirement
  postRequirement(): void {
    console.log(this.reqDetails)
    if (this.token && this.reqDetails) {
      this.requirementService.postRequirement(this.reqDetails, this.token).pipe(takeUntil(this.destroy$))
.subscribe(
        (response) => {
          console.log('Requirement posted successfully:', response);
          // Reset the form
          this.reqDetails = '';
          this.requirements = []; // Reset requirements array
          this.start = 0; // Reset pagination
          this.hasMoreRequirements = true; // Reset hasMore flag
          this.loadRequirements(); // Reload requirements from start
          this.visible = false; // Close the dialog after posting
        },
        (error) => {
          console.error('Error posting requirement:', error);
        }
      );
    }
  }
  
  // // Close the dialog with or without data
  // closeDialog(data: any = null): void {
  //   this.dialogRef.close(data); // Close the dialog and pass the data if any
  // }
  loadRequirements(): void {
    if (this.isLoading || !this.hasMoreRequirements) return;

    this.isLoading = true;
    this.requirementService.getRequirements(this.token, this.start, this.limit).pipe(takeUntil(this.destroy$))
    .subscribe((data:any) => {
      console.log(data);
      this.isLoading = false;

      if (data && Array.isArray(data.requirements)) {
        this.requirements = [...this.requirements, ...data.requirements];
        this.totalRequirements = data.totalRequirements;
        this.start += this.limit;

        // If fewer requirements are returned than the limit, no more requirements are available
        this.hasMoreRequirements = data.requirements.length === this.limit;
      } else {
        console.error('Unexpected response structure:', data);
      }
    },
    (error) => {
      this.isLoading = false;
      console.error('Error loading requirements:', error);
    });
  }


  
  selectProduct(requirementId: string, productId: string): void {
    // Handle product selection and request admin to deliver the product
    this.requirementService.selectProductForDelivery(requirementId,productId, this.token).pipe(takeUntil(this.destroy$))
.subscribe(response => {
      console.log('Product info forwarded to admin:', response);
    });
  }

  getNotifications(): void {
    this.requirementService.getNotifications('buyerId', this.token).pipe(takeUntil(this.destroy$))
.subscribe(data => {
      this.notifications = data;
    });
  }
  
  ngOnDestroy(): void {
    // Notify all subscriptions to complete
    this.destroy$.next();
    this.destroy$.complete();
  
  }
}
