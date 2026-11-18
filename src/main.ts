import './styles/index.css';
import { createAppView, createDiv } from './ui';
import type { AppViewHandlers, ViewState } from './ui';
import { type Country, debounce, searchCountries } from '@core';

const INITIAL_HISTORY = ['France', 'Japan', 'Brazil'] as const;
const SEARCH_DELAY_MS = 300;

type SearchController = {
  run: (query: string) => Promise<void>;
  cancel: () => void;
  retry: () => void;
};

type Navigation = {
  render: (state: ViewState) => void;
  back: () => void;
};

function createSearchController(render: (state: ViewState) => void): SearchController {
  let currentRequest: AbortController | null = null;
  let lastQuery = '';

  async function run(query: string): Promise<void> {
    currentRequest?.abort();
    currentRequest = new AbortController();
    lastQuery = query;
    render({ status: 'loading' });
    try {
      const countries = await searchCountries(query, currentRequest.signal);
      if (countries.length === 0) {
        render({ status: 'empty', query });
        return;
      }
      render({ status: 'results', countries });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      render({ status: 'error', message: 'Не удалось загрузить результаты', query });
    }
  }

  return {
    run,
    cancel(): void {
      currentRequest?.abort();
      currentRequest = null;
    },
    retry(): void {
      if (lastQuery) void run(lastQuery);
    },
  };
}

function createNavigation(render: (state: ViewState) => void): Navigation {
  let lastResults: Country[] | null = null;

  return {
    render(state: ViewState): void {
      if (state.status === 'results') {
        lastResults = state.countries;
      }
      render(state);
    },
    back(): void {
      if (lastResults) {
        render({ status: 'results', countries: lastResults });
        return;
      }
      render({ status: 'idle' });
    },
  };
}

function createSearchHandlers(render: (state: ViewState) => void): AppViewHandlers {
  const navigation = createNavigation(render);
  const controller = createSearchController(navigation.render);

  const debouncedSearch = debounce((query: string) => {
    if (query.trim()) void controller.run(query);
  }, SEARCH_DELAY_MS);

  function cancelPending(): void {
    controller.cancel();
    debouncedSearch.cancel();
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
      debouncedSearch.cancel();
      void controller.run(query);
    },
    onRetry: controller.retry,
    onCountryPick(country: Country): void {
      render({ status: 'detail', country });
    },
    onBack: navigation.back,
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
  appView.render({ status: 'idle' });
  appView.focusSearch();
}

initApp();
