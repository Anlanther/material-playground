import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateFilterComponent } from './update-filter.component';

describe('UpdateFilterComponent', () => {
  let component: UpdateFilterComponent;
  let fixture: ComponentFixture<UpdateFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateFilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
