import './styles/index.css';
import { createAppView } from './ui';
import type { AppViewHandlers, ViewState } from './ui';
import { debounce, searchCountries } from '@core';
import { createDiv } from './ui/dom';

const INITIAL_HISTORY = ['France', 'Japan', 'Brazil'] as const;
const SEARCH_DELAY_MS = 300;

function createSearchHandlers(render: (state: ViewState) => void): AppViewHandlers {
  let currentRequest: AbortController | null = null;

  async function runSearch(query: string): Promise<void> {
    currentRequest?.abort();
    currentRequest = new AbortController();
    render({ status: 'loading' });
    try {
      await searchCountries(query, currentRequest.signal);
      render({ status: 'idle' });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      render({ status: 'idle' });
    }
  }

  const debouncedSearch = debounce((query: string) => {
    if (query.trim()) void runSearch(query);
  }, SEARCH_DELAY_MS);

  function cancelPending(): void {
    currentRequest?.abort();
    currentRequest = null;
    debouncedSearch('');
  }

  return {
    onQueryChange(query: string): void {
      cancelPending();
      if (!query.trim()) {
        render({ status: 'idle' });
        return;
      }
      render({ status: 'loading' });
      debouncedSearch(query);
    },
    onQueryClear(): void {
      cancelPending();
      render({ status: 'idle' });
    },
    onHistoryPick(query: string): void {
      debouncedSearch('');
      void runSearch(query);
    },
  };
}

function initApp(): void {
  const appRoot = createDiv({
    classes: ['app'],
    attrs: { id: 'app' },
  });
  document.body.append(appRoot);

  function render(state: ViewState): void {
    appView.render(state);
  }

  const appView = createAppView(appRoot, createSearchHandlers(render), INITIAL_HISTORY);
  appView.focusSearch();
}

initApp();
