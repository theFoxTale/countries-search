import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { searchCountries } from '@core';
import type { RawCountry } from '@core';

/**
 * Мок fetch, который:
 * - возвращает Promise с задержкой,
 * - abort() на переданном signal = reject с AbortError,
 * - отменяет внутренний setTimeout.
 *
 * Без реакции на signal тест не отличит настоящую отмену от «просто проигнорировали устаревший ответ».
 */
function mockFetchWithDelays(delays: Record<string, number>, fixtures: Record<string, RawCountry[]>) {
  return vi.fn((url: string, init?: RequestInit) => {
    const query = decodeURIComponent(url.split('/').pop() ?? '');

    return new Promise((resolve, reject) => {
      const t = setTimeout(() => {
        resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(fixtures[query] ?? []),
        });
      }, delays[query] ?? 0);
      init?.signal?.addEventListener('abort', () => {
        clearTimeout(t);
        reject(new DOMException('Aborted', 'AbortError'));
      });
    });
  });
}

describe('race: устаревший ответ не перетирает актуальный', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  // ============================================================
  // 1. Главный сценарий: abort() отменяет p1, p2 выполняется
  // ============================================================
  describe('отмена устаревшего запроса через AbortController', () => {
    it('p1 (sp, 300ms) отменяется AbortError; p2 (spain, 50ms) выполняется с данными spain', async () => {
      const fixtures: Record<string, RawCountry[]> = {
        sp: [{ name: 'Spain-old' }],
        spain: [{ name: 'Spain-new' }],
      };
      const fetchMock = mockFetchWithDelays({ sp: 300, spain: 50 }, fixtures);
      vi.stubGlobal('fetch', fetchMock);

      const ac1 = new AbortController();
      const p1 = searchCountries('sp', ac1.signal);

      // 20ms - p1 в полёте, но до собственного резолва (300ms) далеко
      await vi.advanceTimersByTimeAsync(20);

      // пользователь ввёл ещё символ - отменяем старый запрос
      ac1.abort();

      // p1 отменён = reject AbortError.
      await expect(p1).rejects.toMatchObject({ name: 'AbortError' });

      // новый запрос (spain) выполняется быстрее (50ms), хотя отправлен позже
      const ac2 = new AbortController();
      const p2 = searchCountries('spain', ac2.signal);

      await vi.advanceTimersByTimeAsync(100);

      const result = await p2;
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('Spain-new');
    });

    it('иллюстрация гонки: БЕЗ abort() p1 (300ms) выполняется позже p2 (50ms)', async () => {
      const fixtures: Record<string, RawCountry[]> = {
        sp: [{ name: 'Spain-old' }],
        spain: [{ name: 'Spain-new' }],
      };
      const fetchMock = mockFetchWithDelays({ sp: 300, spain: 50 }, fixtures);
      vi.stubGlobal('fetch', fetchMock);

      const ac1 = new AbortController();
      const p1 = searchCountries('sp', ac1.signal);

      await vi.advanceTimersByTimeAsync(10);

      const ac2 = new AbortController();
      const p2 = searchCountries('spain', ac2.signal);

      // p2 (50ms) резолвится первой
      await vi.advanceTimersByTimeAsync(50);
      await expect(p2).resolves.toMatchObject([{ name: 'Spain-new' }]);

      // sp ещё в полёте - здесь в приложении без abort данные sp попали бы в UI
      await vi.advanceTimersByTimeAsync(300);
      await expect(p1).resolves.toMatchObject([{ name: 'Spain-old' }]);
    });
  });

  // ============================================================
  // 2. Sanity-check мока: реагирует на signal, как настоящий fetch
  // ============================================================
  describe('мок fetch корректно реагирует на signal', () => {
    it('abort() до выполнения = reject AbortError', async () => {
      const fetchMock = mockFetchWithDelays({ sp: 300 }, { sp: [{ name: 'Spain' }] });
      vi.stubGlobal('fetch', fetchMock);

      const ac = new AbortController();
      const p = searchCountries('sp', ac.signal);

      // таймер уже зарегистрирован, но не сработал
      await vi.advanceTimersByTimeAsync(50);
      ac.abort();

      await expect(p).rejects.toMatchObject({ name: 'AbortError' });
    });

    it('без abort() = Promise выполнился нормально', async () => {
      const fetchMock = mockFetchWithDelays({ sp: 100 }, { sp: [{ name: 'Spain' }] });
      vi.stubGlobal('fetch', fetchMock);

      const ac = new AbortController();
      const p = searchCountries('sp', ac.signal);

      await vi.advanceTimersByTimeAsync(150);

      await expect(p).resolves.toHaveLength(1);
    });

    it('передаёт в fetch тот же signal (не копию)', async () => {
      const fetchMock = mockFetchWithDelays({ sp: 300 }, { sp: [] });
      vi.stubGlobal('fetch', fetchMock);

      const ac = new AbortController();
      const pending = searchCountries('sp', ac.signal);

      expect(fetchMock).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ signal: ac.signal }));

      ac.abort();
      await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
      await vi.advanceTimersByTimeAsync(0);
    });

    it('abort() после выполнения не ломает уже исполненный Promise', async () => {
      const fetchMock = mockFetchWithDelays({ sp: 50 }, { sp: [{ name: 'Spain' }] });
      vi.stubGlobal('fetch', fetchMock);

      const ac = new AbortController();
      const p = searchCountries('sp', ac.signal);

      await vi.advanceTimersByTimeAsync(100);
      await expect(p).resolves.toHaveLength(1);

      ac.abort();
      await expect(p).resolves.toHaveLength(1);
    });
  });
});
