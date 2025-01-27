import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MakereqComponent } from './makereq.component';

describe('MakereqComponent', () => {
  let component: MakereqComponent;
  let fixture: ComponentFixture<MakereqComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MakereqComponent]
    });
    fixture = TestBed.createComponent(MakereqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
