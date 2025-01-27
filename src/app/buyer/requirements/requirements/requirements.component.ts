import { Component, TemplateRef, ViewChild } from '@angular/core';
import { AllService } from 'src/app/services/all.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';

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
  requirements:any;
  notifications:any;
  dialogRef!: MatDialogRef<any>; // Store reference to the open dialog
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>; // Reference to the dialog template

private destroy$ = new Subject<void>();


  constructor(public dialog: MatDialog,private requirementService: AllService) {}
  ngOnInit(){
    this.token = localStorage.getItem('token');
    this.getRequirements();
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
        this.getRequirements();
      }
    });
  }

  // Close the dialog and pass optional data
  closeDialog(data: string | null = null): void {
    this.dialogRef.close(data); // Use MatDialogRef to close the dialog
    this.getRequirements()
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
          this.getRequirements();
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
  getRequirements(): void {
    this.requirementService.getRequirements(this.token).pipe(takeUntil(this.destroy$))
.subscribe(data => {
      this.requirements = data;
      console.log(data)
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
