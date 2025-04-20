export interface FilterBroadcast {
  contextType: 'Filter';
  filter: BroadcastPayload[];
}

export type BroadcastPayload = CountryPayload | DatePayload;

export enum FilterBroadcastKey {
  Country = 'country',
  Date = 'date',
}

interface CountryPayload {
  key: FilterBroadcastKey.Country;
  countries: string[];
}

interface DatePayload {
  key: FilterBroadcastKey.Date;
  date: string;
}
