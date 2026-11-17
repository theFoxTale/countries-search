export type Tags = keyof HTMLElementTagNameMap;

/**
 * Свойства для создания DOM-элемента.
 *
 * Все поля опциональны и являются общими для всех типов.
 * Порядок применения: `classes` → `text` → `attrs` → `styles` → `props` → `children`.
 */
export type ElementAttributes = {
  /**
   * Список CSS-классов.
   *
   * Добавляются через `classList.add`, поэтому
   * пустые строки и дубликаты безопасны (дубликаты схлопываются браузером).
   *
   * @example ['container', 'container--dark']
   */
  classes?: readonly string[];

  /**
   * Текстовое содержимое элемента.
   *
   * Устанавливается через `textContent`, поэтому HTML-теги в строке
   * не интерпретируются — это безопасно от XSS, но не позволяет вставлять разметку.
   *
   * Применяется до `children`: если заданы оба, `text` окажется перед дочерними узлами.
   * Это осознанное поведение: например, `{ text: 'Score: ', children: [span] }`
   * даёт `Score: <span>…</span>`.
   */
  text?: string;

  /**
   * HTML-атрибуты элемента.
   *
   * Для строковых значений вызывается `setAttribute(key, value)`.
   *
   * Для `boolean`:
   * - `true` — атрибут присутствует с пустым значением (presence-семантика
   *   для `disabled`, `checked`, `hidden` и т.п.);
   * - `false` — атрибут отсутствует.
   *
   * Для ARIA-атрибутов (`aria-pressed`, `aria-expanded`) передавать строки явно:
   * `{ 'aria-pressed': 'true' }`. `boolean` даст `aria-pressed=""`, что для ARIA неверно.
   *
   * Внимание: `attrs` задаёт default-значения (`value`, `checked`), а не текущие.
   * Для текущего значения формы используйте `props` или устанавливайте свойство после создания:
   * `input.value = 'spain'`.
   *
   * @example { type: 'button', disabled: true, 'aria-label': 'Submit' }
   */
  attrs?: Readonly<Record<string, string | boolean>>;

  /**
   * Inline-стили для элемента.
   *
   * Применяются через `style.setProperty`.
   * Поддерживаются имена в kebab-case (`background-color`) и camelCase (`backgroundColor`) -
   * вторые нормализуются в первые. CSS-переменные (`--color`) передаются как есть.
   *
   * Значения - строки с единицами измерения ('12px', '1.5rem').
   * Числа без единиц не приводятся к пикселям.
   *
   * @example { 'background-color': 'var(--accent)', borderRadius: '4px' }
   */
  styles?: Readonly<Record<string, string>>;

  /**
   * DOM-свойства элемента (не атрибуты).
   *
   * Применяются через `Object.assign(el, props)` после `attrs`/`styles`, но до `children`.
   * Нужны для controlled-свойств форм: `value`, `checked`, `selectedIndex`, `disabled`
   * (как property, а не как атрибут).
   *
   * @example { value: 'spain', checked: true }
   */
  props?: Readonly<Record<string, unknown>>;

  /**
   * Дочерние узлы: DOM-элементы, текстовые узлы, фрагменты или строки.
   * Вставляются через `append` после применения остальных свойств.
   *
   * Строки превращаются в текстовые узлы (`append`-поведение): `children: ['hello', input]`
   * эквивалентно `[document.createTextNode('hello'), input]`, но короче.
   *
   * HTML-теги в строках не интерпретируются.
   *
   * События вешайте через `addEventListener` после создания,
   * в `attrs` и `props` обработчики не передаются.
   *
   * @example ['Score: ', scoreSpan]
   * @example [input, button]
   */
  children?: readonly (Node | string)[];
};

export type ElementProperties<T extends Tags> = ElementAttributes & { tag: T };

/**
 * Нормализует имя CSS-свойства для `style.setProperty`.
 * CSS-переменные (`--foo`) и kebab-case (`background-color`) возвращаются как есть,
 * camelCase (`backgroundColor`) превращается в kebab-case.
 */
function normalizeCssPropertyName(name: string): string {
  return name.startsWith('--') || name.includes('-')
    ? name
    : name.replaceAll(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}

/**
 * Создаёт DOM-элемент с заданными свойствами.
 *
 * Не мутирует `properties`.
 * При одинаковых `properties` возвращает структурно одинаковый элемент.
 *
 * @template T - тег создаваемого элемента (определяет тип результата).
 * @param properties - свойства элемента; `tag` обязателен.
 * @returns DOM-элемент типа `HTMLElementTagNameMap[T]`.
 */
export function createElement<T extends Tags>(properties: ElementProperties<T>): HTMLElementTagNameMap[T] {
  const el = document.createElement(properties.tag);

  if (properties.classes?.length) {
    el.classList.add(...properties.classes);
  }

  if (properties.text !== undefined) {
    el.textContent = properties.text;
  }

  if (properties.attrs) {
    for (const [key, value] of Object.entries(properties.attrs)) {
      if (typeof value === 'boolean') {
        el.toggleAttribute(key, value);
      } else {
        el.setAttribute(key, value);
      }
    }
  }

  if (properties.styles) {
    for (const [key, value] of Object.entries(properties.styles)) {
      el.style.setProperty(normalizeCssPropertyName(key), value);
    }
  }

  if (properties.props) {
    Object.assign(el, properties.props);
  }

  if (properties.children?.length) {
    el.append(...properties.children);
  }

  return el;
}

/**
 * Создаёт div через createElement — самый часто используемый контейнер.
 * Просто синтаксический сахар для удобства.
 */
export function createDiv(properties: ElementAttributes = {}): HTMLDivElement {
  return createElement({ ...properties, tag: 'div' });
}
