import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscoveryTableComponent } from './discovery-table.component';

describe('DiscoveryTableComponent', () => {
  let component: DiscoveryTableComponent;
  let fixture: ComponentFixture<DiscoveryTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscoveryTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscoveryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
