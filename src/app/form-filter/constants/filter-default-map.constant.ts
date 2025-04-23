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
    filterForm: { [FilterKey.Date]: '', key: FilterKey.Date },
    filterConfig: {
      displayName: 'Date',
    },
  },
  [FilterKey.Industry]: {
    filterForm: { [FilterKey.Industry]: '', key: FilterKey.Industry },
    filterConfig: {
      displayName: 'Industry',
    },
  },
  [FilterKey.Company]: {
    filterForm: { [FilterKey.Company]: [], key: FilterKey.Company },
    filterConfig: {
      displayName: 'Company',
    },
  },
};
