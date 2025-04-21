import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { FilterKey } from '../constants/filter-key.enum';
import { FilterOption } from '../models/filter-option.model';
import { SavedFilter } from '../models/saved-filter.model';
import { DEFAULT_STATE, FormFilterState } from './form-filter-state';

@Injectable({
  providedIn: 'root',
})
export class FormFilterStateService extends ComponentStore<FormFilterState> {
  activeFilters$ = this.select((state) => state.activeFilters);
  filterOptions$ = this.select((state) => state.filterOptions);

  constructor() {
    super(DEFAULT_STATE);
  }

  readonly initialiseFilterOptions = this.updater(
    (state, filterOptions: FilterOption[]) => ({
      ...state,
      filterOptions,
    }),
  );

  readonly deleteFilterOption = this.updater((state, filterKey: FilterKey) => ({
    ...state,
    filterOptions: state.filterOptions.filter(
      (option) => option.key !== filterKey,
    ),
  }));

  readonly addFilterOption = this.updater(
    (state, filterOption: FilterOption) => ({
      ...state,
      filterOptions: [...state.filterOptions, filterOption],
    }),
  );

  readonly initialiseActiveFilters = this.updater(
    (state, activeFilters: SavedFilter) => ({
      ...state,
      activeFilters,
    }),
  );

  readonly setActiveFilter = this.updater(
    (state, activeFilter: SavedFilter) => ({
      ...state,
      activeFilters: { ...state.activeFilters, ...activeFilter },
    }),
  );

  readonly deleteActiveFilter = this.updater((state, filterKey: FilterKey) => {
    const { [filterKey]: _, ...remainingFilters } = state.activeFilters;
    return {
      ...state,
      activeFilters: remainingFilters,
    };
  });

  readonly updateActiveFilter = this.updater(
    (state, updatedFilter: { key: FilterKey; value: unknown }) => ({
      ...state,
      activeFilters: {
        ...state.activeFilters,
        [updatedFilter.key]: {
          ...state.activeFilters[updatedFilter.key],
          filterForm: { [updatedFilter.key]: updatedFilter.value },
        },
      },
    }),
  );
}
