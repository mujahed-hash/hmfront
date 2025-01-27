import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderdeliveredComponent } from './orderdelivered.component';

describe('OrderdeliveredComponent', () => {
  let component: OrderdeliveredComponent;
  let fixture: ComponentFixture<OrderdeliveredComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrderdeliveredComponent]
    });
    fixture = TestBed.createComponent(OrderdeliveredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
