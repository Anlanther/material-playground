import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { map } from 'rxjs';
import { FilterKey } from '../constants/filter-key.enum';
import { FilterOption } from '../models/filter-option.model';
import { FilterConfigService } from '../services/filter-config.service';
import { DEFAULT_STATE, FormFilterState } from './form-filter-state';

@Injectable({
  providedIn: 'root',
})
export class FormFilterStateService extends ComponentStore<FormFilterState> {
  activeFilters$ = this.select((state) => state.activeFilters);
  filterOptions$ = this.select((state) => state.filterOptions);

  // New selector to map active filters to array format
  activeFiltersArray$ = this.activeFilters$.pipe(
    map((filters) =>
      Object.entries(filters).map(([key, value]) => ({
        key: key as FilterKey,
        value,
      })),
    ),
  );

  constructor(private filterConfigService: FilterConfigService) {
    super(DEFAULT_STATE);
  }

  readonly setActiveFilter = this.updater((state, filterKey: FilterKey) => ({
    ...state,
    activeFilters: {
      ...state.activeFilters,
      [filterKey]: this.filterConfigService.createActiveConfig(filterKey),
    },
  }));

  readonly deleteActiveFilter = this.updater((state, filterKey: FilterKey) => ({
    ...state,
    activeFilters: Object.fromEntries(
      Object.entries(state.activeFilters).filter(([key]) => key !== filterKey),
    ),
  }));

  readonly updateActiveFilterValue = this.updater(
    (state, update: { key: FilterKey; value: any }) => ({
      ...state,
      activeFilters: {
        ...state.activeFilters,
        [update.key]: {
          ...state.activeFilters[update.key],
          filterForm: {
            key: update.key,
            [update.key]: update.value,
          },
        },
      },
    }),
  );

  readonly setFilterOptions = this.updater(
    (state, options: FilterOption[]) => ({
      ...state,
      filterOptions: options,
    }),
  );

  readonly addFilterOption = this.updater((state, filterKey: FilterKey) => ({
    ...state,
    filterOptions: [
      ...state.filterOptions,
      {
        key: filterKey,
        displayName:
          this.filterConfigService.getFilterConfig(filterKey).displayName,
      },
    ],
  }));

  readonly removeFilterOption = this.updater((state, filterKey: FilterKey) => ({
    ...state,
    filterOptions: state.filterOptions.filter(
      (option) => option.key !== filterKey,
    ),
  }));
}
