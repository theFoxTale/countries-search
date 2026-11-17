import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { searchCountries, HttpError } from '@core';

import { BELARUS, ISRAEL } from '../fixtures/countries.ts';

/**
 * Функции для работы с моком fetch
 */
function makeResponse(init: { ok: boolean; status: number; body?: unknown }) {
  return {
    ok: init.ok,
    status: init.status,
    json: vi.fn().mockResolvedValue(init.body),
  };
}

function fetchOk(body: unknown) {
  return vi.fn().mockResolvedValue(makeResponse({ ok: true, status: 200, body }));
}

function fetchStatus(status: number) {
  return vi.fn().mockResolvedValue(makeResponse({ ok: false, status }));
}

// ------------------------------------------------------------

describe('searchCountries', () => {
  let ac: AbortController;

  beforeEach(() => {
    ac = new AbortController();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // ============================================================
  // 1. Формирование URL и передача signal
  // ============================================================
  describe('URL и сигнал', () => {
    it.each([
      ['spain', 'https://countries.dev/name/spain'],
      ['United States', 'https://countries.dev/name/United%20States'],
      ['côte', 'https://countries.dev/name/c%C3%B4te'],
      ['c++', 'https://countries.dev/name/c%2B%2B'],
      ['a/b', 'https://countries.dev/name/a%2Fb'], // '/' ломает структуру URL, если не закодирован
    ])('query %j → URL %j', async (query, expectedUrl) => {
      const fetchMock = fetchOk([]);
      vi.stubGlobal('fetch', fetchMock);

      await searchCountries(query, ac.signal);

      expect(fetchMock).toHaveBeenNthCalledWith(1, expectedUrl, expect.anything());
    });

    it('передаёт signal в fetch без изменений (тот же объект)', async () => {
      const fetchMock = fetchOk([]);
      vi.stubGlobal('fetch', fetchMock);

      await searchCountries('spain', ac.signal);

      expect(fetchMock).toHaveBeenCalledWith(
        'https://countries.dev/name/spain',
        expect.objectContaining({ signal: ac.signal }),
      );
    });

    it('делает ровно один fetch-вызов на вызов функции', async () => {
      const fetchMock = fetchOk([]);
      vi.stubGlobal('fetch', fetchMock);

      await searchCountries('spain', ac.signal);

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================
  // 2. Успешные ответы: raw → Country[] через mapCountryResponse
  // ============================================================
  describe('успешные ответы', () => {
    it('один результат маппится через mapCountryResponse', async () => {
      vi.stubGlobal('fetch', fetchOk([BELARUS]));

      const result = await searchCountries('belarus', ac.signal);

      // Другая структура languages - доказательство, что сработал маппер (а не просто проброшены raw-данные):
      expect(result).toHaveLength(1);
      expect(result).toMatchObject([
        {
          name: 'Belarus',
          languages: ['Belarusian', 'Russian'],
        },
      ]);
    });

    it('несколько результатов — все замэпплены, порядок сохранён', async () => {
      vi.stubGlobal('fetch', fetchOk([BELARUS, ISRAEL]));

      const result = await searchCountries('x', ac.signal);

      expect(result).toHaveLength(2);
      expect(result.map((country) => country.name)).toEqual(['Belarus', 'Israel']);
    });

    it('пустой массив в ответе → []', async () => {
      vi.stubGlobal('fetch', fetchOk([]));

      await expect(searchCountries('spain', ac.signal)).resolves.toEqual([]);
    });
  });

  // ============================================================
  // 3. 404 — «нет совпадений», не ошибка
  // ============================================================
  describe('404 → пустой результат', () => {
    it('возвращает [] (не бросает)', async () => {
      vi.stubGlobal('fetch', fetchStatus(404));

      await expect(searchCountries('xyz', ac.signal)).resolves.toEqual([]);
    });

    it('на 404 не парсит тело', async () => {
      const response = makeResponse({ ok: false, status: 404 });
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));

      await searchCountries('xyz', ac.signal);

      // .json() не вызывается === не парсит тело
      expect(response.json).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // 4. Прочие неуспешные статусы вызывают HttpError
  // ============================================================
  describe('HTTP-ошибки вызывают HttpError', () => {
    it.each([400, 401, 403, 429, 500, 502, 503])('status %i → HttpError со .status === %i', async (status) => {
      vi.stubGlobal('fetch', fetchStatus(status));

      await expect(searchCountries('spain', ac.signal)).rejects.toMatchObject({
        name: 'HttpError',
        status,
      });
    });

    it('бросает именно HttpError (instanceof)', async () => {
      vi.stubGlobal('fetch', fetchStatus(500));

      await expect(searchCountries('spain', ac.signal)).rejects.toBeInstanceOf(HttpError);
    });

    it('в HttpError сохраняется url запроса', async () => {
      vi.stubGlobal('fetch', fetchStatus(500));

      await expect(searchCountries('spain', ac.signal)).rejects.toMatchObject({
        status: 500,
        url: expect.stringContaining('countries.dev/name/spain'),
      });
    });

    it('на HTTP-ошибке .json() не вызывается', async () => {
      const response = makeResponse({ ok: false, status: 500 });
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));

      await expect(searchCountries('spain', ac.signal)).rejects.toBeInstanceOf(HttpError);
      expect(response.json).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // 5. Сетевые ошибки пробрасываются как есть (без обёртки)
  // ============================================================
  describe('сетевые ошибки пробрасываются как есть', () => {
    it('AbortError не оборачивается в HttpError (тот же объект)', async () => {
      const abortError = new DOMException('Aborted', 'AbortError');
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError));

      await expect(searchCountries('spain', ac.signal)).rejects.toBe(abortError);
    });

    it('TimeoutError не оборачивается в HttpError', async () => {
      const timeoutError = new DOMException('Timeout', 'TimeoutError');
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(timeoutError));

      await expect(searchCountries('spain', ac.signal)).rejects.toBe(timeoutError);
    });

    it('TypeError (Failed to fetch) пробрасывается как есть', async () => {
      const typeError = new TypeError('Failed to fetch');
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(typeError));

      await expect(searchCountries('spain', ac.signal)).rejects.toBe(typeError);
    });
  });
});
