import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from '@core';

describe('debounce', () => {
  // Fake timers включаются для всех тестов блока:
  // setTimeout и clearTimeout становятся управляемыми вручную.
  beforeEach(() => {
    vi.useFakeTimers();
  });

  // Возвращаем реальные таймеры, иначе следующий файл с тестами унаследует
  // fake timers и «зависнет» на асинхронных операциях.
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // ============================================================
  // 1. Базовая задержка
  // ============================================================
  describe('базовая задержка', () => {
    it('fn не вызывается сразу после debounced()', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();

      expect(fn).not.toHaveBeenCalled();
    });

    it('fn вызывается ровно один раз через время delay', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      vi.advanceTimersByTime(99);
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1); // всего 100
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('после срабатывания fn можно вызвать снова', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 50);

      debounced();
      vi.advanceTimersByTime(50);
      expect(fn).toHaveBeenCalledTimes(1);

      debounced();
      expect(fn).toHaveBeenCalledTimes(1); // ещё не сработало 2-ой раз
      vi.advanceTimersByTime(50);
      expect(fn).toHaveBeenCalledTimes(2); // уже сработало 2-ой раз
    });

    it('если delay = 0, то fn вызывается на следующем такте, не синхронно', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 0);

      debounced();
      expect(fn).not.toHaveBeenCalled();

      vi.runAllTimers();
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================
  // 2. Сброс таймера
  // ============================================================
  describe('сброс таймера', () => {
    it('два вызова подряд в пределах delay приводят к тому, что fn вызывается 1 раз', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      vi.advanceTimersByTime(50);
      debounced(); // сбрасывает таймер
      vi.advanceTimersByTime(50);
      // прошло 100 от первого, но только 50 после сброса, поэтому fn ещё не вызван
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(50); // теперь 100 от сброса
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('много вызовов подряд вызывают fn 1 раз через delay от последнего вызова', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      for (let i = 0; i < 10; i++) {
        debounced();
        vi.advanceTimersByTime(10);
      }
      // прошло 100 от начала, но последний вызов — 10мс назад
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(90);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('вызовы, разнесённые на время, превышающее delay, дают N независимых срабатываний', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 50);

      debounced();
      vi.advanceTimersByTime(50);
      debounced();
      vi.advanceTimersByTime(50);

      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('разные debounced-обёртки имеют независимые друг от друга таймеры', () => {
      const fn1 = vi.fn();
      const fn2 = vi.fn();
      const debounced1 = debounce(fn1, 100);
      const debounced2 = debounce(fn2, 100);

      debounced1();
      debounced2();
      vi.advanceTimersByTime(50);
      debounced1(); // для fn1 сбрасывается таймер
      vi.advanceTimersByTime(50);

      expect(fn2).toHaveBeenCalledTimes(1); // fn2 сработал на 100
      expect(fn1).not.toHaveBeenCalled(); // fn1 ждёт ещё 50 после сброса

      vi.advanceTimersByTime(50);
      expect(fn1).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================
  // 3. Проброс аргументов и возврата
  // ============================================================
  describe('проброс аргументов', () => {
    it('fn получает аргументы из последнего вызова', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced('first');
      vi.advanceTimersByTime(50);
      debounced('second');
      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('second');
    });

    it('пробрасываются все аргументы (несколько разных, в частности объект)', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 50);
      const payload = { id: 1, tags: ['a', 'b'] };

      debounced('spain', 42, payload);
      vi.advanceTimersByTime(50);

      expect(fn).toHaveBeenCalledWith('spain', 42, payload);
    });
  });
});
