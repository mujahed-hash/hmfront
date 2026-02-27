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
  loggingOutAll = false;
  orphans: any[] = [];
  scanningOrphans = false;
  deletingOrphans = false;
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

  logoutAllUsers() {
    if (this.loggingOutAll) return;

    if (confirm('Are you sure? This will immediately log out every single user on the platform.')) {
      this.loggingOutAll = true;
      this.adminService.logoutAllUsers().subscribe({
        next: (res) => {
          this.sharedService.showNotification('All users logged out successfully', 'success');
          this.loggingOutAll = false;
        },
        error: (err) => {
          this.sharedService.showNotification('Failed to invalidate sessions', 'error');
          this.loggingOutAll = false;
        }
      });
    }
  }

  scanOrphans() {
    if (this.scanningOrphans) return;

    this.scanningOrphans = true;
    const token = localStorage.getItem('token');
    this.adminService.getOrphanedFiles(token).subscribe({
      next: (res) => {
        this.orphans = res.orphans;
        this.scanningOrphans = false;
        if (this.orphans.length === 0) {
          this.sharedService.showNotification('No orphaned files found. Your storage is clean!', 'success');
        } else {
          this.sharedService.showNotification(`Found ${this.orphans.length} orphaned files.`, 'info');
        }
      },
      error: (err) => {
        this.sharedService.showNotification('Failed to scan for orphaned files', 'error');
        this.scanningOrphans = false;
      }
    });
  }

  deleteOrphans() {
    if (this.orphans.length === 0 || this.deletingOrphans) return;

    if (confirm(`Are you sure you want to delete ${this.orphans.length} orphaned files? This will permanently reclaim storage space.`)) {
      this.deletingOrphans = true;
      const filePaths = this.orphans.map(o => o.fullPath);
      const token = localStorage.getItem('token');
      this.adminService.deleteOrphanedFiles(filePaths, token).subscribe({
        next: (res) => {
          this.sharedService.showNotification(`Successfully deleted ${res.deletedCount} orphaned files.`, 'success');
          this.orphans = [];
          this.deletingOrphans = false;
        },
        error: (err) => {
          this.sharedService.showNotification('Failed to delete orphaned files', 'error');
          this.deletingOrphans = false;
        }
      });
    }
  }

  getThumbUrl(path: string): string {
    return this.adminService.baseUrl.replace('/api', '') + path;
  }

  handleImgError(event: any) {
    event.target.src = 'assets/images/placeholder.png';
  }

  getTotalOrphanSize(): number {
    return this.orphans.reduce((acc, curr) => acc + curr.size, 0);
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
