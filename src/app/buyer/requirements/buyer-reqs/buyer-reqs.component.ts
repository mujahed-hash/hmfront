import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LocalStorageService } from 'src/app/auth/login/local-storage.service';
import { AllService } from 'src/app/services/all.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'app-buyer-reqs',
  templateUrl: './buyer-reqs.component.html',
  styleUrls: ['./buyer-reqs.component.scss']
})
export class BuyerReqsComponent {
  token:any;
  customIdentifier:any;
  errorMessage:any;
  requirement:any;
  loggedIn:any;
  deliveryRequestStatus: { [key: string]: boolean } = {}; // To track delivery request status per product
  RequestStatus: { [key: string]: boolean } = {}; // To track delivery request status per product
  private destroy$ = new Subject<void>();

  constructor(private requirementService: AllService, private actRoute: ActivatedRoute, private localService:LocalStorageService) {}
  ngOnInit(){
    this.token = localStorage.getItem('token');
    this.getRequirements();
    this.loggedIn = this.localService.getUserID();
    console.log('user id:', this.loggedIn)
    this.getUserID();
    // this.getNotifications();
  }
  getRequirements(){
    this.customIdentifier = this.actRoute.snapshot.params['customIdentifier'];
    this.requirementService.getRequirementByIdentifier(this.customIdentifier, this.token).pipe(takeUntil(this.destroy$))
.subscribe((data:any)=>{
      console.log(data);
      this.requirement = data;
      const products = this.requirement.productDetails;
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        // Set delivery request status based on the product's existing status
        this.deliveryRequestStatus[product._id] = (product.status === 'Requested');
        console.log('Delivery Request Status:', product.name, this.deliveryRequestStatus[product._id]);
        console.log(product.status)

      }
      this.initializeDeliveryStatus(); // Initialize the delivery status for each product

      if(      this.requirement.buyer._id.toString() === this.loggedIn){
        console.log('both equal')
      }
      else{
        console.log('not equal', typeof( this.requirement.buyer._id.toString()), typeof(this.loggedIn))

      }
    })

  }
  initializeDeliveryStatus() {
    // if (this.requirement?.productDetails) {
    //   this.requirement.productDetails.forEach((product: any) => {
    //     // Set delivery request status based on the product's existing status
    //     this.deliveryRequestStatus[product._id] = product.status === 'Requested';
    //     console.log('Delivery Request Status:', product.name, this.deliveryRequestStatus[product._id]);
    //   });
    // }
    const products = this.requirement.productDetails;
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      // Set delivery request status based on the product's existing status
      this.deliveryRequestStatus[product._id] = product.submissionId.status === 'Requested';
      this.RequestStatus[product._id] = product.submissionId.status === 'Completed';

      console.log('Delivery Request Status:', product.name, this.deliveryRequestStatus[product._id]);
    }
  }


  getUserID(){
    const id = this.localService.getUserID();
    console.log('ID track', id)
  }
  requestDelivery(requirementId: string, submissionId: string): void {
    this.requirementService.requestDelivery({ requirementId, submissionId },this.token).pipe(takeUntil(this.destroy$))
.subscribe(
      (response) => {
        alert('Delivery request sent to admin.');
        this.getRequirements();
        this.deliveryRequestStatus[submissionId] = true; // Update the status to 'Requested' for that specific product // Reload the requirements after requesting delivery
      },
      (error) => {
        console.error('Error requesting delivery:', error);
        this.errorMessage = 'Error requesting delivery.';
      }
    );
  }
  ngOnDestroy(): void {
    // Notify all subscriptions to complete
    this.destroy$.next();
    this.destroy$.complete();
  
  }
}
