import { z } from 'zod';
import { RawCountrySchema } from './schemas';

import { HttpError } from './http-error.ts';
import { mapCountryResponse } from '../model/map-country-response.ts';

import type { Country } from '../model/types.ts';

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
 * @param query   - строка поиска; должна быть уже trim'лена вызывающим
 * @param signal  - сигнал для прерывания поиска (AbortSignal)
 * @returns        - массив нормализованных стран (может быть пустым)
 */
export async function searchCountries(query: string, signal: AbortSignal): Promise<Country[]> {
  // Описание encodeURIComponent - обеспечивает кодирование, чтобы символы вида +, '_', ' ' не сломали запрос:
  // https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
  const url = `${BASE_URL}/${encodeURIComponent(query)}`;

  const response = await fetch(url, { signal });

  if (response.status === 404) return [];
  if (!response.ok) throw new HttpError(response.status, url);

  const data: unknown = await response.json();

  const parsed = z.array(RawCountrySchema).safeParse(data);
  if (!parsed.success) {
    throw new Error('Unexpected countries.dev response shape', {
      cause: parsed.error,
    });
  }

  return parsed.data.map(mapCountryResponse);
}
