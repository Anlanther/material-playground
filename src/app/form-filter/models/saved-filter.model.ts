import { FilterKey } from '../constants/filter-key.enum';
import { ActiveFilterConfig } from './active-filter-config.model';

export type SavedFilterJson = Partial<{
  [key in FilterKey]: ActiveFilterConfig;
}>;
