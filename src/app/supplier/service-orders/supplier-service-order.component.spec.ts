import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierServiceOrderComponent } from './supplier-service-order.component';

describe('SupplierServiceOrderComponent', () => {
  let component: SupplierServiceOrderComponent;
  let fixture: ComponentFixture<SupplierServiceOrderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SupplierServiceOrderComponent]
    });
    fixture = TestBed.createComponent(SupplierServiceOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
