import { createElement } from '../../dom';
import type { Country } from '@core';
import { createCountryCard } from './country-card.ts';

export type CountryListProperties = {
  onPick: (country: Country) => void;
};

export type CountryList = {
  root: HTMLElement;
  render: (countries: readonly Country[]) => void;
};

const pluralRules = new Intl.PluralRules('ru-RU');
const COUNT_FORMS: Record<Intl.LDMLPluralRule, string> = {
  zero: 'стран',
  one: 'страна',
  two: 'страны',
  few: 'страны',
  many: 'стран',
  other: 'стран',
};

function formatCount(count: number): string {
  return `${String(count)} ${COUNT_FORMS[pluralRules.select(count)]}`;
}

export function createCountryList(properties: CountryListProperties): CountryList {
  const count = createElement({
    tag: 'p',
    classes: ['results__count'],
    attrs: { 'aria-live': 'polite' },
  });

  const grid = createElement({ tag: 'ul', classes: ['results__grid'] });

  const root = createElement({
    tag: 'section',
    classes: ['results'],
    attrs: { 'aria-label': 'Результаты поиска', hidden: true },
    children: [count, grid],
  });

  function render(countries: readonly Country[]): void {
    root.hidden = countries.length === 0;
    count.textContent = `Найдено ${formatCount(countries.length)}`;

    grid.replaceChildren(
      ...countries.map((country, index) =>
        createElement({
          tag: 'li',
          classes: ['results__item'],
          children: [
            createCountryCard(
              country,
              () => {
                properties.onPick(country);
              },
              index,
            ),
          ],
        }),
      ),
    );
  }

  return { root, render };
}
