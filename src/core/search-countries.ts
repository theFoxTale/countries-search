import type { Country } from './types';

const BASE_URL = 'https://countries.dev/name';

/**
 * Запрашивает страны по имени через countries.dev.
 *
 * Контракт:
 * - response.ok === true          - RawCountry[] маппится в Country[].
 * - response.status === 404       - возвращает [] (этот статус значит, что совпадений нет).
 * - response.ok === false,
 *   response.status === 404       - бросает HttpError.
 * - остальные возможные ошибки пробрасываются как есть.
 *
 * @param _query   - строка поиска; должна быть уже trim'лена вызывающим
 * @param _signal  - сигнал для прерывания поиска (AbortSignal)
 * @returns        - массив нормализованных стран (может быть пустым)
 */
export function searchCountries(_query: string, _signal: AbortSignal): Promise<Country[]> {
  console.log('BASE_URL', BASE_URL);
  return Promise.reject(new Error('not implemented'));
}
