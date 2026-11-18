import { createElement } from './dom';
import { createAppHeader, createSearchInput, createHistoryChips, createStatusView } from './components';
import type { ViewState } from './view-state.ts';

export type AppViewHandlers = {
  onQueryChange: (query: string) => void;
  onQueryClear: () => void;
  onHistoryPick: (query: string) => void;
  onRetry: () => void;
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

  const status = createStatusView({ onRetry: handlers.onRetry });

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
    children: [search.root, status.root, history.root],
  });

  root.append(header.root, content);

  return {
    setQuery: search.setValue,
    focusSearch: search.focus,
    updateHistory: history.update,
    render: status.render,
  };
}
