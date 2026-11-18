import { createElement } from '../../dom';

export function createEmptyState(query: string): HTMLElement {
  return createElement({
    tag: 'div',
    classes: ['status__container'],
    children: [
      createElement({
        tag: 'p',
        classes: ['status__text'],
        children: [
          'По запросу ',
          createElement({
            tag: 'span',
            classes: ['empty__query'],
            text: `«${query}»`,
          }),
          ' ничего не найдено',
        ],
      }),
    ],
  });
}
