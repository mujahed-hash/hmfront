import { Component, OnInit, OnDestroy } from '@angular/core';
import { Alert, AlertService } from '../alert.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit, OnDestroy {
  alert: Alert | null = null;
  private alertSubscription!: Subscription;

  constructor(private alertService: AlertService) { }

  ngOnInit(): void {
    console.log('AlertComponent: ngOnInit() called.'); // Debug log
    this.alertSubscription = this.alertService.alert$.subscribe(alert => {
      console.log('AlertComponent: Received alert data:', alert); // Debug log
      this.alert = alert;
    });
  }

  ngOnDestroy(): void {
    this.alertSubscription.unsubscribe();
  }

  dismissAlert() {
    this.alertService.clear();
  }

  getIconClass(type: Alert['type']) {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'default':
      default:
        return 'info';
    }
  }

  getAlertClass(type: Alert['type']) {
    switch (type) {
      case 'success':
        return 'alert-success';
      case 'error':
        return 'alert-destructive';
      case 'default':
      default:
        return 'alert-default';
    }
  }
}
