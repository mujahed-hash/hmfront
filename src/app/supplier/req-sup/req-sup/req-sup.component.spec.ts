import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReqSupComponent } from './req-sup.component';

describe('ReqSupComponent', () => {
  let component: ReqSupComponent;
  let fixture: ComponentFixture<ReqSupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReqSupComponent]
    });
    fixture = TestBed.createComponent(ReqSupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
