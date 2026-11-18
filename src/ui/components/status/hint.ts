import { createElement } from '../../dom';

export function createHint() {
  return createElement({
    tag: 'div',
    classes: ['status__container'],
    children: [
      createElement({
        tag: 'p',
        classes: ['status__text'],
        text: 'Начните вводить название страны…',
      }),
    ],
  });
}
