import { Component } from '@angular/core';
import { SharedService } from '../shared.service';
import { ActivatedRoute } from '@angular/router';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';

@Component({
  selector: 'app-vieworder-as',
  templateUrl: './vieworder-as.component.html',
  styleUrls: ['./vieworder-as.component.scss']
})
export class VieworderASComponent {
  order: any = {};
  token: any;
  private destroy$ = new Subject<void>();

  constructor(
    private sharedService: SharedService,
    public authService: AuthService,
    private actRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.token = localStorage.getItem('token');
    this.getOrder();
  }

  getOrder() {
    this.actRoute.params.subscribe((params) => {
      this.sharedService.getOrderAS(params['customIdentifier'], this.token)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
          this.order = data;
          console.log(data);
        });
    });
  }

  printOrder(): void {
    const printContents = document.querySelector('.order-details-container')?.innerHTML;
    const originalContents = document.body.innerHTML;

    if (printContents) {
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); // Restore original page after printing
    } else {
      console.error('Order details not found for printing.');
    }
  }

  async downloadOrderAsPDF(): Promise<void> {
    const element = document.querySelector('.order-details-container') as HTMLElement;
    if (!element) {
      console.error('Order details not found for generating PDF.');
      return;
    }

    html2canvas(element).then(async (canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let scale = 1;
      if (imgHeight > pageHeight) {
        scale = pageHeight / imgHeight;
      }

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth * scale, imgHeight * scale);
      
      // Detect if running on a mobile app or browser
      if (Capacitor.getPlatform() === 'web') {
        // Download in browser
        pdf.save('order-details.pdf');
      } else {
        // Save to mobile storage
        const hasPermission = await this.requestWritePermission();
        if (!hasPermission) {
          console.error('Storage permission not granted.');
          return;
        }
        const pdfOutput = pdf.output('datauristring');
        const base64String = pdfOutput.split(',')[1]; // Extract base64 data

        try {
          const fileName = 'order-details.pdf';
          await Filesystem.writeFile({
            path: fileName,
            data: base64String,
            directory: Directory.Documents,
            encoding: 'base64' as any, // Fix for TypeScript issue
          });

          console.log('PDF saved successfully to device storage.');
        } catch (error) {
          console.error('Error saving PDF:', error);
        }
      }
    });
  }

  async requestWritePermission(): Promise<boolean> {
    if (Capacitor.getPlatform() !== 'android') {
      return true; // No need for permission on web or iOS
    }

    const androidPermissions = new AndroidPermissions();

    // Check for storage permissions based on Android version
    const platformVersion = Capacitor.getPlatform() === 'android' 
      ? parseInt((window as any).cordova.platformId.split(' ')[1], 10) 
      : 0;

    if (platformVersion >= 33) {
      // Handle Android 13+ (API 33) for granular media permissions
      const result = await androidPermissions.checkPermission(androidPermissions.PERMISSION.READ_MEDIA_IMAGES);
      if (!result.hasPermission) {
        await androidPermissions.requestPermission(androidPermissions.PERMISSION.READ_MEDIA_IMAGES);
      }
    } else {
      // Handle permissions for Android versions < 13
      const result = await androidPermissions.checkPermission(androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE);
      if (!result.hasPermission) {
        const requestResult = await androidPermissions.requestPermission(androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE);
        return requestResult.hasPermission;
      }
    }

    return true; // Permission granted
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
