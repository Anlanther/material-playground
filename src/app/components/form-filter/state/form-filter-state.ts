import { FilterOption } from '../models/filter-option.model';
import { SavedFilter } from '../models/saved-filter.model';

export interface FormFilterState {
  activeFilters: SavedFilter;
  filterOptions: FilterOption[];
}

export const DEFAULT_STATE: FormFilterState = {
  activeFilters: {},
  filterOptions: [],
};
