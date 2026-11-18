import { createElement } from './dom';
import {
  createAppHeader,
  createSearchInput,
  createHint,
  createHistoryChips,
  createLoadingIndicator,
} from './components';
import type { ViewState } from './view-state.ts';

export type AppViewHandlers = {
  onQueryChange: (query: string) => void;
  onQueryClear: () => void;
  onHistoryPick: (query: string) => void;
};

export type AppView = {
  setQuery: (query: string) => void;
  focusSearch: () => void;
  updateHistory: (items: readonly string[]) => void;
  render: (state: ViewState) => void;
};

export function createAppView(
  root: HTMLElement,
  handlers: AppViewHandlers,
  initialHistory: readonly string[],
): AppView {
  const header = createAppHeader();
  const search = createSearchInput({
    onInput: handlers.onQueryChange,
    onClear: handlers.onQueryClear,
  });
  const hint = createHint();
  const history = createHistoryChips({
    items: initialHistory,
    onPick: (query) => {
      search.setValue(query);
      handlers.onHistoryPick(query);
    },
  });

  // Состояние приложения
  const status = createElement({
    tag: 'div',
    classes: ['status'],
    attrs: { hidden: true },
  });

  const content = createElement({
    tag: 'main',
    classes: ['app__content'],
    children: [search.root, hint.root, status, history.root],
  });

  root.append(header.root, content);

  return {
    setQuery: search.setValue,
    focusSearch: search.focus,
    updateHistory: history.update,
    render: (state) => {
      renderView(state, hint.root, status);
    },
  };
}

function renderView(state: ViewState, hintElement: HTMLElement, statusElement: HTMLElement): void {
  // Сбрасываем состояния по умолчанию
  hintElement.hidden = true;
  statusElement.hidden = true;
  statusElement.replaceChildren();

  // Применяем состояние
  if (state.status === 'idle') {
    hintElement.hidden = false;
  } else if (state.status === 'loading') {
    statusElement.hidden = false;
    statusElement.append(createLoadingIndicator());
  }
}
