import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDelReqsComponent } from './admin-del-reqs.component';

describe('AdminDelReqsComponent', () => {
  let component: AdminDelReqsComponent;
  let fixture: ComponentFixture<AdminDelReqsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminDelReqsComponent]
    });
    fixture = TestBed.createComponent(AdminDelReqsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
