/**
 * Данные о стране, подготовленные для отображения в UI.
 */

// Подробное описание страны (модальное окно)
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

export type CurrencyInfo = {
  code: string;
  name: string;
  symbol: string | null;
};

// Краткая информация (карточка в результатах поиска)
export type CountryCard = {
  name: string;
  flag: string;
  capital: string;
  region: string;
  population: number;
  languages: string[];
};
