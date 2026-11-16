import type { Country, CurrencyInfo, RawCountry } from './types';

/**
 * Преобразует сырой ответ countries.dev в данные для отображения в UI.
 * Чистая функция: не мутирует вход, не делает запросов, детерминирована.
 *
 * Отсутствующие в ответе от API опциональные поля нормализуются в `null`
 * для строк и чисел, в `[]` для массивов, чтобы UI работал корректно.
 *
 * @param raw — один элемент из ответа `GET https://countries.dev/name/{query}`
 * @returns нормализованная страна для UI
 */
export function mapCountryResponse(raw: RawCountry): Country {
  return {
    name: raw.name,

    nativeName: valueOrNull(raw.nativeName),
    demonym: valueOrNull(raw.demonym),

    flag: valueOrNull(raw.flag),
    flagSvg: valueOrNull(raw.flags?.svg),
    flagPng: valueOrNull(raw.flags?.png),

    capital: valueOrNull(raw.capital),
    region: valueOrNull(raw.region),
    subregion: valueOrNull(raw.subregion),

    population: valueOrNull(raw.population),
    area: valueOrNull(raw.area),

    borders: raw.borders ? [...raw.borders] : [],
    languages: toLanguageNames(raw.languages),
    currencies: toCurrencies(raw.currencies),
  };
}

/**
 * Нормализует строковое и числовое поле в T или null (если значение не определено).
 */
function valueOrNull<T>(value: T | null | undefined): T | null {
  return value ?? null;
}

/**
 * Сводит languages из массива объектов { name } к массиву имён.
 * Не заданное и не определённое значение становится пустым массивом.
 */
function toLanguageNames(raw: RawCountry['languages']): string[] {
  return raw ? raw.map((lang) => lang.name) : [];
}

/**
 * Сводит массив объектов currencies к типу CurrencyInfo, нормализуя отсутствующий `symbol`
 * Не заданное и не определённое значение становится пустым массивом.
 */
function toCurrencies(raw: RawCountry['currencies']): CurrencyInfo[] {
  if (!raw) return [];

  return raw.map((current) => ({
    code: current.code,
    name: current.name,
    symbol: current.symbol ?? null,
  }));
}
