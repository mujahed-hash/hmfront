import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerMonitorComponent } from './server-monitor.component';

describe('ServerMonitorComponent', () => {
  let component: ServerMonitorComponent;
  let fixture: ComponentFixture<ServerMonitorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ServerMonitorComponent]
    });
    fixture = TestBed.createComponent(ServerMonitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
