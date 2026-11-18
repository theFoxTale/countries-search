import { createElement } from '../dom';

export type HistoryChipsProperties = {
  items: readonly string[];
  onPick: (query: string) => void;
};

export type HistoryChips = {
  root: HTMLElement;
  /**
    Заменить список чипов (для будущей синхронизации с localStorage).
    */
  update: (items: readonly string[]) => void;
};

export function createHistoryChips(properties: HistoryChipsProperties): HistoryChips {
  const list = createElement({
    tag: 'ul',
    classes: ['history__list'],
    attrs: { 'aria-label': 'История поиска' },
  });

  const root = createElement({
    tag: 'section',
    classes: ['history'],
    children: [createElement({ tag: 'h2', classes: ['history__title'], text: 'История поиска' }), list],
  });

  function createChip(query: string): HTMLElement {
    const chip = createElement({
      tag: 'button',
      classes: ['history__chip'],
      attrs: { type: 'button' },
      text: query,
    });
    chip.addEventListener('click', () => {
      properties.onPick(query);
    });
    return chip;
  }

  function update(items: readonly string[]): void {
    list.replaceChildren(...items.map(createChip));
    root.hidden = items.length === 0;
  }

  update(properties.items);

  return { root, update };
}
