import { createElement } from '../dom';
import globeLogo from '../../assets/images/countries.webp';

export type AppHeader = {
  root: HTMLElement;
};

export function createAppHeader(): AppHeader {
  return {
    root: createElement({
      tag: 'header',
      classes: ['header'],
      children: [createText(), createIcons()],
    }),
  };
}

function createText() {
  const headerImage = createElement({
    tag: 'img',
    classes: ['header__logo'],
    attrs: {
      src: globeLogo,
      alt: 'Globe Logo',
    },
  });

  const headerText = createElement({
    tag: 'h1',
    classes: ['header__title'],
    text: 'Country Search',
  });

  return createElement({
    tag: 'div',
    classes: ['header__inner'],
    children: [headerImage, headerText],
  });
}

function createIcons() {
  const themeIcon = createElement({
    tag: 'span',
    classes: ['icon', 'icon--moon'],
    attrs: { 'aria-hidden': 'true' },
  });

  const themeButton = createElement({
    tag: 'button',
    classes: ['icon-button', 'icon-button--theme'],
    attrs: { type: 'button', 'aria-label': 'Переключить тему' },
    children: [themeIcon],
  });

  return createElement({
    tag: 'div',
    classes: ['header__icons'],
    children: [themeButton, createLanguagesContainer()],
  });
}

function createLanguagesContainer() {
  const englishTag = createElement({
    tag: 'span',
    classes: ['icon--text'],
    text: 'EN',
  });

  const switchIcon = createElement({
    tag: 'span',
    classes: ['icon', 'icon--switch'],
    attrs: { 'aria-hidden': 'true' },
  });

  const switchButton = createElement({
    tag: 'button',
    classes: ['icon-button', 'icon-button--switch'],
    attrs: {
      type: 'button',
      'aria-label': 'Переключить язык',
    },
    children: [switchIcon],
  });

  const russianTag = createElement({
    tag: 'span',
    classes: ['icon--text', 'icon--text_active'],
    text: 'RU',
  });

  return createElement({
    tag: 'div',
    classes: ['header__language'],
    children: [englishTag, switchButton, russianTag],
  });
}
