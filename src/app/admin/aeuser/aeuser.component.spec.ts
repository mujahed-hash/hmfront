import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AEUserComponent } from './aeuser.component';

describe('AEUserComponent', () => {
  let component: AEUserComponent;
  let fixture: ComponentFixture<AEUserComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AEUserComponent]
    });
    fixture = TestBed.createComponent(AEUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
