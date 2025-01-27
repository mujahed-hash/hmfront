import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyerReqsComponent } from './buyer-reqs.component';

describe('BuyerReqsComponent', () => {
  let component: BuyerReqsComponent;
  let fixture: ComponentFixture<BuyerReqsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BuyerReqsComponent]
    });
    fixture = TestBed.createComponent(BuyerReqsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
