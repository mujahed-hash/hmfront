import { Component } from '@angular/core';
import { AllService } from 'src/app/services/all.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-req-sup',
  templateUrl: './req-sup.component.html',
  styleUrls: ['./req-sup.component.scss']
})
export class ReqSupComponent {
   token: any;
   requirements: any[] = [];
   isLoading: boolean = true;
   error: string | null = null;
   private destroy$ = new Subject<void>();

  constructor(private requirementService: AllService){}
  
  ngOnInit() {
    this.token = localStorage.getItem('token');
    this.loadForwardedRequirements();
  }

  loadForwardedRequirements() {
    this.isLoading = true;
    this.error = null;
    
    this.requirementService.getForwardedRequirementsToSupplier(this.token)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.requirements = response;
          this.isLoading = false;
          console.log('Requirements loaded:', response);
        },
        error: (err) => {
          this.error = err.message || 'Failed to load requirements';
          this.isLoading = false;
          console.error('Error loading requirements:', err);
        }
      });
  }
  
  truncateText(text: string, maxLength: number): string {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
