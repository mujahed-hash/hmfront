import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AllService } from 'src/app/services/all.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-post-sup-req',
  templateUrl: './post-sup-req.component.html',
  styleUrls: ['./post-sup-req.component.scss']
})
export class PostSupReqComponent {
  requirement: any;
  name: string = '';
  price: number = 0;
  selectedFile: File | null = null;
  hasPosted: boolean = false;
  token:any;
  customIdentifier:any;
  imagePreview: string | ArrayBuffer | null = null;
  SubmittedProd:any;
  private destroy$ = new Subject<void>();

  constructor(private route: ActivatedRoute, private requirementService: AllService) { }

  ngOnInit() {
    this.token = localStorage.getItem('token')

    this.customIdentifier = this.route.snapshot.params['customIdentifier'];
this.getReq();
  }
getReq(){
  this.customIdentifier = this.route.snapshot.params['customIdentifier'];

    console.log(this.customIdentifier); // Log after the identifier is set

    if (this.customIdentifier) {
        this.requirementService.getRequirementByCustomIdentifier(this.customIdentifier, this.token).pipe(takeUntil(this.destroy$)).subscribe(response => {
            this.requirement = response;
            console.log(response);
            this.SubmittedProd = response.productSubmission

            // Check if the supplier has already posted product info
            // this.hasPosted = this.requirement.productDetails.some((detail: any) => detail.supplier === this.requirement.supplierId);
        });
    }
}
  onFileChange(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }
  isFormValid(): boolean {
    return !!this.name && !!this.price && !!this.selectedFile;
  }
  postProductInfo() {
    if (this.selectedFile) {
      this.requirementService.postProductInfo(this.requirement._id, this.name, this.price, this.selectedFile,this.token)
      .pipe(takeUntil(this.destroy$)).subscribe(response => {
          console.log(response.message);
          this.getReq();
          this.hasPosted = true; // Set posted status to true
        });
    } else {
      console.log('No file selected.');
    }
  }
  ngOnDestroy(): void {
    // Notify all subscriptions to complete
    this.destroy$.next();
    this.destroy$.complete();
  
  }
}
