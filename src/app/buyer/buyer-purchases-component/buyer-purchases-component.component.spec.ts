import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyerPurchasesComponentComponent } from './buyer-purchases-component.component';

describe('BuyerPurchasesComponentComponent', () => {
  let component: BuyerPurchasesComponentComponent;
  let fixture: ComponentFixture<BuyerPurchasesComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BuyerPurchasesComponentComponent]
    });
    fixture = TestBed.createComponent(BuyerPurchasesComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
