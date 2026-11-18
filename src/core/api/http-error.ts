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
export class HttpError extends Error {
  public readonly status: number; // HTTP-статус ответа (4xx/5xx, кроме 404).
  public readonly url?: string; // URL, на который был сделан запрос.

  constructor(status: number, url?: string) {
    const errorMessage = `HTTP ${String(status)}${url ? ` for ${url}` : ''}`;
    super(errorMessage);

    this.name = 'HttpError';
    this.status = status;
    this.url = url;
  }
}
