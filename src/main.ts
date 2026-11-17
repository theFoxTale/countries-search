import './styles/index.css';

import { createAppView } from './ui';

const appRoot = document.createElement('div');
appRoot.id = 'app';
appRoot.className = 'app';
document.body.append(appRoot);

const INITIAL_HISTORY = ['France', 'Japan', 'Brazil'] as const;

const appView = createAppView(
  appRoot,
  {
    onQueryChange: (query) => {
      console.log('[input]', query);
    },
    onQueryClear: () => {
      console.log('[clear]');
    },
    onHistoryPick: (query) => {
      console.log('[history]', query);
    },
  },
  INITIAL_HISTORY,
);

appView.focusSearch();
