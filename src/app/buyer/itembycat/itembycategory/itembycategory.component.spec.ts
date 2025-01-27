import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItembycategoryComponent } from './itembycategory.component';

describe('ItembycategoryComponent', () => {
  let component: ItembycategoryComponent;
  let fixture: ComponentFixture<ItembycategoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ItembycategoryComponent]
    });
    fixture = TestBed.createComponent(ItembycategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
