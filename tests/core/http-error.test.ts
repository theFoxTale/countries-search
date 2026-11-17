import { describe, it, expect } from 'vitest';
import { HttpError } from '@core';

describe('HttpError', () => {
  // ============================================================
  // 1. Идентификация: наследование и имя
  // ============================================================
  describe('идентификация', () => {
    it('наследуется от Error', () => {
      const error = new HttpError(500);
      expect(error).toBeInstanceOf(Error);
    });

    it('name === "HttpError"', () => {
      const error = new HttpError(500);
      expect(error.name).toBe('HttpError');
    });

    it('typeof error === "object" и не null', () => {
      const error = new HttpError(500);
      expect(typeof error).toBe('object');
      expect(error).not.toBeNull();
    });
  });

  // ============================================================
  // 2. Поля: status, url, message
  // ============================================================
  describe('поля', () => {
    it.each([
      [400, 'Bad Request'],
      [429, 'Too Many Requests'],
      [500, 'Internal Server Error'],
      [502, 'Bad Gateway'],
      [503, 'Service Unavailable'],
    ])('status = %i сохраняется', (status) => {
      const error = new HttpError(status);
      expect(error.status).toBe(status);
      expect(typeof error.status).toBe('number');
    });

    it('url сохраняется, если передан', () => {
      const url = 'https://countries.dev/name/spain';
      const error = new HttpError(500, url);
      expect(error.url).toBe(url);
    });

    it('url = undefined, если не передан', () => {
      const error = new HttpError(500);
      expect(error.url).toBeUndefined();
    });

    it('message содержит статус', () => {
      const error = new HttpError(500);
      expect(error.message).toContain('500');
      expect(error.message.length).toBeGreaterThan(0);
    });

    it('message содержит url, если передан', () => {
      const url = 'https://countries.dev/name/spain';
      const error = new HttpError(500, url);
      expect(error.message).toContain(url);
    });

    it('message не содержит url, если url не передан', () => {
      const error = new HttpError(500);
      expect(error.message).not.toContain('undefined');
      expect(error.message).not.toContain('null');
    });
  });

  // ============================================================
  // 3. Поведение как обычного Error: throw / catch / stack
  // ============================================================
  describe('поведение как Error', () => {
    it('бросается и перехватывается через try/catch', () => {
      const url = 'https://countries.dev/name/spain';
      let caught: unknown;
      try {
        throw new HttpError(500, url);
      } catch (error) {
        caught = error;
      }
      expect(caught).toBeInstanceOf(HttpError);
      expect((caught as HttpError).status).toBe(500);
    });

    it('отклоняется как reason в Promise.reject', async () => {
      const promise = Promise.reject(new HttpError(503));
      await expect(promise).rejects.toBeInstanceOf(HttpError);
      await expect(promise).rejects.toMatchObject({ status: 503 });
    });
  });
});
