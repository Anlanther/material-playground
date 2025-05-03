import { FilterKey } from '../constants/filter-key.enum';

export type FilterForm =
  | CountryFilter
  | DateFilter
  | IndustryFilter
  | CompanyFilter
  | RatingFilter;

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
  [FilterKey.Industry]: string;
}

export interface CompanyFilter {
  key: FilterKey.Company;
  [FilterKey.Company]: string[];
}

export interface RatingFilter {
  key: FilterKey.Rating;
  [FilterKey.Rating]: { a: boolean; b: boolean; c: boolean };
}
