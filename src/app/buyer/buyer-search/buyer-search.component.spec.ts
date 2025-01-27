import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyerSearchComponent } from './buyer-search.component';

describe('BuyerSearchComponent', () => {
  let component: BuyerSearchComponent;
  let fixture: ComponentFixture<BuyerSearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BuyerSearchComponent]
    });
    fixture = TestBed.createComponent(BuyerSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
