import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { distinctUntilChanged, Observable, Subscription } from 'rxjs';
import { FilterBroadcast } from '../models/broadcast-type.model';
import { FilterKey } from './constants/filter-key.enum';
import { ActiveFilterConfig } from './models/active-filter-config.model';
import { FilterOption } from './models/filter-option.model';
import { BroadcastFactoryService } from './services/broadcast-factory.service';
import { FilterConfigService } from './services/filter-config.service';
import { FormFilterStateService } from './state/form-filter-state.service';

@Component({
  standalone: false,
  selector: 'app-form-filter',
  templateUrl: './form-filter.component.html',
  styleUrl: './form-filter.component.scss',
})
export class FormFilterComponent implements OnDestroy {
  optionsForm = new FormControl('');
  filterForm = new FormGroup({});
  subs = new Subscription();

  readonly activeFilters$: Observable<
    { key: FilterKey; value: ActiveFilterConfig }[]
  >;
  readonly filterOptions$: Observable<FilterOption[]>;

  get filterKey() {
    return FilterKey;
  }

  constructor(
    private stateService: FormFilterStateService,
    private configService: FilterConfigService,
    private broadcastFactory: BroadcastFactoryService,
  ) {
    this.activeFilters$ = this.stateService.activeFiltersArray$;
    this.filterOptions$ = this.stateService.filterOptions$;

    this.initializeFilters();
    this.setupSubscriptions();
  }

  private initializeFilters() {
    const allFilterKeys = Object.values(FilterKey);
    const filterOptions = allFilterKeys.map((key) => ({
      key,
      displayName: this.configService.getFilterConfig(key).displayName,
    }));
    this.stateService.setFilterOptions(filterOptions);
  }

  private setupSubscriptions() {
    // Handle filter selection
    this.subs.add(
      this.optionsForm.valueChanges
        .pipe(distinctUntilChanged())
        .subscribe((value) => {
          if (!value) return;

          const filterKey = value as FilterKey;
          this.stateService.removeFilterOption(filterKey);
          this.stateService.setActiveFilter(filterKey);
          this.optionsForm.reset();
        }),
    );

    // Handle filter value changes
    this.subs.add(
      this.filterForm.valueChanges
        .pipe(distinctUntilChanged())
        .subscribe((value) => {
          const broadcast: FilterBroadcast = {
            contextType: 'Filter',
            filter: this.broadcastFactory.getBroadcastPayload(value),
          };

          Object.entries(value).forEach(([key, value]) => {
            this.stateService.updateActiveFilterValue({
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

  deleteFilter(filterKey: FilterKey) {
    this.stateService.addFilterOption(filterKey);
    this.stateService.deleteActiveFilter(filterKey);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
