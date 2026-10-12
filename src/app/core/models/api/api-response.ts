/** ASI RESPONDE EL GET DE `/bp/products`: `{ data: [...] }`. */
export interface ApiListResponse<T> {
  data: T[];
}

/** ASI RESPONDEN EL POST Y EL PUT: `{ message, data }`. */
export interface ApiResponse<T> {
  message: string;
  data: T;
}
