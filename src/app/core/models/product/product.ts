/**
 * Financial product as exposed by the API.
 * Dates travel as ISO calendar strings (`YYYY-MM-DD`), never as `Date`,
 * to avoid timezone shifts when serializing.
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  logo: string;
  date_release: string;
  date_revision: string;
}

/** PUT body: the id goes in the URL and cannot change. */
export type ProductUpdate = Omit<Product, 'id'>;
