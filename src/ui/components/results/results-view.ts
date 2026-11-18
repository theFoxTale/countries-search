import { createElement } from '../../dom';
import { createCountryList } from './country-list.ts';

import type { ViewState } from '../../view-state.ts';
import type { Country } from '@core';

export type ResultsViewProperties = {
  onCountryPick: (country: Country) => void;
};

export type ResultsView = {
  root: HTMLElement;
  render: (state: ViewState) => void;
};

export function createResultsView(properties: ResultsViewProperties): ResultsView {
  const list = createCountryList({ onPick: properties.onCountryPick });

  const root = createElement({
    tag: 'div',
    classes: ['results-view'],
    attrs: { hidden: true },
    children: [list.root],
  });

  function render(state: ViewState): void {
    root.hidden = true;
    if (state.status === 'results') {
      root.hidden = false;
      list.render(state.countries);
    } else if (state.status === 'detail') {
      console.log('DETAILS POINT');
    }
  }

  return { root, render };
}
