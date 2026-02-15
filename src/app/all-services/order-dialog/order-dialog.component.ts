import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AlertService } from '../alert.service'; // Corrected import path

interface Service {
  _id: string;
  serviceName: string;
  price: number;
  images?: string[];
  category?: {
    name: string;
    customIdentifier: string;
  };
  user?: {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
}

@Component({
  selector: 'app-order-dialog',
  templateUrl: './order-dialog.component.html',
  styleUrls: ['./order-dialog.component.scss']
})
export class OrderDialogComponent implements OnInit {
  orderForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<OrderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      service: Service;
    },
    private alertService: AlertService
  ) {
    this.orderForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      address: ['', Validators.required],
      notes: [''],
      agreeToTerms: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {
    // Original pre-fill form logic
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.orderForm.patchValue({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || ''
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }

  getTotalPrice(): number {
    return this.data.service.price; // Services are not ordered in quantities
  }

  onSubmit(): void {
    if (this.orderForm.valid) {
      this.isSubmitting = true;
      
      // Simulate a small delay to show the spinner (in real app, this would be the API call time)
      setTimeout(() => {
        // Prepare order data
        const orderData = {
          ...this.orderForm.value,
          serviceId: this.data.service._id,
          serviceName: this.data.service.serviceName,
          servicePrice: this.data.service.price,
          totalPrice: this.getTotalPrice(),
          supplierId: this.data.service.user?._id,
          supplierName: this.data.service.user?.name,
          orderDate: new Date()
        };
        
        // Close dialog and return order data
        this.dialogRef.close(orderData);
      }, 800);
    } else {
      // Mark all fields as touched to trigger validation messages
      this.orderForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}