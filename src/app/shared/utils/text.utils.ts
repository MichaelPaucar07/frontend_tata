/** QUITA TILDES Y PASA A MINUSCULAS, ASI "CREDITO" ENCUENTRA LO QUE ESTA ESCRITO CON TILDE. */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
