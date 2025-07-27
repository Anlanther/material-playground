import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFilterComponent } from './create-filter.component';

describe('CreateFilterComponent', () => {
  let component: CreateFilterComponent;
  let fixture: ComponentFixture<CreateFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
