# Country Search

Живой поиск стран по имени через публичный API [countries.dev](https://countries.dev) с отменой устаревших запросов через `AbortController` и обработкой гонки ответов.

![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-dev_server-646CFF?logo=vite&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-tested-6E9F18?logo=vitest&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-flat_config-4B32C3?logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/Prettier-formatted-F7B93E?logo=prettier&logoColor=black)
![Husky](https://img.shields.io/badge/Husky-pre--commit_%2B_pre--push-000000?logo=git&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub_Pages-222222?logo=githubpages&logoColor=white)

## Демо:

**[Ссылка](https://github.com/theFoxTale/countries-search/)**.

## Стек проекта:

| Область        | Инструменты                                                               |
| -------------- | ------------------------------------------------------------------------- |
| Язык           | TypeScript (strict), ES2022+                                              |
| Сборка         | `tsc` (ES-модули), Vite (dev-сервер)                                      |
| Тестирование   | Vitest, `vi.useFakeTimers()`, `vi.stubGlobal('fetch', ...)`               |
| Линтинг        | ESLint (flat config, `typescript-eslint` strict), `eslint-plugin-unicorn` |
| Форматирование | Prettier                                                                  |
| Git-хуки       | Husky, `lint-staged`                                                      |
| Async / сеть   | `fetch`, `AbortController`, `AbortSignal.any`, `AbortSignal.timeout`      |
| Деплой         | GitHub Pages                                                              |
| CI-проверки    | `tsc --noEmit`, ESLint, Vitest (`pre-push`)                               |

## Скрипты для работы с проектом:

| Скрипт               | Команда                          | Что делает                                                                                                                                  | Когда запускать                                                                                               |
| -------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `npm run dev`        | `vite`                           | Запускает dev-сервер с HMR. Браузер открывается автоматически (`server.open` в `vite.config.ts`).                                           | Во время разработки — основной режим.                                                                         |
| `npm run build`      | `tsc --noEmit && vite build`     | Проверяет типы без эмита (`tsc --noEmit`), затем собирает продакшен-бандл в `dist/`. Сборка не начнётся, если есть TS-ошибки.               | Перед деплоем и как локальная проверка «всё ли компилируется».                                                |
| `npm run preview`    | `vite preview`                   | Поднимает локальный сервер на собранном `dist/` (по умолчанию `http://localhost:4173`). Браузер открывается автоматически (`preview.open`). | После `npm run build` — проверить, что прод-сборка работает (в т.ч. пути под `base`).                         |
| `npm test`           | `vitest run`                     | Прогоняет все тесты **один раз** и выходит. Это режим для CI и Husky `pre-push`.                                                            | Локально перед коммитом/пушем; в CI; автоматически на `pre-push`.                                             |
| `npm run test:watch` | `vitest`                         | Запускает Vitest в watch-режиме: тесты перезапускаются при изменении файлов.                                                                | Во время TDD-цикла (красный → зелёный).                                                                       |
| `npm run typecheck`  | `tsc --noEmit`                   | Только проверка типов, без сборки. Быстрее, чем `build`, потому что не запускает Vite.                                                      | Быстрая проверка типов после правок, не связанных с рантаймом.                                                |
| `npm run lint`       | `eslint .`                       | Проверяет весь проект ESLint-правилами (TS strict, unicorn, prettier-совместимость).                                                        | Перед коммитом; вручную после крупных правок.                                                                 |
| `npm run lint:fix`   | `eslint . --fix`                 | То же, что `lint`, но с автоисправлением всего, что ESLint умеет чинить сам.                                                                | Когда `lint` падает на тривиальных правилах.                                                                  |
| `npm run format`     | `prettier --write .`             | Форматирует все файлы через Prettier (`.ts`, `.js`, `.json`, `.md`, `.css`).                                                                | После крупных правок или если забыл прогнать `lint:fix`.                                                      |
| `npm run deploy`     | `vite build && gh-pages -d dist` | Собирает продакшен-бандл и публикует содержимое `dist/` в ветку `gh-pages` (GitHub Pages).                                                  | При релизе — руками, после зелёного `npm test` и `npm run lint`.                                              |
| `npm run prepare`    | `husky`                          | Устанавливает Git-хуки из `.husky/` в `.git/hooks/`.                                                                                        | Автоматически — при `npm install` / `npm ci` (это и есть `prepare`). Вручную — только если хуки «потерялись». |

## Запуск проекта:

```bash
# 1. Установить зависимости (Husky подключится автоматически через `prepare`)
npm ci

# 2. Запустить dev-сервер (браузер откроется сам)
npm run dev

# 3. Перед PR — прогнать все проверки
npm run typecheck && npm run lint && npm test
```

Требования: Node.js ≥ 20, npm ≥ 10.
