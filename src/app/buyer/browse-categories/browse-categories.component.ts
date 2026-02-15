import { Component } from '@angular/core';
import { BuyerService } from '../buyer.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-browse-categories',
  templateUrl: './browse-categories.component.html',
  styleUrls: ['./browse-categories.component.scss']
})
export class BrowseCategoriesComponent {
  private destroy$ = new Subject<void>();

  token!: string | null;
  categories: any[] = [];
  constructor(private buyerService:BuyerService){}
  ngOnInit(){
    this.token = localStorage.getItem('token');
    this.getCategories();
  }
  getCategories(){
    this.buyerService.getCategories(this.token).pipe(takeUntil(this.destroy$)).subscribe((data:any)=>{
      this.categories = data;
    });
  }
}
