import { Component, OnInit, OnDestroy } from '@angular/core';
import { AdminService } from '../admin.service';
import { Subject, timer } from 'rxjs';
import { takeUntil, switchMap, retry } from 'rxjs/operators';
import { SharedService } from '../../shared/shared.service';

@Component({
  selector: 'app-server-monitor',
  templateUrl: './server-monitor.component.html',
  styleUrls: ['./server-monitor.component.scss']
})
export class ServerMonitorComponent implements OnInit, OnDestroy {
  stats: any = null;
  loading = true;
  clearingCache = false;
  private destroy$ = new Subject<void>();

  constructor(
    private adminService: AdminService,
    private sharedService: SharedService
  ) { }

  ngOnInit(): void {
    this.startPolling();
  }

  startPolling() {
    // Poll every 5 seconds
    timer(0, 5000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.adminService.getSystemStats().pipe(retry(2)))
      )
      .subscribe({
        next: (data) => {
          this.stats = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to fetch stats', err);
          // Don't stop polling on error, just log it
        }
      });
  }

  clearCache() {
    if (this.clearingCache) return;

    this.clearingCache = true;
    this.adminService.clearCache().subscribe({
      next: (res) => {
        this.sharedService.showNotification('Cache Cleared Successfully', 'success');
        this.clearingCache = false;
        // detailed logs if needed
        console.log('Cache clear details:', res.details);
      },
      error: (err) => {
        this.sharedService.showNotification('Failed to Clear Cache', 'error');
        this.clearingCache = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Helpers for template
  formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  getRamUsagePercent(): number {
    if (!this.stats?.memory) return 0;
    return (this.stats.memory.active / this.stats.memory.total) * 100;
  }
}
