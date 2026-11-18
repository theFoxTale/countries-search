import { createElement } from '../dom';

export type SearchInputProperties = {
  onInput: (query: string) => void;
  onClear: () => void;
  initialValue?: string;
  placeholder?: string;
  ariaLabel?: string;
};

export type SearchInput = {
  root: HTMLElement;
  setValue: (query: string) => void;
  focus: () => void;
};

function createInput(properties: SearchInputProperties): HTMLInputElement {
  return createElement({
    tag: 'input',
    classes: ['search__input'],
    attrs: {
      type: 'search',
      placeholder: properties.placeholder ?? 'Введите название страны…',
      autocomplete: 'off',
      spellcheck: false,
      'aria-label': properties.ariaLabel ?? 'Поиск страны',
    },
    props: { value: properties.initialValue ?? '' },
  });
}

function createClearButton(input: HTMLInputElement): HTMLButtonElement {
  const clearIcon = createElement({
    tag: 'span',
    classes: ['icon', 'icon--clear'],
    attrs: { 'aria-hidden': 'true' },
  });

  return createElement({
    tag: 'button',
    classes: ['search__clear'],
    attrs: {
      type: 'button',
      'aria-label': 'Очистить поле поиска',
      title: 'Очистить',
      hidden: input.value.length === 0,
    },
    children: [clearIcon],
  });
}

function createRoot(input: HTMLInputElement, clearButton: HTMLButtonElement): HTMLElement {
  const searchIcon = createElement({
    tag: 'span',
    classes: ['search__icon', 'icon', 'icon--search'],
    attrs: { 'aria-hidden': 'true' },
  });

  return createElement({
    tag: 'div',
    classes: ['search'],
    children: [searchIcon, input, clearButton],
  });
}

function syncClearVisibility(input: HTMLInputElement, clearButton: HTMLButtonElement): void {
  clearButton.hidden = input.value.length === 0;
}

function clearInput(input: HTMLInputElement, clearButton: HTMLButtonElement, onClear: () => void): void {
  input.value = '';
  syncClearVisibility(input, clearButton);
  onClear();
  input.focus();
}

function wireEvents(input: HTMLInputElement, clearButton: HTMLButtonElement, properties: SearchInputProperties): void {
  input.addEventListener('input', () => {
    syncClearVisibility(input, clearButton);
    properties.onInput(input.value);
  });

  input.addEventListener('keydown', (event) => {
    if (!(event.key === 'Escape' && input.value.length > 0)) {
      return;
    }

    event.preventDefault();
    clearInput(input, clearButton, properties.onClear);
  });

  clearButton.addEventListener('click', () => {
    clearInput(input, clearButton, properties.onClear);
  });
}

export function createSearchInput(properties: SearchInputProperties): SearchInput {
  const input = createInput(properties);
  const clearButton = createClearButton(input);
  const root = createRoot(input, clearButton);

  wireEvents(input, clearButton, properties);

  return {
    root,
    setValue(query: string): void {
      input.value = query;
      syncClearVisibility(input, clearButton);
    },
    focus(): void {
      input.focus();
    },
  };
}
