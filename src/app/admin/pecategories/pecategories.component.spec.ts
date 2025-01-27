import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PEcategoriesComponent } from './pecategories.component';

describe('PEcategoriesComponent', () => {
  let component: PEcategoriesComponent;
  let fixture: ComponentFixture<PEcategoriesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PEcategoriesComponent]
    });
    fixture = TestBed.createComponent(PEcategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
