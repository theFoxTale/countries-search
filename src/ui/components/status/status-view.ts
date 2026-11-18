import type { ViewState } from '../../view-state.ts';
import { createElement } from '../../dom';

import { createHint } from './hint.ts';
import { createLoadingIndicator } from './loading-indicator.ts';
import { createEmptyState } from './empty-state.ts';
import { createErrorState } from './error-state.ts';

export type StatusViewProperties = {
  onRetry: () => void;
};

export type StatusView = {
  root: HTMLElement;
  render: (state: ViewState) => void;
};

export function createStatusView(properties: StatusViewProperties): StatusView {
  const root = createElement({ tag: 'div', classes: ['status'] });

  function render(state: ViewState): void {
    root.replaceChildren();
    root.hidden = false;

    switch (state.status) {
      case 'idle': {
        root.append(createHint());
        break;
      }
      case 'loading': {
        root.append(createLoadingIndicator());
        break;
      }
      case 'empty': {
        root.append(createEmptyState(state.query));
        break;
      }
      case 'error': {
        root.append(createErrorState(state.message, properties.onRetry));
        break;
      }
      case 'results':
      case 'detail': {
        root.hidden = true;
        break;
      }
    }
  }

  return { root, render };
}
