import { z } from 'zod';

const NullableString = z.string().nullish();
const NullableNumber = z.number().nullish();

const RawFlagsSchema = z.object({
  png: NullableString,
  svg: NullableString,
});

const RawLanguageSchema = z.object({
  name: z.string(),
});

const RawCurrencySchema = z.object({
  code: z.string(),
  name: z.string(),
  symbol: NullableString,
});

const NullableStringArray = z.array(z.string()).nullish();
const NullableLanguages = z.array(RawLanguageSchema).nullish();
const NullableCurrencies = z.array(RawCurrencySchema).nullish();

export const RawCountrySchema = z.object({
  name: z.string(),
  nativeName: NullableString,
  demonym: NullableString,
  flag: NullableString,
  flags: RawFlagsSchema.nullish(),
  capital: NullableString,
  region: NullableString,
  subregion: NullableString,
  population: NullableNumber,
  area: NullableNumber,
  borders: NullableStringArray,
  languages: NullableLanguages,
  currencies: NullableCurrencies,
});

/**
 * Поля сырого ответа от countries.dev /name/{query}, которые будут использоваться в приложении.
 * Тип выводится из схемы чтобы они не расходились.
 */
export type RawCountry = z.infer<typeof RawCountrySchema>;
