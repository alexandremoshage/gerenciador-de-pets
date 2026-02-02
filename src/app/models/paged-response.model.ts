export interface PagedResponse<T> {
  page: number;
  size: number;
  total: number;
  pageCount: number;
  content: T[];
}