import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { distinctUntilChanged, map, Observable, Subscription } from 'rxjs';
import { FilterBroadcast } from '../models/broadcast-type.model';
import { FILTER_DEFAULT_MAP } from './constants/filter-default-map.constant';
import { FilterKey } from './constants/filter-key.enum';
import { ActiveFilterConfig } from './models/active-filter-config.model';
import { FilterOption } from './models/filter-option.model';
import { SavedFilterJson } from './models/saved-filter.model';
import { BroadcastFactoryService } from './services/broadcast-factory.service';
import { FormFilterStateService } from './state/form-filter-state.service';

const SAVED_FILTERS: SavedFilterJson = {
  [FilterKey.Country]: {
    filterForm: {
      [FilterKey.Country]: ['USA', 'Canada'],
      key: FilterKey.Country,
    },
    filterConfig: {
      displayName: 'Country',
    },
  },
};

@Component({
  standalone: false,
  selector: 'app-form-filter',
  templateUrl: './form-filter.component.html',
  styleUrl: './form-filter.component.scss',
})
export class FormFilterComponent implements OnDestroy {
  activeFilters$: Observable<{ key: FilterKey; value: ActiveFilterConfig }[]>;
  filterOptions$: Observable<FilterOption[]>;

  optionsForm = new FormControl('');
  filterForm = new FormGroup({});
  subs = new Subscription();

  get filterKey() {
    return FilterKey;
  }

  constructor(
    private stateService: FormFilterStateService,
    private broadcastFactory: BroadcastFactoryService,
  ) {
    this.activeFilters$ = this.stateService.activeFilters$.pipe(
      map((filterConfig) =>
        Object.entries(filterConfig).map(([key, value]) => ({
          key: key as FilterKey,
          value,
        })),
      ),
    );
    this.filterOptions$ = this.stateService.filterOptions$;

    this.initialiseFilters();

    this.subs.add(
      this.optionsForm.valueChanges
        .pipe(distinctUntilChanged())
        .subscribe((value) => {
          if (!value) {
            return;
          }
          const filterKey = value as FilterKey;
          this.stateService.deleteFilterOption(filterKey);
          this.addFilter(filterKey);
          this.optionsForm.reset();
        }),
    );

    this.subs.add(
      this.filterForm.valueChanges
        .pipe(distinctUntilChanged())
        .subscribe((value) => {
          const broadcast: FilterBroadcast = {
            contextType: 'Filter',
            filter: this.broadcastFactory.getBroadcastPayload(value),
          };

          Object.entries(value).forEach(([key, value]) => {
            this.stateService.updateActiveFilter({
              key: key as FilterKey,
              value,
            });
          });

          console.log(
            'Filter FormValue',
            value,
            '\nBroadcast Payload:',
            broadcast,
          );
        }),
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  initialiseFilters() {
    const inactiveFilterOptions = Array.from(FILTER_DEFAULT_MAP.entries())
      .filter(([key]) => !SAVED_FILTERS[key])
      .map(([key, { filterConfig }]) => ({
        key: key,
        displayName: filterConfig.displayName,
      }));

    const activeFilters: SavedFilterJson = Object.entries(SAVED_FILTERS).reduce(
      (acc, [key, value]) => {
        const defaultConfig = FILTER_DEFAULT_MAP.get(key as FilterKey);
        if (!defaultConfig) {
          console.error(`Filter option with key ${key} not found`);
          return acc;
        }
        acc[key as FilterKey] = {
          filterForm: value.filterForm,
          filterConfig: defaultConfig.filterConfig,
        };
        return acc;
      },
      {} as SavedFilterJson,
    );
    this.stateService.initialiseActiveFilters(activeFilters);

    this.stateService.initialiseFilterOptions(inactiveFilterOptions);
  }

  addFilter(key: FilterKey) {
    const filter: SavedFilterJson = {
      [key]: Object.fromEntries(FILTER_DEFAULT_MAP)[key],
    };

    this.stateService.setActiveFilter(filter);
  }

  deleteFilter(key: FilterKey) {
    const filterOptionToAddConfig = FILTER_DEFAULT_MAP.get(key);

    if (!filterOptionToAddConfig) {
      console.error(`Filter option with key ${key} not found`);
      return;
    }
    const filterOptionToAdd: FilterOption = {
      key,
      displayName: filterOptionToAddConfig.filterConfig.displayName,
    };

    this.stateService.addFilterOption(filterOptionToAdd);
    this.stateService.deleteActiveFilter(key);
  }
}
