import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FilterKey } from '../constants/filter-key.enum';
import { ActiveFilterConfig } from '../models/active-filter-config.model';
import { FilterConfig } from '../models/filter-config.model';
import { CountryFilter, DateFilter } from '../models/filter-form.model';

@Injectable({
  providedIn: 'root',
})
export class FilterConfigService {
  private filterConfigs = new BehaviorSubject<Record<FilterKey, FilterConfig>>({
    [FilterKey.Country]: {
      displayName: 'Country',
      expanded: true,
    },
    [FilterKey.Date]: {
      displayName: 'Date',
    },
  });

  private defaultValues = new BehaviorSubject<Record<FilterKey, any>>({
    [FilterKey.Country]: ['USA', 'Canada'],
    [FilterKey.Date]: new Date(),
  });

  getFilterConfig(key: FilterKey): FilterConfig {
    return this.filterConfigs.getValue()[key];
  }

  getDefaultValue(key: FilterKey): any {
    return this.defaultValues.getValue()[key];
  }

  registerFilter(key: FilterKey, config: FilterConfig, defaultValue: any) {
    const configs = this.filterConfigs.getValue();
    const values = this.defaultValues.getValue();

    this.filterConfigs.next({
      ...configs,
      [key]: config,
    });

    this.defaultValues.next({
      ...values,
      [key]: defaultValue,
    });
  }

  createActiveConfig(key: FilterKey): ActiveFilterConfig {
    const defaultValue = this.getDefaultValue(key);
    return {
      filterForm:
        key === FilterKey.Country
          ? ({ key, [FilterKey.Country]: defaultValue } as CountryFilter)
          : ({ key, [FilterKey.Date]: defaultValue } as DateFilter),
      filterConfig: this.getFilterConfig(key),
    };
  }
}
