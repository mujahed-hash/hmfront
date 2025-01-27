import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProduceditComponent } from './producedit.component';

describe('ProduceditComponent', () => {
  let component: ProduceditComponent;
  let fixture: ComponentFixture<ProduceditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProduceditComponent]
    });
    fixture = TestBed.createComponent(ProduceditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
