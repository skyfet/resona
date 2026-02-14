const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { attachTestBridge } = require('../src/testing/bridge.js');

function round(value) {
  return Math.round(value * 100) / 100;
}

function createGameState() {
  return {
    mode: 'playing',
    chapter: 4,
    objective: 'Objective',
    storyLine: 'Story',
    player: {
      x: 1.111,
      y: 2.222,
      vx: 0.333,
      vy: 0.444,
      hp: 10,
      maxHp: 20,
      mana: 8.888,
      maxMana: 10,
      level: 3,
      invuln: 0.1,
      dodgeCooldown: 0.01,
      basicCooldown: 0.02,
      windCooldown: 0.03,
      leafCooldown: 0.04,
      bridgeSprint: 0.05,
    },
    flags: {
      grandmaTalked: true,
      wolfDefeated: false,
      leafFallUnlocked: true,
      healerFound: true,
      rescuedHealer: false,
      lakeQuestDone: false,
      bridgePassed: true,
      organizerTalked: false,
      registrationComplete: false,
      batsDefeated: false,
      skillChoiceMade: true,
    },
    gathered: 1,
    gatherGoal: 5,
    skills: { windGust: true, leafFall: false, directBurst: false, poisonBloom: true },
    inventory: {
      mint: 1,
      glassStone: 2,
      wetFrog: 3,
      firefly: 4,
      denseReed: 5,
      flaxSeed: 6,
      fishOil: 7,
      magicFang: 8,
      healingPotion: 9,
      healingRecipeScroll: 10,
    },
    recipeBook: { hasHealingRecipe: true, learnedHealingPotion: false, open: false },
    wolf: { alive: true, x: 11.111, y: 22.222, hp: 30 },
    enemies: [{ alive: true, kind: 'bat', x: 44.444, y: 55.555, hp: 13.333, dotTimer: 1.234 }],
    drops: [{ type: 'coin', x: 7.777, y: 8.888 }],
    lakes: [{ x: 9.999, y: 10.101, r: 11.111 }],
    collectibles: [{ collected: false, type: 'herb', name: 'mint', x: 12.12, y: 13.13 }],
    obstacles: [{ id: 'obs', x: 1, y: 2, w: 3, h: 4 }],
    breakables: [{ chapter: 4, id: 'br', name: 'barrel', x: 5, y: 6, w: 7, h: 8, broken: false }],
    savePoints: [{ id: 'save_1', x: 14.141, y: 15.151, activated: 1 }],
    checkpointMeta: { id: 'cp', chapter: 4, savedAt: null },
    lakeQuest: { fishOilCollected: 2, fishOilGoal: 8 },
    bridgeChallenge: { elapsed: 2.345 },
    registration: { active: false, index: 0, score: 0 },
    skillChoice: { active: true, selected: 'poison_bloom' },
    gacha: {
      wishTokens: 3,
      spins: 4,
      lastPull: 'a',
      lastResults: ['a', 'b'],
      collection: { a: 1 },
      activeBannerId: 'banner',
    },
    ui: { menuOpen: false, gachaOpen: true, characterMenuOpen: false, worldMapOpen: true },
    party: { leader: 'resona', members: ['resona', 'ally'] },
    combatMods: { bonusDamage: 1, dotDamage: 2, damageReduction: 3, allyRegen: 4 },
    healer: { x: 16.161, y: 17.171 },
    organizer: { x: 18.181, y: 19.191 },
    registrar: { x: 20.202, y: 21.212 },
    dialogue: { lines: ['hello'], index: 0 },
  };
}

test('render_game_to_text matches snapshot structure', () => {
  const targetWindow = {};
  const state = createGameState();

  const api = {
    getState: () => state,
    chapterNames: { 4: 'Chapter 4' },
    round,
    setManualStepping: () => {},
    step: 1 / 60,
    update: () => {},
    render: () => {},
  };

  attachTestBridge(targetWindow, api);
  const payload = JSON.parse(targetWindow.render_game_to_text());

  const snapshotPath = path.join(__dirname, 'snapshots', 'render-game-to-text.snapshot.json');
  const expected = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
  assert.deepEqual(payload, expected);
});

test('advanceTime uses fixed steps and render', () => {
  const targetWindow = {};
  let manualStepping = false;
  let updates = 0;
  let rendered = 0;

  attachTestBridge(targetWindow, {
    getState: () => createGameState(),
    chapterNames: { 4: 'Chapter 4' },
    round,
    setManualStepping: (value) => {
      manualStepping = value;
    },
    step: 1 / 60,
    update: () => {
      updates += 1;
    },
    render: () => {
      rendered += 1;
    },
  });

  targetWindow.advanceTime(100);

  assert.equal(manualStepping, true);
  assert.equal(updates, 6);
  assert.equal(rendered, 1);
});
