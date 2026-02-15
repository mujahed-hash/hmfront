import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceOrderConversationComponent } from './service-order-conversation.component';

describe('ServiceOrderConversationComponent', () => {
  let component: ServiceOrderConversationComponent;
  let fixture: ComponentFixture<ServiceOrderConversationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ServiceOrderConversationComponent]
    });
    fixture = TestBed.createComponent(ServiceOrderConversationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
