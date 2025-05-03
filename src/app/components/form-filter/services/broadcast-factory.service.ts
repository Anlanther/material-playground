import { Injectable } from '@angular/core';
import {
  BroadcastPayload,
  FilterBroadcastKey,
} from '../../../models/broadcast-type.model';
import { FilterKey } from '../constants/filter-key.enum';

@Injectable({
  providedIn: 'root',
})
export class BroadcastFactoryService {
  private payloadHandlers: Record<
    FilterKey,
    (value: unknown) => BroadcastPayload
  > = {
    [FilterKey.Country]: (value) => this.getCountryPayload(value),
    [FilterKey.Date]: (value) => this.getDatePayload(value),
    [FilterKey.Industry]: (value) => this.getIndustryPayload(value),
    [FilterKey.Company]: (value) => this.getCompanyPayload(value),
    [FilterKey.Rating]: (value) => this.getRatingPayload(value),
  };

  getBroadcastPayload(value: Partial<{}>): BroadcastPayload[] {
    return Object.entries(value).reduce<BroadcastPayload[]>(
      (acc, [key, value]) => {
        const filterKey = key as FilterKey;

        const handler = this.payloadHandlers[filterKey];
        if (handler) {
          acc.push(handler(value));
        }

        return acc;
      },
      [],
    );
  }

  private getCountryPayload(value: unknown): BroadcastPayload {
    const countries = value as string[];

    return {
      key: FilterBroadcastKey.Country,
      countries,
    };
  }

  private getIndustryPayload(value: unknown): BroadcastPayload {
    const industry = value as string;

    return {
      key: FilterBroadcastKey.Industry,
      industry,
    };
  }

  private getCompanyPayload(value: unknown): BroadcastPayload {
    const companies = value as string[];

    return {
      key: FilterBroadcastKey.Company,
      companies,
    };
  }

  private getDatePayload(value: unknown): BroadcastPayload {
    const date = value as string;

    return {
      key: FilterBroadcastKey.Date,
      date,
    };
  }

  private getRatingPayload(value: unknown): BroadcastPayload {
    const ratings = value as string[];

    return {
      key: FilterBroadcastKey.Rating,
      ratings,
    };
  }
}
