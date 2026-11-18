import { describe, it, expect } from 'vitest';
import { classifyError, HttpError } from '@core';

describe('classifyError', () => {
  // ============================================================
  // 1. abort: отмена нашего же запроса
  // ============================================================
  describe('abort', () => {
    it('ошибка AbortError вызывает { kind: "abort" } без message', () => {
      const error = new DOMException('Aborted', 'AbortError');
      expect(classifyError(error)).toStrictEqual({ kind: 'abort' });
    });

    it('abort не содержит message (соблюдаем контракт для UI)', () => {
      const result = classifyError(new DOMException('Aborted', 'AbortError'));
      expect(result).not.toHaveProperty('message');
    });
  });

  // ============================================================
  // 2. timeout: истёк AbortSignal.timeout = показать сообщение + «Повторить»
  // ============================================================
  describe('timeout', () => {
    it('ошибка TimeoutError вызывает { kind: "timeout", message: string }', () => {
      const error = new DOMException('Timeout', 'TimeoutError');
      const result = classifyError(error);
      expect(result.kind).toBe('timeout');
      if (result.kind !== 'timeout') {
        return;
      }

      expect(typeof result.message).toBe('string');
      expect(result.message.length).toBeGreaterThan(0);
    });

    it('TimeoutError и AbortError - это разные ошибки', () => {
      const error = new DOMException('Timeout', 'TimeoutError');
      expect(classifyError(error).kind).toBe('timeout');
      expect(classifyError(error).kind).not.toBe('abort');
    });

    it('TimeoutError не уходит в unknown', () => {
      const error = new DOMException('Timeout', 'TimeoutError');
      expect(classifyError(error).kind).not.toBe('unknown');
    });
  });

  // ============================================================
  // 3. http: HttpError(не 404) = показать сообщение + «Повторить»
  // ============================================================
  describe('http', () => {
    it.each([400, 401, 403, 429, 500, 502, 503])('HttpError(%i) = { kind: "http", status: %i, message }', (status) => {
      const error = new HttpError(status, 'https://countries.dev/name/spain');
      const result = classifyError(error);
      expect(result).toEqual({
        kind: 'http',
        status,
        message: expect.any(String),
      });
    });

    it('сохраняет исходный .message из HttpError', () => {
      const error = new HttpError(500, 'https://countries.dev/name/spain');
      const result = classifyError(error);
      if (result.kind === 'http') {
        expect(result.message).toBe(error.message);
      }
    });

    it('HttpError(500) не уходит в unknown (проверяет порядок проверок)', () => {
      const result = classifyError(new HttpError(500));
      expect(result.kind).toBe('http');
      expect(result.kind).not.toBe('unknown');
    });
  });

  // ============================================================
  // 4. unknown: сеть, zod, syntax, не-Error значения = «Повторить»
  // ============================================================
  describe('unknown', () => {
    it('TypeError("Failed to fetch") = unknown', () => {
      expect(classifyError(new TypeError('Failed to fetch'))).toEqual({
        kind: 'unknown',
        message: 'Failed to fetch',
      });
    });

    it('обычная Error = unknown с тем же message', () => {
      expect(classifyError(new Error('boom'))).toEqual({
        kind: 'unknown',
        message: 'boom',
      });
    });

    it('ошибка валидации (Error с cause от zod) = unknown, cause не влияет', () => {
      const error = new Error('Unexpected countries.dev response shape', {
        cause: { code: 'invalid_type', path: ['name'] },
      });
      expect(classifyError(error)).toEqual({
        kind: 'unknown',
        message: 'Unexpected countries.dev response shape',
      });
    });

    it('SyntaxError (невалидный JSON от API) = unknown', () => {
      expect(classifyError(new SyntaxError('Unexpected token'))).toEqual({
        kind: 'unknown',
        message: 'Unexpected token',
      });
    });
  });

  // ============================================================
  // 5. Не-Error значения: classifyError не должен бросать
  // ============================================================
  describe('не-Error значения', () => {
    it.each([
      ['null', null],
      ['undefined', undefined],
      ['строка', 'oops'],
      ['число', 42],
      ['plain object без name', { foo: 'bar' }],
    ])('%s = unknown, не бросает', (_, value) => {
      expect(() => classifyError(value)).not.toThrow();
      expect(classifyError(value).kind).toBe('unknown');
    });

    it('plain object { name: "AbortError" } = unknown (не Error = не abort)', () => {
      expect(classifyError({ name: 'AbortError' }).kind).toBe('unknown');
    });

    it('message для не-Error — непустая строка', () => {
      for (const value of [null, undefined, 'oops', 42]) {
        const result = classifyError(value);
        if (result.kind !== 'unknown') {
          continue;
        }

        expect(typeof result.message).toBe('string');
        expect(result.message.length).toBeGreaterThan(0);
      }
    });
  });

  // ============================================================
  // 6. Порядок проверок (регресс) — частное до общего
  // ============================================================
  describe('порядок проверок', () => {
    it('AbortError проверяется до общего Error', () => {
      const error: unknown = new DOMException('Aborted', 'AbortError');
      expect(error instanceof Error || error instanceof DOMException).toBe(true);
      expect(classifyError(error).kind).toBe('abort');
    });

    it('TimeoutError проверяется до общего Error', () => {
      const error: unknown = new DOMException('Timeout', 'TimeoutError');
      expect(error instanceof Error || error instanceof DOMException).toBe(true);
      expect(classifyError(error).kind).toBe('timeout');
    });

    it('HttpError проверяется до общего Error', () => {
      const error = new HttpError(500);
      expect(error).toBeInstanceOf(Error);
      expect(classifyError(error).kind).toBe('http');
    });
  });

  // ============================================================
  // 7. Чистота и детерминизм
  // ============================================================
  describe('чистота', () => {
    it('не мутирует входную ошибку', () => {
      const error = new HttpError(500, 'https://countries.dev/name/spain');
      const snapshot = { name: error.name, status: error.status, message: error.message };
      classifyError(error);
      expect({ name: error.name, status: error.status, message: error.message }).toEqual(snapshot);
    });

    it('детерминирован: одинаковый вход = одинаковый выход', () => {
      const error = new HttpError(429);
      expect(classifyError(error)).toEqual(classifyError(error));
    });
  });
});
