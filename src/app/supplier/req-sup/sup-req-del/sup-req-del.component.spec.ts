import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupReqDelComponent } from './sup-req-del.component';

describe('SupReqDelComponent', () => {
  let component: SupReqDelComponent;
  let fixture: ComponentFixture<SupReqDelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SupReqDelComponent]
    });
    fixture = TestBed.createComponent(SupReqDelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
