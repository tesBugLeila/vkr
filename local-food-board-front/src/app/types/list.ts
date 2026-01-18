export interface IPagination {
  total: number;
  page: number;
  pages: number;
}
export interface IList<T> {
  posts: T[];
  pagination: IPagination;
}
