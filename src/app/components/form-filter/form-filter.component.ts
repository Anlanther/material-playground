import { Component, input, OnDestroy, OnInit, output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { distinctUntilChanged, map, Observable, Subscription, tap } from 'rxjs';
import { FilterBroadcast } from '../../models/broadcast-type.model';
import { WidgetInput } from '../../models/widget-input.model';
import { FILTER_DEFAULTS } from './constants/filter-default-map.constant';
import { FilterKey } from './constants/filter-key.enum';
import { ActiveFilterConfig } from './models/active-filter-config.model';
import { FilterOption } from './models/filter-option.model';
import { SavedFilter } from './models/saved-filter.model';
import { BroadcastFactoryService } from './services/broadcast-factory.service';
import { FormFilterStateService } from './state/form-filter-state.service';

@Component({
  standalone: false,
  selector: 'app-form-filter',
  templateUrl: './form-filter.component.html',
  styleUrl: './form-filter.component.scss',
})
export class FormFilterComponent implements OnInit, OnDestroy {
  widgetInput = input.required<WidgetInput>();
  savedState = output<SavedFilter>();

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

    this.subs.add(
      this.stateService.activeFilters$
        .pipe(
          distinctUntilChanged((prev, curr) => {
            return JSON.stringify(prev) === JSON.stringify(curr);
          }),
          tap((activeFilters) => {
            this.savedState.emit(activeFilters);
          }),
        )
        .subscribe(),
    );
  }

  ngOnInit(): void {
    this.initialiseFilters();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  initialiseFilters() {
    const savedFilters = this.widgetInput().state as SavedFilter;

    const inactiveFilterOptions: FilterOption[] = Object.entries(
      FILTER_DEFAULTS,
    )
      .filter(([key]) => !savedFilters[key as FilterKey])
      .map(([key, { filterConfig }]) => ({
        key: key as FilterKey,
        displayName: filterConfig.displayName,
      }));

    const activeFilters: SavedFilter = Object.entries(savedFilters).reduce(
      (acc, [key, value]) => {
        const defaultConfig = FILTER_DEFAULTS[key as FilterKey];
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
      {} as SavedFilter,
    );
    this.stateService.initialiseActiveFilters(activeFilters);

    this.stateService.initialiseFilterOptions(inactiveFilterOptions);
  }

  addFilter(filterKey: FilterKey) {
    const filterConfig = FILTER_DEFAULTS[filterKey];

    if (!filterConfig) {
      console.error(`Filter option with key ${filterKey} not found`);
      return;
    }

    const filter: SavedFilter = {
      [filterKey]: {
        filterForm: filterConfig.filterForm,
        filterConfig: filterConfig.filterConfig,
      },
    };

    this.stateService.setActiveFilter(filter);
  }

  deleteFilter(filterKey: FilterKey) {
    const filterOptionToAddConfig = FILTER_DEFAULTS[filterKey];

    if (!filterOptionToAddConfig) {
      console.error(`Filter option with key ${filterKey} not found`);
      return;
    }
    const filterOptionToAdd: FilterOption = {
      key: filterKey,
      displayName: filterOptionToAddConfig.filterConfig.displayName,
    };

    this.stateService.addFilterOption(filterOptionToAdd);
    this.stateService.deleteActiveFilter(filterKey);
  }
}
