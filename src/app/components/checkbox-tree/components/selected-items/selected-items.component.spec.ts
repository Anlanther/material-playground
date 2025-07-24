import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { SelectedItemsComponent } from './selected-items.component';

describe('SelectedItemsComponent', () => {
  let component: SelectedItemsComponent;
  let fixture: ComponentFixture<SelectedItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectedItemsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectedItemsComponent);
    component = fixture.componentInstance;
    component.selectedCount$ = of(0);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display selected items count', async () => {
    component.selectedCount$ = of(3);
    fixture.detectChanges();
    await fixture.whenStable();

    const header = fixture.nativeElement.querySelector('.selected-header h3');
    expect(header.textContent).toContain('Selected Items (3)');
  });

  it('should show no selection message when no items selected', () => {
    component.selectedNodes = [];
    fixture.detectChanges();

    const noSelection = fixture.nativeElement.querySelector('.no-selection');
    expect(noSelection).toBeTruthy();
    expect(noSelection.textContent).toContain('No items selected');
  });

  it('should show selected items when items are selected', () => {
    component.selectedNodes = ['Item 1', 'Item 2'];
    fixture.detectChanges();

    const selectedItems =
      fixture.nativeElement.querySelector('.selected-items');
    const chips = fixture.nativeElement.querySelectorAll('mat-chip');

    expect(selectedItems).toBeTruthy();
    expect(chips.length).toBe(2);
  });

  it('should track selected items by value', () => {
    const result = component.trackBySelectedItem(0, 'Test Item');
    expect(result).toBe('Test Item');
  });

  it('should hide when showSelectedItems is false', () => {
    component.showSelectedItems = false;
    fixture.detectChanges();

    const selectedSection =
      fixture.nativeElement.querySelector('.selected-section');
    expect(selectedSection).toBeFalsy();
  });
});
