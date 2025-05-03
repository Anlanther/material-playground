import { FilterConfig } from './filter-config.model';
import { FilterForm } from './filter-form.model';

export interface ActiveFilterConfig {
  filterForm: FilterForm;
  filterConfig: FilterConfig;
}
