import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { FilterKey } from '../constants/filter-key.enum';
import { FilterOption } from '../models/filter-option.model';
import { SavedFilterJson } from '../models/saved-filter.model';
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
    (state, activeFilters: SavedFilterJson) => ({
      ...state,
      activeFilters,
    }),
  );

  readonly updateActiveFilter = this.updater(
    (state, activeFilter: SavedFilterJson) => ({
      ...state,
      activeFilters: { ...state.activeFilters, ...activeFilter },
    }),
  );

  readonly deleteActiveFilter = this.updater((state, filterKey: FilterKey) => ({
    ...state,
    activeFilters: Object.keys(state.activeFilters).reduce(
      (acc: Record<string, unknown>, key) => {
        if (key !== filterKey) {
          acc[key as keyof typeof state.activeFilters] =
            state.activeFilters[key as keyof typeof state.activeFilters];
        }
        return acc;
      },
      {} as Record<string, unknown>,
    ),
  }));
}
