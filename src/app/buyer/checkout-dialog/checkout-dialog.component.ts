import { Component, Inject, Input, Output, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-checkout-dialog',
  templateUrl: './checkout-dialog.component.html',
  styleUrls: ['./checkout-dialog.component.scss']
})
export class CheckoutDialogComponent {
  @Input() user: any;
  @Input() note: string = '';
  @Output() confirmCheckout = new EventEmitter<string>();

  constructor(
    public dialogRef: MatDialogRef<CheckoutDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onConfirm(): void {
    this.confirmCheckout.emit(this.note);
    this.dialogRef.close();
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
