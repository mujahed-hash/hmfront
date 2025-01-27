import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiupComponent } from './siup.component';

describe('SiupComponent', () => {
  let component: SiupComponent;
  let fixture: ComponentFixture<SiupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SiupComponent]
    });
    fixture = TestBed.createComponent(SiupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
