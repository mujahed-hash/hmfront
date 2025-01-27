import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersrequestsComponent } from './usersrequests.component';

describe('UsersrequestsComponent', () => {
  let component: UsersrequestsComponent;
  let fixture: ComponentFixture<UsersrequestsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UsersrequestsComponent]
    });
    fixture = TestBed.createComponent(UsersrequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
