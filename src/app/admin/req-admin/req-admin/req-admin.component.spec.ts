import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReqAdminComponent } from './req-admin.component';

describe('ReqAdminComponent', () => {
  let component: ReqAdminComponent;
  let fixture: ComponentFixture<ReqAdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReqAdminComponent]
    });
    fixture = TestBed.createComponent(ReqAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
