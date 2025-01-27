import { Component } from '@angular/core';
import { SharedService } from '../shared.service';
import { ActivatedRoute } from '@angular/router';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-vieworder-as',
  templateUrl: './vieworder-as.component.html',
  styleUrls: ['./vieworder-as.component.scss']
})
export class VieworderASComponent  {
order:any={};
token:any;
private destroy$ = new Subject<void>();

constructor( private sharedService: SharedService,    public authService: AuthService
, private actRoute: ActivatedRoute){}
ngOnInit(){
  this.token = localStorage.getItem('token');
 this.getOrder();
}
getOrder(){
  this.actRoute.params.subscribe((params) => {
    this.sharedService.getOrderAS(params['customIdentifier'], this.token).pipe(takeUntil(this.destroy$)).subscribe((data: any) => {
      this.order = data;
    
      console.log(data);
    });
      })}

      printOrder(): void {
        const printContents = document.querySelector('.order-details-container')?.innerHTML;
        const originalContents = document.body.innerHTML;
      
        if (printContents) {
          document.body.innerHTML = printContents;
          window.print();
          document.body.innerHTML = originalContents;
          window.location.reload(); // To restore the original page state after printing
        } else {
          console.error('Order details not found for printing.');
        }
      }
      
      downloadOrderAsPDF(): void {
        const element = document.querySelector('.order-details-container') as HTMLElement;
        const downloadButton = document.querySelector('.download-pdf-button') as HTMLElement;
      
        if (element && downloadButton) {
          // Hide the download button
          downloadButton.style.display = 'none';
      
          html2canvas(element).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 page height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
            let scale = 1;
            
            // Scale the image down if it's too large for a single page
            if (imgHeight > pageHeight) {
              scale = pageHeight / imgHeight;
            }
      
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth * scale, imgHeight * scale);
      
            pdf.save('order-details.pdf');
      
            // Restore the download button after generating the PDF
            downloadButton.style.display = 'block';
          });
        } else {
          console.error('Order details not found for generating PDF.');
        }
      }
      ngOnDestroy(): void {
        // Notify all subscriptions to complete
        this.destroy$.next();
        this.destroy$.complete();
      
      }

}
