import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimatedSpriteComponent } from './animated-sprite.component';

describe('AnimatedSpriteComponent', () => {
  let component: AnimatedSpriteComponent;
  let fixture: ComponentFixture<AnimatedSpriteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnimatedSpriteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimatedSpriteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
