import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostSupReqComponent } from './post-sup-req.component';

describe('PostSupReqComponent', () => {
  let component: PostSupReqComponent;
  let fixture: ComponentFixture<PostSupReqComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PostSupReqComponent]
    });
    fixture = TestBed.createComponent(PostSupReqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
