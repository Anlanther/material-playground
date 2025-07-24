import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';

import { SearchFilterComponent } from './search-filter.component';

describe('SearchFilterComponent', () => {
  let component: SearchFilterComponent;
  let fixture: ComponentFixture<SearchFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchFilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchFilterComponent);
    component = fixture.componentInstance;
    component.searchControl = new FormControl('');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit clear search event', () => {
    spyOn(component.clearSearch, 'emit');
    component.onClearSearch();
    expect(component.clearSearch.emit).toHaveBeenCalled();
  });

  it('should show search field when showSearchFilter is true', () => {
    component.showSearchFilter = true;
    fixture.detectChanges();
    const searchSection =
      fixture.nativeElement.querySelector('.search-section');
    expect(searchSection).toBeTruthy();
  });

  it('should hide search field when showSearchFilter is false', () => {
    component.showSearchFilter = false;
    fixture.detectChanges();
    const searchSection =
      fixture.nativeElement.querySelector('.search-section');
    expect(searchSection).toBeFalsy();
  });
});
