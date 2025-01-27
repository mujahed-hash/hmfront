import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VieworderBuyerComponent } from './vieworder-buyer.component';

describe('VieworderBuyerComponent', () => {
  let component: VieworderBuyerComponent;
  let fixture: ComponentFixture<VieworderBuyerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VieworderBuyerComponent]
    });
    fixture = TestBed.createComponent(VieworderBuyerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
