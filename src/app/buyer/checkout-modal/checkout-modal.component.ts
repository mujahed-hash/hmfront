import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-checkout-modal',
  templateUrl: './checkout-modal.component.html',
  styleUrls: ['./checkout-modal.component.scss']
})
export class CheckoutModalComponent {
  @Input() user: any;
  @Output() confirmCheckout = new EventEmitter<{ confirmed: boolean, notes: string }>();
  notes: string = '';

  onConfirm(): void {
    this.confirmCheckout.emit({ confirmed: true, notes: this.notes });
  }

  onCancel(): void {
    this.confirmCheckout.emit({ confirmed: false, notes: this.notes });
    console.log('i m clicked')
  }
  
}
