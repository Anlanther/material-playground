export type DataSource = BaseDataSource[];

interface BaseDataSource {
  id: string;
  name: string;
  children?: BaseDataSource[];
}
