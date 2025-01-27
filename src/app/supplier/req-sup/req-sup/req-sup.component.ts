import { Component } from '@angular/core';
import { AllService } from 'src/app/services/all.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-req-sup',
  templateUrl: './req-sup.component.html',
  styleUrls: ['./req-sup.component.scss']
})
export class ReqSupComponent {
   token:any;
   requirements:any;
   private destroy$ = new Subject<void>();

  constructor(private requirementService: AllService){}
  ngOnInit() {
    this.token = localStorage.getItem('token')
    this.loadForwardedRequirements();
  }

  loadForwardedRequirements() {
    this.requirementService.getForwardedRequirementsToSupplier(this.token).pipe(takeUntil(this.destroy$)).subscribe(response => {
      this.requirements = response;
      console.log(response)
    });
  }
  truncateText(text: string, maxLength: number): string {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
  ngOnDestroy(): void {
    // Notify all subscriptions to complete
    this.destroy$.next();
    this.destroy$.complete();
  
  }
}
