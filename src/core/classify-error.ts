import { HttpError } from './http-error.ts';

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
 * @param error — то что попало в catch, может быть чем угодно
 */
export function classifyError(error: unknown): ClassifiedError {
  if (isAbortError(error)) {
    return { kind: 'abort' };
  }

  if (isTimeoutError(error)) {
    return { kind: 'timeout', message: error.message };
  }

  if (error instanceof HttpError) {
    return { kind: 'http', status: error.status, message: error.message };
  }

  return {
    kind: 'unknown',
    message: error instanceof Error ? error.message : getStringOrFallback(error),
  };
}

//-------------------------------------------------------------------------------------

type ErrorLike = Error | DOMException;

function isErrorLike(error: unknown): error is ErrorLike {
  return error instanceof Error || (typeof DOMException !== 'undefined' && error instanceof DOMException);
}

function isAbortError(error: unknown): error is ErrorLike {
  return isErrorLike(error) && error.name === 'AbortError';
}

function isTimeoutError(error: unknown): error is ErrorLike {
  return isErrorLike(error) && error.name === 'TimeoutError';
}

const FALLBACK_MESSAGE = 'Не удалось выполнить запрос';

function getStringOrFallback(error: unknown): string {
  const isString = typeof error === 'string' && error.length > 0;
  return isString ? error : FALLBACK_MESSAGE;
}
