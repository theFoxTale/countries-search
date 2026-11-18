import type { Country } from '@core';

export type ViewState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'results'; countries: Country[] }
  | { status: 'empty'; query: string }
  | { status: 'error'; message: string; query: string }
  | { status: 'detail'; country: Country };
