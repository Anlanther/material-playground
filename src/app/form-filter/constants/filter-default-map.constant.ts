import { ActiveFilterConfig } from '../models/active-filter-config.model';
import { FilterKey } from './filter-key.enum';

export const FILTER_DEFAULT_MAP: Map<FilterKey, ActiveFilterConfig> = new Map([
  [
    FilterKey.Country,
    {
      filterForm: { [FilterKey.Country]: [] },
      filterConfig: {
        displayName: 'Country',
      },
    },
  ],
  [
    FilterKey.Date,
    {
      filterForm: { [FilterKey.Date]: '2023-10-01' },
      filterConfig: {
        displayName: 'Date',
      },
    },
  ],
]);
