import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserServiceOrdersComponent } from './user-service-orders.component';

describe('UserServiceOrdersComponent', () => {
  let component: UserServiceOrdersComponent;
  let fixture: ComponentFixture<UserServiceOrdersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserServiceOrdersComponent]
    });
    fixture = TestBed.createComponent(UserServiceOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
