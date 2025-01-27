import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyerDashboardComponentComponent } from './buyer-dashboard-component.component';

describe('BuyerDashboardComponentComponent', () => {
  let component: BuyerDashboardComponentComponent;
  let fixture: ComponentFixture<BuyerDashboardComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BuyerDashboardComponentComponent]
    });
    fixture = TestBed.createComponent(BuyerDashboardComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
