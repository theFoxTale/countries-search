import type { Country, RawCountry } from './types';

/**
 * Преобразует сырой ответ countries.dev в данные для отображения в UI.
 * Чистая функция: не мутирует вход, не делает запросов, детерминирована.
 *
 * Отсутствующие в ответе от API опциональные поля нормализуются в `null`
 * для строк и чисел, в `[]` для массивов, чтобы UI работал корректно.
 *
 * @param _raw — один элемент из ответа `GET https://countries.dev/name/{query}`
 * @returns нормализованная страна для UI
 */
export function mapCountryResponse(_raw: RawCountry): Country {
  throw new Error('not implemented');
}
