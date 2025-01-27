import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdercancelledComponent } from './ordercancelled.component';

describe('OrdercancelledComponent', () => {
  let component: OrdercancelledComponent;
  let fixture: ComponentFixture<OrdercancelledComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrdercancelledComponent]
    });
    fixture = TestBed.createComponent(OrdercancelledComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
