import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminProdSubComponent } from './admin-prod-sub.component';

describe('AdminProdSubComponent', () => {
  let component: AdminProdSubComponent;
  let fixture: ComponentFixture<AdminProdSubComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminProdSubComponent]
    });
    fixture = TestBed.createComponent(AdminProdSubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
