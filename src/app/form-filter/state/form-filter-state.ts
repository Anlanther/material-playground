import { ActiveFilter } from '../models/active-filters.model';

export interface FormFilterState {
  activeFilters: ActiveFilter[];
}

export const DEFAULT_STATE: FormFilterState = {
  activeFilters: [],
};
