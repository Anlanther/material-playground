import { FilterKey } from '../constants/filter-key.enum';

export type FilterForm = CountryFilter | DateFilter | IndustryFilter;

export interface CountryFilter {
  key: FilterKey.Country;
  [FilterKey.Country]: string[];
}

export interface DateFilter {
  key: FilterKey.Date;
  [FilterKey.Date]: string;
}

export interface IndustryFilter {
  key: FilterKey.Industry;
  [FilterKey.Industry]: string[];
}
