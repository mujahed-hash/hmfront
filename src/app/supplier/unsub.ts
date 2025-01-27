import { Subject, takeUntil } from 'rxjs';


private destroy$ = new Subject<void>();

 
 ngOnDestroy(): void {
    // Notify all subscriptions to complete
    this.destroy$.next();
    this.destroy$.complete();
  
  }

.pipe(takeUntil(this.destroy$))