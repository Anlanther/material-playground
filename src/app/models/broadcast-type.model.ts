export interface FilterBroadcast {
  contextType: 'Filter';
  filter: BroadcastPayload[];
}

export type BroadcastPayload =
  | CountryPayload
  | DatePayload
  | IndustryPayload
  | CompanyPayload;

export enum FilterBroadcastKey {
  Country = 'country',
  Date = 'date',
  Industry = 'industry',
  Company = 'company',
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
