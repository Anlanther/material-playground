export interface SelectedFilters {
  [key: string]: string[];
}

export interface SelectedFilter {
  rootId: string;
  selectedFilters: {
    id: string;
    name: string;
  }[];
}
