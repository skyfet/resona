# `src/` modules

- `state.js` — экспорт состояния игры и функции полного сброса прогресса.
- `gameplay.js` — тонкий фасад-оркестратор (реэкспорт API движка).
- `gameplay/engine.js` — основной игровой движок (цикл, боевая логика, квесты, переходы).
- `render.js` — рендер сцены и draw-функции (экспорт через модуль рендера).
- `input.js` — обработка клавиатуры, key maps, consume-функции.
- `persistence.js` — чтение/запись чекпоинтов и загрузка gacha-конфига.
- `chapter-config.js` — data-driven описание глав, карты мира и savepoint-конфигов.
- `action-map.js` — единая карта действий и приоритетов контекстов ввода.
- `ui-mode.js` — единая модель `ui.mode/ui.overlay` и синхронизация legacy флагов.
- `checkpoint-schema.js` — serialize/deserialize checkpoint, версия схемы и миграции.
- `gacha-config-schema.js` — нормализация и валидация `gacha-config.json` перед загрузкой в игру.
- `test-bridge.js` — контракт тестового bridge API (`render_game_to_text`, `advanceTime`).
- `core/runtime-helpers.js` — базовые рантайм-утилиты (math/random/deep-copy/storage wrapper).
- `systems/gacha-runtime.js` — изолированный runtime-движок круток, наград и истории баннера.
- `ui/main-menu-controller.js` — контроллер главного меню (фокус, выбор, обработка UI-кнопок).

## Приоритеты ввода

Порядок обработки в `gameplay.js`:
1. blocking-контексты: `dialogue` → `registration` → `skill_choice`.
2. глобальные UI-действия через `action-map`.
3. модальные UI-режимы (`world_map`, `character`, `gacha`, `collection`).
4. gameplay-действия (бой, интеракции, крафт, перемещение).
