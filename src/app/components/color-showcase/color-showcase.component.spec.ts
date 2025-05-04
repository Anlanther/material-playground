import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorShowcaseComponent } from './color-showcase.component';

describe('ColorShowcaseComponent', () => {
  let component: ColorShowcaseComponent;
  let fixture: ComponentFixture<ColorShowcaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColorShowcaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColorShowcaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
