/**
 * Функция высшего порядка: возвращает обёртку, которая откладывает вызов `fn` на `delay` мс.
 * Каждый повторный вызов обёртки сбрасывает таймер и перезапускает его заново.
 *
 * @param _fn — целевая функция
 * @param _delay — задержка в миллисекундах (0 = следующий tick event loop)
 * @returns обёртка с той же сигнатурой аргументов; `this` не пробрасывается
 */
export function debounce<Arguments extends unknown[]>(
  _fn: (...arguments_: Arguments) => void,
  _delay: number,
): (...arguments_: Arguments) => void {
  throw new Error('not implemented');
}
