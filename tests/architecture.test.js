const test = require('node:test');
const assert = require('node:assert/strict');

test('checkpoint schema supports v1 migration and round-trip', async () => {
  const { deserializeCheckpoint, serializeCheckpoint } = await import('../src/checkpoint-schema.js');

  const legacy = {
    version: 1,
    chapter: 4,
    player: { hp: 90 },
    inventory: { mint: 2 },
    ui: { menuOpen: true },
  };

  const parsed = deserializeCheckpoint(JSON.stringify(legacy), (x) => x);
  assert.equal(parsed.version, 2);
  assert.equal(parsed.ui.menuOpen, true);
  assert.ok(Object.hasOwn(parsed.ui, 'mode'));

  const encoded = serializeCheckpoint(parsed);
  const reparsed = deserializeCheckpoint(encoded, (x) => x);
  assert.equal(reparsed.version, 2);
  assert.equal(reparsed.chapter, 4);
});

test('ui mode setter prevents conflicting flags', async () => {
  const { setUiMode, UI_MODES } = await import('../src/ui-mode.js');
  const state = {
    ui: {
      menuOpen: false,
      gachaOpen: false,
      inventoryOpen: false,
      worldMapOpen: false,
      characterMenuOpen: false,
      collectionOpen: false,
      gachaResultOpen: false,
    },
  };

  setUiMode(state, UI_MODES.WORLD_MAP);
  assert.equal(state.ui.worldMapOpen, true);
  assert.equal(state.ui.inventoryOpen, false);
  assert.equal(state.ui.characterMenuOpen, false);

  setUiMode(state, UI_MODES.GACHA_RESULT);
  assert.equal(state.ui.gachaResultOpen, true);
  assert.equal(state.ui.gachaOpen, true);
  assert.equal(state.ui.worldMapOpen, false);
});

test('test bridge contract registers APIs and advances steps', async () => {
  const { registerTestBridge, advanceTime } = await import('../src/test-bridge.js');

  const scope = {};
  let updates = 0;
  let renders = 0;

  registerTestBridge(scope, {
    renderGameToText: () => 'ok',
    advanceTimeMs: (ms) => advanceTime(() => { updates += 1; }, () => { renders += 1; }, 1 / 60, ms),
  });

  assert.equal(scope.render_game_to_text(), 'ok');
  scope.advanceTime(1000);
  assert.equal(updates > 0, true);
  assert.equal(renders, 1);
});
