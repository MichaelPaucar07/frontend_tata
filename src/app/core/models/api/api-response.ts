/** ASI RESPONDE EL GET DE `/bp/products`: `{ data: [...] }`. */
export interface ApiListResponse<T> {
  data: T[];
}

/** ASI RESPONDEN EL POST Y EL PUT: `{ message, data }`. */
export interface ApiResponse<T> {
  message: string;
  data: T;
}

/** LO QUE DEVUELVE EL BACKEND CUANDO ALGO SALE MAL (400 O 404). */
export interface ApiErrorResponse {
  name: string;
  message: string;
  errors?: unknown;
}
