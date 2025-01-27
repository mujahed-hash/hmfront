import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VieworderASComponent } from './vieworder-as.component';

describe('VieworderASComponent', () => {
  let component: VieworderASComponent;
  let fixture: ComponentFixture<VieworderASComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VieworderASComponent]
    });
    fixture = TestBed.createComponent(VieworderASComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
