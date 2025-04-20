import { FilterKey } from '../constants/filter-key.enum';

export type FilterForm = CountryFilter | DateFilter;

interface CountryFilter {
  [FilterKey.Country]: string[];
}

interface DateFilter {
  [FilterKey.Date]: string;
}
