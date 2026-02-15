import { Component } from '@angular/core';
import { AdminService } from '../admin.service';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  private destroy$ = new Subject<void>();

  token!:any;
  order:any;
  products:any;
  users:any;
  model: string = 'All'; // Default model
  query: string = '';
  results: any[] = [];
  totalResults: number = 0;
  start: number = 0;
  limit: number = 10;
  models: string[] = ['All', 'Product', 'User', 'Order', 'Category', 'ProductSubmission', 'Requirement'];
  selectedModel: string = 'All'; // Default to All
  groupedResults: { [key: string]: any[] } = {}; // To group by model
  sPerformed:boolean=false;
  constructor(private adminService: AdminService){}

  ngOnInit() {
   this.token = localStorage.getItem('token');
   this.getOrdersCount()
   this.getProductsCount()
   this.getUsersCount()

   } 

   onSearch(): void {
    this.sPerformed = true;

  const modelToSearch = this.selectedModel === 'All' ? '' : this.selectedModel;

  console.log('Selected Model:', modelToSearch); // Debug: Log selected model
  console.log('Query:', this.query)    
    this.adminService.search(this.query,modelToSearch, this.start, this.limit, this.token).pipe(takeUntil(this.destroy$))
.subscribe(
      (response) => {
        console.log('search res',response)
        this.results = response.results;
        this.totalResults = response.totalResults;
        this.groupResultsByModel();
      },
      (error) => {
        console.error('Search error:', error);
      }
    );
  }
    // Convert object entries to use in *ngFor
    objectEntries(obj: any): [string, any][] {
      return Object.entries(obj);
    }
   // Group results by model for easy display in the UI
   groupResultsByModel() {
    this.groupedResults = this.results.reduce((acc, result) => {
      const model = result.model;
      if (!acc[model]) {
        acc[model] = [];
      }
      acc[model].push(result);
      return acc;
    }, {});
  }
  // Set the selected model when a tag is clicked
  selectModel(model: string): void {
    this.selectedModel = model;
    this.start = 0; // Reset pagination when a new model is selected
    this.onSearch(); // Perform search with the new model
  }
  deleteDocument(model: string, id: string) {
    if (confirm('Are you sure you want to delete this document?')) {
      this.adminService.deleteDocumentByModelAndId(model, id, this.token).pipe(takeUntil(this.destroy$))
.subscribe(
        () => {
          alert('Document deleted successfully');
          this.onSearch(); // Refresh results after deletion
        },
        (error) => {
          console.error('Error deleting document:', error);
          alert('Failed to delete the document.');
        }
      );
    }
  }


  // Clear the model filter and default to 'All'
  clearModel(): void {
    this.selectedModel = 'All';
    this.start = 0;
    this.onSearch();
  }
  nextPage(): void {
    if (this.start + this.limit < this.totalResults) {
      this.start += this.limit;
      this.onSearch();
    }
  }

  previousPage(): void {
    if (this.start > 0) {
      this.start -= this.limit;
      this.onSearch();
    }
  }
    // Reset search results
    resetSearch() {
      this.query = '';
      this.results = [];
      this.groupedResults = {};
      this.totalResults = 0;
      this.start = 0;
      this.sPerformed = false
    }

  // Helper to disable buttons when necessary
  canGoNext(): boolean {
    return this.start + this.limit < this.totalResults;
  }

  canGoPrevious(): boolean {
    return this.start > 0;
  }
 // Helper to identify which fields to show for each model dynamically

   
   getOrdersCount(){
    this.adminService.getOrdersCountAdmin(this.token).pipe(takeUntil(this.destroy$))
.subscribe((data:any)=>{
      console.log(data)
      this.order = data
    })
   }
   getProductsCount(){
    this.adminService.getProductsCountAdmin(this.token).pipe(takeUntil(this.destroy$))
.subscribe((data:any)=>{
      console.log(data)
      this.products = data

    })
   }
   getUsersCount(){
    this.adminService.getUsersCountAdmin(this.token).pipe(takeUntil(this.destroy$))
.subscribe((data:any)=>{
      console.log(data)
      this.users = data

    })
   }

 
 ngOnDestroy(): void {
  // Notify all subscriptions to complete
  this.destroy$.next();
  this.destroy$.complete();

}

}
