import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplysearchComponent } from './supplysearch.component';

describe('SupplysearchComponent', () => {
  let component: SupplysearchComponent;
  let fixture: ComponentFixture<SupplysearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SupplysearchComponent]
    });
    fixture = TestBed.createComponent(SupplysearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
