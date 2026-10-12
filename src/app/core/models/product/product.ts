/**
 * UN PRODUCTO FINANCIERO TAL CUAL LO ENVIA LA API.
 * LAS FECHAS LAS MANEJAMOS COMO TEXTO `YYYY-MM-DD` Y NO COMO `Date`;
 * ASI EVITAMOS QUE LA ZONA HORARIA NOS MUEVA UN DIA.
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  logo: string;
  date_release: string;
  date_revision: string;
}

/** PARA EL PUT: EL ID VA EN LA URL, NO EN EL BODY, Y NO SE PUEDE CAMBIAR. */
export type ProductUpdate = Omit<Product, 'id'>;
