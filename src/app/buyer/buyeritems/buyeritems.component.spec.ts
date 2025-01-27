import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyeritemsComponent } from './buyeritems.component';

describe('BuyeritemsComponent', () => {
  let component: BuyeritemsComponent;
  let fixture: ComponentFixture<BuyeritemsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BuyeritemsComponent]
    });
    fixture = TestBed.createComponent(BuyeritemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
