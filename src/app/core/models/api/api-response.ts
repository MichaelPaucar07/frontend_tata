/** GET /bp/products → `{ data: [...] }` */
export interface ApiListResponse<T> {
  data: T[];
}

/** POST / PUT /bp/products → `{ message, data }` */
export interface ApiResponse<T> {
  message: string;
  data: T;
}

/** 400 / 404 body returned by the backend. */
export interface ApiErrorResponse {
  name: string;
  message: string;
  errors?: unknown;
}
