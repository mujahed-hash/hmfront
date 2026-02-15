import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class StateService {

    // Cart State
    private cartCountSubject = new BehaviorSubject<number>(this.getStoredCartCount());
    cartCount$ = this.cartCountSubject.asObservable();

    constructor(private ngZone: NgZone) {
        console.log('[StateService] Initialized. Cart Count:', this.cartCountSubject.value);
    }

    // --- Cart Management ---

    private getStoredCartCount(): number {
        const stored = localStorage.getItem('cart_count');
        return stored ? parseInt(stored, 10) : 0;
    }

    updateCartCount(count: number) {
        console.log('[StateService] UPDATE REQUEST for Cart Count:', count);
        if (!isNaN(count)) {
            localStorage.setItem('cart_count', count.toString());
            // Ensure emission happens inside Angular zone for reliable change detection
            if (NgZone.isInAngularZone()) {
                this.cartCountSubject.next(count);
            } else {
                this.ngZone.run(() => {
                    this.cartCountSubject.next(count);
                });
            }
            console.log('[StateService] EMITTED new Cart Count:', count);
        } else {
            console.warn('[StateService] Ignored invalid cart count:', count);
        }
    }

    incrementCartCount() {
        const current = this.cartCountSubject.value;
        this.updateCartCount(current + 1);
    }

    decrementCartCount() {
        const current = this.cartCountSubject.value;
        if (current > 0) {
            this.updateCartCount(current - 1);
        }
    }

    /** Adjust cart count by a delta (positive to add, negative to subtract) */
    adjustCartCount(delta: number) {
        const newCount = Math.max(0, this.cartCountSubject.value + delta);
        this.updateCartCount(newCount);
    }

    resetCart() {
        this.updateCartCount(0);
    }
}
