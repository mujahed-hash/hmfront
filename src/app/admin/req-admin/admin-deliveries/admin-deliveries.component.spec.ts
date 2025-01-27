import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDeliveriesComponent } from './admin-deliveries.component';

describe('AdminDeliveriesComponent', () => {
  let component: AdminDeliveriesComponent;
  let fixture: ComponentFixture<AdminDeliveriesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminDeliveriesComponent]
    });
    fixture = TestBed.createComponent(AdminDeliveriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
