import { createElement } from '../../dom';

export function createLoadingIndicator(): HTMLElement {
  return createElement({
    tag: 'div',
    classes: ['loading'],
    attrs: { 'aria-hidden': 'true' },
    children: [
      createElement({
        tag: 'span',
        classes: ['loading__spinner'],
      }),
      createElement({
        tag: 'span',
        classes: ['loading__label'],
        text: 'Загрузка…',
      }),
    ],
  });
}
