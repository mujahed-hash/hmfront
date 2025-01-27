import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdereditComponent } from './orderedit.component';

describe('OrdereditComponent', () => {
  let component: OrdereditComponent;
  let fixture: ComponentFixture<OrdereditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrdereditComponent]
    });
    fixture = TestBed.createComponent(OrdereditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
