import { createElement } from '../../dom';

export function createErrorState(message: string, onRetry: () => void): HTMLElement {
  const retryButton = createElement({
    tag: 'button',
    classes: ['status__button'],
    attrs: { type: 'button' },
    text: 'Повторить',
  });

  retryButton.addEventListener('click', () => {
    onRetry();
  });

  return createElement({
    tag: 'div',
    classes: ['status__container'],
    children: [
      createElement({
        tag: 'p',
        classes: ['status__text'],
        text: message,
      }),
      retryButton,
    ],
  });
}
