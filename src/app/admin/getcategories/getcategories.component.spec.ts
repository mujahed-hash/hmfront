import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetcategoriesComponent } from './getcategories.component';

describe('GetcategoriesComponent', () => {
  let component: GetcategoriesComponent;
  let fixture: ComponentFixture<GetcategoriesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GetcategoriesComponent]
    });
    fixture = TestBed.createComponent(GetcategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
