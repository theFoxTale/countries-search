/**
 * Функция высшего порядка: возвращает обёртку, которая откладывает вызов `fn` на `delay` мс.
 * Каждый повторный вызов обёртки сбрасывает таймер и перезапускает его заново.
 *
 * https://learn.javascript.ru/call-apply-decorators#dekorator-debounce
 *
 * @param fn — целевая функция
 * @param delay — задержка в миллисекундах (0 = следующий tick event loop)
 * @returns обёртка с той же сигнатурой аргументов; `this` не пробрасывается
 */
export function debounce<Arguments extends unknown[]>(
  fn: (...arguments_: Arguments) => void,
  delay: number,
): ((...arguments_: Arguments) => void) & { cancel: () => void } {
  let timerId: ReturnType<typeof setTimeout> | undefined;

  const debounced = (...arguments_: Arguments) => {
    if (timerId !== undefined) clearTimeout(timerId);
    timerId = setTimeout(() => {
      fn(...arguments_);
    }, delay);
  };

  // Метод отмены таймера без перезапуска
  debounced.cancel = () => {
    if (timerId === undefined) {
      return;
    }

    clearTimeout(timerId);
    timerId = undefined;
  };

  return debounced;
}
