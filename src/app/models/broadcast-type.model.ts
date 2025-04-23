export interface FilterBroadcast {
  contextType: 'Filter';
  filter: BroadcastPayload[];
}

export type BroadcastPayload = CountryPayload | DatePayload | IndustryPayload;

export enum FilterBroadcastKey {
  Country = 'country',
  Date = 'date',
  Industry = 'industry',
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
  industries: string[];
}
