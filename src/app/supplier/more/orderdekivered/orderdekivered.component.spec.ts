import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderdekiveredComponent } from './orderdekivered.component';

describe('OrderdekiveredComponent', () => {
  let component: OrderdekiveredComponent;
  let fixture: ComponentFixture<OrderdekiveredComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrderdekiveredComponent]
    });
    fixture = TestBed.createComponent(OrderdekiveredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
