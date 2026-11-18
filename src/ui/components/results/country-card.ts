import { createElement } from '../../dom';
import type { CountryCard } from '@core';

const populationFormat = new Intl.NumberFormat('ru-RU');

function createEmojiFlag(card: CountryCard): HTMLElement {
  return createElement({
    tag: 'span',
    classes: ['country-card__flag', 'country-card__flag--emoji'],
    attrs: { 'aria-hidden': 'true' },
    text: card.flag ?? '🌍',
  });
}

function createFlag(card: CountryCard): HTMLElement {
  if (!card.flagPng) {
    return createEmojiFlag(card);
  }

  const image = createElement({
    tag: 'img',
    classes: ['country-card__flag'],
    attrs: {
      src: card.flagPng,
      alt: '',
      loading: 'lazy',
      decoding: 'async',
      width: '64',
      height: '48',
    },
  });
  image.addEventListener(
    'error',
    () => {
      image.replaceWith(createEmojiFlag(card));
    },
    { once: true },
  );

  return image;
}

function createCardRow(label: string, value: string): HTMLElement {
  return createElement({
    tag: 'span',
    classes: ['country-card__meta'],
    children: [
      createElement({ tag: 'span', classes: ['country-card__label'], text: label }),
      createElement({ tag: 'span', classes: ['country-card__value'], text: value }),
    ],
  });
}

export function createCountryCard(card: CountryCard, onPick: () => void, index: number): HTMLElement {
  const button = createElement({
    tag: 'button',
    classes: ['country-card'],
    attrs: { type: 'button', 'aria-label': `Подробнее: ${card.name}` },
    styles: { '--stagger': `${String(Math.min(index, 12) * 45)}ms` },
    children: [
      createFlag(card),
      createElement({ tag: 'span', classes: ['country-card__name'], text: card.name }),
      createCardRow('Столица', card.capital ?? '—'),
      createCardRow('Население', card.population === null ? '—' : populationFormat.format(card.population)),
      createElement({ tag: 'span', classes: ['country-card__region'], text: card.region ?? 'Регион не указан' }),
    ],
  });

  button.addEventListener('click', () => {
    onPick();
  });

  return button;
}
