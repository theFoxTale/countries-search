/**
 * Поля сырого ответа от countries.dev /name/{query}, которые будут использоваться в приложении.
 */
export type RawCountry = {
  name: string;
  nativeName?: string | null;
  demonym?: string | null;
  flag?: string | null;
  flags?: { png?: string | null; svg?: string | null } | null;
  capital?: string | null;
  region?: string | null;
  subregion?: string | null;
  population?: number | null;
  area?: number | null;
  borders?: string[] | null;
  languages?: { name: string }[] | null;
  currencies?: { code: string; name: string; symbol?: string | null }[] | null;
};

export type CurrencyInfo = {
  code: string;
  name: string;
  symbol: string | null;
};

/**
 * Данные о стране, подготовленные для отображения в UI.
 */
export type Country = {
  name: string;
  nativeName: string | null;
  demonym: string | null;
  flag: string | null;
  flagSvg: string | null;
  flagPng: string | null;
  capital: string | null;
  region: string | null;
  subregion: string | null;
  population: number | null;
  area: number | null;
  borders: string[];
  languages: string[];
  currencies: CurrencyInfo[];
};
