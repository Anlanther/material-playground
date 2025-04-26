import { FilterKey } from '../form-filter/constants/filter-key.enum';
import { SavedFilter } from '../form-filter/models/saved-filter.model';
import { WidgetInput } from '../models/widget-input.model';

const SAVED_FILTERS: SavedFilter = {
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

export const FILTER_INPUT: WidgetInput = {
  id: '1',
  state: SAVED_FILTERS,
};
