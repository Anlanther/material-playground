import { FilterKey } from '../constants/filter-key.enum';

export type FilterForm = CountryFilter | DateFilter;

export interface CountryFilter {
  key: FilterKey.Country;
  [FilterKey.Country]: string[];
}

export interface DateFilter {
  key: FilterKey.Date;
  [FilterKey.Date]: string;
}
