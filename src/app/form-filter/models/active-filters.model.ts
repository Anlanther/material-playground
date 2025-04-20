import { FilterKey } from '../constants/filter-key.constant';

export type ActiveFilter = CountryFilter | DateFilter;

interface CountryFilter {
  key: FilterKey.Country;
}

interface DateFilter {
  key: FilterKey.Date;
}
