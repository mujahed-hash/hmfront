import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierOrdersComponentComponent } from './supplier-orders-component.component';

describe('SupplierOrdersComponentComponent', () => {
  let component: SupplierOrdersComponentComponent;
  let fixture: ComponentFixture<SupplierOrdersComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SupplierOrdersComponentComponent]
    });
    fixture = TestBed.createComponent(SupplierOrdersComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
