import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomStatusSelectorComponent } from './custom-status-selector.component';

describe('CustomStatusSelectorComponent', () => {
  let component: CustomStatusSelectorComponent;
  let fixture: ComponentFixture<CustomStatusSelectorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomStatusSelectorComponent]
    });
    fixture = TestBed.createComponent(CustomStatusSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
