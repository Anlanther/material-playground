import { SavedFilter } from '../models/saved-filter.model';
import { FilterKey } from './filter-key.enum';

export const FILTER_DEFAULTS: SavedFilter = {
  [FilterKey.Country]: {
    filterForm: { [FilterKey.Country]: [], key: FilterKey.Country },
    filterConfig: {
      displayName: 'Country',
      expanded: true,
    },
  },
  [FilterKey.Date]: {
    filterForm: { [FilterKey.Date]: '2023-10-01', key: FilterKey.Date },
    filterConfig: {
      displayName: 'Date',
    },
  },
};
