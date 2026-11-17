import { createElement } from '../dom';

export type Hint = {
  root: HTMLElement;
};

export function createHint(): Hint {
  return {
    root: createElement({
      tag: 'div',
      classes: ['hint'],
      children: [
        createElement({
          tag: 'p',
          classes: ['hint__text'],
          text: 'Начните вводить название страны…',
        }),
      ],
    }),
  };
}
