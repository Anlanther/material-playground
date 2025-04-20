import { FilterOption } from '../models/filter-option.model';
import { SavedFilterJson } from '../models/saved-filter.model';

export interface FormFilterState {
  activeFilters: SavedFilterJson;
  filterOptions: FilterOption[];
}

export const DEFAULT_STATE: FormFilterState = {
  activeFilters: {},
  filterOptions: [],
};
