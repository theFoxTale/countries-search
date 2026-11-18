import { describe, it, expect } from 'vitest';
import { mapCountryResponse } from '@core';
import { ANTARCTICA, BELARUS, ISRAEL } from '../fixtures/countries.ts';

describe('mapCountryResponse', () => {
  // ============================================================
  // 1. Полный ответ — все поля присутствуют и корректно маппятся
  // ============================================================
  describe('полный ответ', () => {
    it('основные поля пробрасываются, флаг содержит emoji + svg + png', () => {
      const country = mapCountryResponse(BELARUS);
      expect(country.name).toBe('Belarus');
      expect(country.area).toBe(207600);
      expect(country.nativeName).toBe('Белару́сь');
      expect(country.demonym).toBe('Belarusian');
      expect(country.subregion).toBe('Eastern Europe');

      expect(country.flag).toBe('🇧🇾');
      expect(country.flagSvg).toBe('https://flagcdn.com/by.svg');
      expect(country.flagPng).toBe('https://flagcdn.com/w320/by.png');

      expect(country.capital).toBe('Minsk');
      expect(country.region).toBe('Europe');
      expect(country.population).toBe(9398861);
    });

    it('languages представляет собой массив имён', () => {
      const country = mapCountryResponse(BELARUS);
      expect(country.languages).toEqual(['Belarusian', 'Russian']);
    });

    it('currencies представляет собой массив объектов { code, name, symbol }', () => {
      const country = mapCountryResponse(BELARUS);
      expect(country.currencies).toStrictEqual([
        { code: 'BYN', name: 'New Belarusian ruble', symbol: 'Br' },
        { code: 'BYR', name: 'Old Belarusian ruble', symbol: 'Br' },
      ]);
    });

    it('borders представляет собой массив кодов стран', () => {
      const country = mapCountryResponse(BELARUS);
      expect(country.borders).toEqual(['LVA', 'LTU', 'POL', 'RUS', 'UKR']);
    });
  });

  // ============================================================
  // 2. Пустые и отсутствующие поля преобразуются в null или []
  // ============================================================
  describe('пустые и отсутствующие поля', () => {
    // --- Строковые поля: null/undefined → null ---
    it.each([
      ['null', null],
      ['undefined', undefined],
    ] as const)('строковые поля = %s → null', (_, value) => {
      const country = mapCountryResponse({
        name: 'X',
        flag: value,
        capital: value,
        region: value,
        nativeName: value,
        demonym: value,
        subregion: value,
      });

      expect(country.flag).toBeNull();
      expect(country.capital).toBeNull();
      expect(country.region).toBeNull();
      expect(country.nativeName).toBeNull();
      expect(country.demonym).toBeNull();
      expect(country.subregion).toBeNull();
    });

    // --- Числовые поля: null/undefined → null ---
    it.each([
      ['null', null],
      ['undefined', undefined],
    ] as const)('числовые поля = %s → null', (_, value) => {
      const country = mapCountryResponse({ name: 'X', population: value, area: value });
      expect(country.population).toBeNull();
      expect(country.area).toBeNull();
    });

    // --- Массивы: null/undefined → [] ---
    it.each([
      ['null', null],
      ['undefined', undefined],
    ] as const)('массивы (borders/languages/currencies) = %s → []', (_, value) => {
      const country = mapCountryResponse({
        name: 'X',
        borders: value,
        languages: value,
        currencies: value,
      });

      expect(country.borders).toEqual([]);
      expect(country.languages).toEqual([]);
      expect(country.currencies).toEqual([]);
    });

    // --- Отсутствующие ключи (минимальный ответ) ---
    it('минимальный ответ { name } → null для строк/чисел и [] для массивов', () => {
      const country = mapCountryResponse({ name: 'X' });
      expect(country.name).toBe('X');
      expect(country.flag).toBeNull();
      expect(country.capital).toBeNull();
      expect(country.population).toBeNull();
      expect(country.borders).toEqual([]);
      expect(country.languages).toEqual([]);
      expect(country.currencies).toEqual([]);
    });

    // --- Пустые массивы не превращаются в null ---
    it('пустые массивы остаются пустыми', () => {
      const country = mapCountryResponse({ name: 'X', borders: [], languages: [], currencies: [] });
      expect(country.borders).toEqual([]);
      expect(country.languages).toEqual([]);
      expect(country.currencies).toEqual([]);
    });

    // --- Сломанный ответ ANTARCTICA: пустые/кривые значения не ломают маппер ---
    it('сломанный ответ (ANTARCTICA) нормализуется без падений', () => {
      const country = mapCountryResponse(ANTARCTICA);
      expect(country.name).toBe('Antarctica');

      expect(country.flag).toBeNull();
      expect(country.flagSvg).toBeNull();
      expect(country.flagPng).toBeNull();

      expect(country.capital).toBeNull();
      expect(country.region).toBeNull();
      expect(country.population).toBeNull();

      // присутствующее поле сохраняется
      expect(country.area).toBe(14000000);

      // отсутствующие / null-массивы → []
      expect(country.borders).toEqual([]);
      expect(country.languages).toEqual([]);
      expect(country.currencies).toEqual([]);
    });

    it('неполный реальный ответ: присутствующие поля на месте, отсутствующие — null и []', () => {
      const country = mapCountryResponse(ISRAEL);

      // есть в ответе
      expect(country.name).toBe('Israel');
      expect(country.capital).toBe('Jerusalem');
      expect(country.population).toBe(9216900);

      // отсутствуют
      expect(country.borders).toEqual([]);
      expect(country.languages).toEqual([]);
      expect(country.flag).toBeNull();
      expect(country.nativeName).toBeNull();
    });

    it('валюта без symbol → symbol: null', () => {
      const country = mapCountryResponse(ISRAEL);
      expect(country.currencies).toStrictEqual([{ code: 'ILS', name: 'Israeli new shekel', symbol: null }]);
    });
  });

  // ============================================================
  // 3. Чистота: входной массив не мутируется функцией
  // ============================================================
  describe('чистота', () => {
    it('исходный входной массив (BELARUS) не мутируется', () => {
      const snapshot = structuredClone(BELARUS);
      mapCountryResponse(BELARUS);
      expect(BELARUS).toEqual(snapshot);
    });

    it('вложенные массивы возвращаются копиями, а не ссылками на входные данные', () => {
      const country = mapCountryResponse(BELARUS);
      expect(country.borders).not.toBe(BELARUS.borders);
      expect(country.languages).not.toBe(BELARUS.languages);
      expect(country.currencies).not.toBe(BELARUS.currencies);

      // мутация результата не должна влиять на входные данные
      country.borders.push('XXX');
      expect(BELARUS.borders).not.toContain('XXX');
    });
  });
});
