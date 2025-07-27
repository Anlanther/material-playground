export interface SelectedFilters {
  [key: string]: {
    id: string;
    name: string;
    rootId: string;
    rootName: string;
  }[];
}
