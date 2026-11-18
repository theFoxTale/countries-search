import { createDiv, createElement } from '../../dom';
import type { Country } from '@core';

export type CountryDetailProperties = {
  onBack: () => void;
};

export type CountryDetail = {
  root: HTMLElement;
  render: (country: Country) => void;
};

const numberFormat = new Intl.NumberFormat('ru-RU');

function createBackButton(onBack: () => void): HTMLElement {
  const backIcon = createElement({
    tag: 'span',
    classes: ['icon', 'icon--back', 'detail__back-arrow'],
    attrs: { 'aria-hidden': 'true' },
  });

  const button = createElement({
    tag: 'button',
    classes: ['detail__back'],
    attrs: { type: 'button' },
    children: [backIcon, 'Назад к результатам'],
  });
  button.addEventListener('click', () => {
    onBack();
  });
  return button;
}

function createEmojiFlag(country: Country): HTMLElement {
  return createElement({
    tag: 'span',
    classes: ['detail__flag', 'detail__flag--emoji'],
    attrs: { 'aria-hidden': 'true' },
    text: country.flag ?? '🌍',
  });
}

function createHeroFlag(country: Country): HTMLElement {
  const source = country.flagSvg ?? country.flagPng;
  if (!source) {
    return createEmojiFlag(country);
  }

  const image = createElement({
    tag: 'img',
    classes: ['detail__flag'],
    attrs: {
      src: source,
      alt: `Флаг: ${country.name}`,
      decoding: 'async',
    },
  });
  image.addEventListener(
    'error',
    () => {
      image.replaceWith(createEmojiFlag(country));
    },
    { once: true },
  );
  return image;
}

function createHero(country: Country): HTMLElement {
  const titleChildren: (Node | string)[] = [
    createElement({
      tag: 'h2',
      classes: ['detail__name'],
      text: country.name,
    }),
  ];
  if (country.nativeName && country.nativeName !== country.name) {
    titleChildren.push(
      createElement({
        tag: 'p',
        classes: ['detail__native'],
        text: country.nativeName,
      }),
    );
  }
  titleChildren.push(
    createElement({
      tag: 'span',
      classes: ['detail__region'],
      text: country.region ?? 'Регион не указан',
    }),
  );

  return createElement({
    tag: 'div',
    classes: ['detail__hero'],
    children: [
      createHeroFlag(country),
      createElement({
        tag: 'div',
        classes: ['detail__title'],
        children: titleChildren,
      }),
    ],
  });
}

function createStat(label: string, value: string): HTMLElement {
  return createElement({
    tag: 'div',
    classes: ['detail__stat'],
    children: [
      createElement({
        tag: 'span',
        classes: ['detail__stat-value'],
        text: value,
      }),
      createElement({
        tag: 'span',
        classes: ['detail__stat-label'],
        text: label,
      }),
    ],
  });
}

function createStats(country: Country): HTMLElement {
  return createElement({
    tag: 'div',
    classes: ['detail__stats'],
    children: [
      createStat('Столица', country.capital ?? '—'),
      createStat('Население', country.population === null ? '—' : `${numberFormat.format(country.population)} чел.`),
      createStat('Площадь', country.area === null ? '—' : `${numberFormat.format(country.area)} км²`),
    ],
  });
}

function createSection(title: string, content: HTMLElement): HTMLElement {
  return createElement({
    tag: 'section',
    classes: ['detail__section'],
    children: [
      createElement({
        tag: 'h3',
        classes: ['detail__section-title'],
        text: title,
      }),
      content,
    ],
  });
}

function createChips(items: readonly string[]): HTMLElement {
  return createElement({
    tag: 'ul',
    classes: ['detail__chips'],
    children: items.map((item) =>
      createElement({
        tag: 'li',
        classes: ['detail__chip'],
        text: item,
      }),
    ),
  });
}

function createCurrencies(currencies: Country['currencies']): HTMLElement {
  return createElement({
    tag: 'ul',
    classes: ['detail__currencies'],
    children: currencies.map((currency) =>
      createElement({
        tag: 'li',
        classes: ['detail__currency'],
        children: [
          createElement({
            tag: 'span',
            classes: ['detail__currency-code'],
            text: currency.code,
          }),
          createElement({
            tag: 'span',
            classes: ['detail__currency-name'],
            text: currency.name,
          }),
          createElement({
            tag: 'span',
            classes: ['detail__currency-symbol'],
            text: currency.symbol ?? '—',
          }),
        ],
      }),
    ),
  });
}

function createSections(country: Country): HTMLElement[] {
  const sections: HTMLElement[] = [createStats(country)];

  if (country.languages.length > 0 && country.currencies.length > 0) {
    const languagesBlock = createSection('Языки', createChips(country.languages));
    const currenciesBlock = createSection('Валюты', createCurrencies(country.currencies));

    sections.push(
      createDiv({
        classes: ['detail__container'],
        children: [languagesBlock, currenciesBlock],
      }),
    );
  } else {
    if (country.languages.length > 0) {
      sections.push(createSection('Языки', createChips(country.languages)));
    }

    if (country.currencies.length > 0) {
      sections.push(createSection('Валюты', createCurrencies(country.currencies)));
    }
  }

  if (country.borders.length > 0) {
    sections.push(createSection('Граничит с', createChips(country.borders)));
  }

  return sections;
}

export function createCountryDetail(properties: CountryDetailProperties): CountryDetail {
  const backButton = createBackButton(properties.onBack);
  const body = createElement({ tag: 'div', classes: ['detail__body'] });
  const root = createElement({
    tag: 'section',
    classes: ['detail'],
    attrs: { 'aria-label': 'Подробная информация о стране', hidden: true },
    children: [backButton, body],
  });

  function render(country: Country): void {
    root.hidden = false;
    body.replaceChildren(createHero(country), ...createSections(country));
    backButton.focus();
  }

  return { root, render };
}
