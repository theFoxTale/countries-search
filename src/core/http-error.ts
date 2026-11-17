/**
 * Ошибка HTTP-ответа со статусом ≠ 2xx, кроме 404 (404 — «нет совпадений»,
 * обрабатывается в `searchCountries` как пустой результат).
 *
 * @example
 *   const err = new HttpError(500, 'https://countries.dev/name/spain');
 *   err instanceof Error      // true
 *   err.name                  // 'HttpError'
 *   err.status                // 500
 */
export class HttpError extends Error {}
