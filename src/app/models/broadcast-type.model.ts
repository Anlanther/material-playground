export interface FilterBroadcast {
  contextType: 'Filter';
  filter: BroadcastPayload[];
}

export type BroadcastPayload =
  | CountryPayload
  | DatePayload
  | IndustryPayload
  | CompanyPayload
  | RatingPayload;

export enum FilterBroadcastKey {
  Country = 'country',
  Date = 'date',
  Industry = 'industry',
  Company = 'company',
  Rating = 'rating',
}

interface CountryPayload {
  key: FilterBroadcastKey.Country;
  countries: string[];
}

interface DatePayload {
  key: FilterBroadcastKey.Date;
  date: string;
}

interface IndustryPayload {
  key: FilterBroadcastKey.Industry;
  industry: string;
}

interface CompanyPayload {
  key: FilterBroadcastKey.Company;
  companies: string[];
}

interface RatingPayload {
  key: FilterBroadcastKey.Rating;
  ratings: string[];
}
