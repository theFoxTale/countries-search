import type { RawCountry } from '@core';

// Реальный ответ API - Belarus
export const BELARUS: RawCountry = {
  name: 'Belarus',
  nativeName: 'Белару́сь',
  demonym: 'Belarusian',
  flag: '🇧🇾',
  flags: { png: 'https://flagcdn.com/w320/by.png', svg: 'https://flagcdn.com/by.svg' },
  capital: 'Minsk',
  region: 'Europe',
  subregion: 'Eastern Europe',
  population: 9398861,
  area: 207600,
  borders: ['LVA', 'LTU', 'POL', 'RUS', 'UKR'],
  languages: [{ name: 'Belarusian' }, { name: 'Russian' }],
  currencies: [
    { code: 'BYN', name: 'New Belarusian ruble', symbol: 'Br' },
    { code: 'BYR', name: 'Old Belarusian ruble', symbol: 'Br' },
  ],
};

// Придуманный кривой ответ API - Antarctica
export const ANTARCTICA: RawCountry = {
  name: 'Antarctica',
  flag: undefined,
  capital: null,
  region: null,
  area: 14000000,
  languages: null,
  currencies: undefined,
};

// Обрезанный реальный ответ API - Israel (неполные данные)
export const ISRAEL: RawCountry = {
  name: 'Israel',
  capital: 'Jerusalem',
  region: 'Asia',
  population: 9216900,
  currencies: [
    {
      code: 'ILS',
      name: 'Israeli new shekel',
    },
  ],
};
