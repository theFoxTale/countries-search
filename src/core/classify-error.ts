/**
 * Результат классификации ошибки для контроллера.
 * - `abort`   - отмена нашего же запроса; UI игнорирует
 * - `timeout` - истёк `AbortSignal.timeout`; показать сообщение + «Повторить»
 * - `http`    - `HttpError` (все коды кроме 404); показать + «Повторить»
 * - `unknown` - сеть, TypeError или что-то ещё; показать + «Повторить»
 */
export type ClassifiedError =
  | { kind: 'abort' }
  | { kind: 'timeout'; message: string }
  | { kind: 'http'; status: number; message: string }
  | { kind: 'unknown'; message: string };

/**
 * Различает типы ошибок при выполнении запроса.
 *
 * Ветка abort умышленно не несёт сообщения:
 * `userMessage === null` - это контракт для UI «ничего не показывать».
 *
 * @param _error — то что попало в catch, может быть чем угодно
 */
export function classifyError(_error: unknown): ClassifiedError {
  throw new Error('not implemented');
}
