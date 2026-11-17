import { createElement } from './dom';
import { createAppHeader, createSearchInput, createHint, createHistoryChips } from './components';

export type AppViewHandlers = {
  onQueryChange: (query: string) => void;
  onQueryClear: () => void;
  onHistoryPick: (query: string) => void;
};

export type AppView = {
  setQuery: (query: string) => void;
  focusSearch: () => void;
  updateHistory: (items: readonly string[]) => void;
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

  const content = createElement({
    tag: 'main',
    classes: ['app__content'],
    children: [search.root, hint.root, history.root],
  });

  root.append(header.root, content);

  return {
    setQuery: search.setValue,
    focusSearch: search.focus,
    updateHistory: history.update,
  };
}
