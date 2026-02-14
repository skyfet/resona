const test = require('node:test');
const assert = require('node:assert/strict');

const { sanitizeCheckpointSnapshot, serializeCheckpoint, deserializeCheckpoint, pickByWeight } = require('../game-utils.js');

test('sanitizeCheckpointSnapshot rejects malformed payload', () => {
  assert.equal(sanitizeCheckpointSnapshot(null), null);
  assert.equal(sanitizeCheckpointSnapshot({}), null);
  assert.equal(sanitizeCheckpointSnapshot({ chapter: 1, player: {}, inventory: null }), null);
});

test('sanitizeCheckpointSnapshot normalizes basic numeric fields', () => {
  const snapshot = sanitizeCheckpointSnapshot({
    chapter: 2.8,
    maxChapterUnlocked: 5.9,
    player: { hp: 10 },
    inventory: { coins: 4 },
    flags: { wolfDefeated: true },
    skills: { windGust: true },
  });

  assert.equal(snapshot.persistableState.chapter, 2);
  assert.equal(snapshot.persistableState.maxChapterUnlocked, 5);
  assert.deepEqual(snapshot.persistableState.flags, { wolfDefeated: true });
  assert.deepEqual(snapshot.persistableState.skills, { windGust: true });
});

test('checkpoint round-trip: state -> checkpoint -> state', () => {
  const state = {
    chapter: 4,
    maxChapterUnlocked: 5,
    mode: 'play',
    objective: 'Test objective',
    hint: 'Hint',
    storyLine: 'Story',
    gatherGoal: 3,
    gathered: 2,
    lakeQuest: { fishOilGoal: 3, fishOilCollected: 1, transient: true },
    flags: { wolfDefeated: true, batsDefeated: false, ignored: true },
    skills: { windGust: true, directBurst: true, ignored: true },
    player: { x: 10, y: 12, hp: 90, maxHp: 100, mana: 20, maxMana: 24, level: 3, dirX: 1, dirY: 0, speed: 68 },
    combatMods: { bonusDamage: 2, dotDamage: 1, damageReduction: 0.1, allyRegen: 0 },
    inventory: { mint: 4, fishOil: 1, blackSlime: 0, notPersisted: 10 },
    recipeBook: { hasHealingRecipe: true, learnedHealingPotion: true, open: true },
    loadout: { selectedCharacter: 'listi', selectedWeapon: 'forest_blade', selectedAmulet: 'none', bonusSkillPoints: 1 },
    bridgeChallenge: { elapsed: 12.2, failures: 1, planks: [1, 2, 3] },
    registration: { active: true, index: 1, score: 2 },
    skillChoice: { active: false, selected: 'directBurst' },
    gacha: { wishTokens: 5, spins: 2, lastPull: { rarity: 'epic' }, lastResults: [1, 2], collection: { characters: ['listi'] }, activeBannerId: 'starter' },
    flash: 99,
    ui: { menuOpen: true },
  };

  const checkpoint = serializeCheckpoint(state, 'sp_01');
  const restored = deserializeCheckpoint(checkpoint);

  assert.equal(restored.version, 2);
  assert.equal(restored.savePointId, 'sp_01');
  assert.equal(restored.persistableState.chapter, 4);
  assert.equal(restored.persistableState.flags.wolfDefeated, true);
  assert.equal(restored.persistableState.flags.ignored, undefined);
  assert.equal(restored.persistableState.inventory.notPersisted, undefined);
  assert.equal(restored.runtimeState.flash, 0);
  assert.equal(restored.runtimeState.ui.menuOpen, false);
});

test('pickByWeight handles zero and negative weights safely', () => {
  const pool = [
    { id: 'a', weight: -2 },
    { id: 'b', weight: 0 },
    { id: 'c', weight: 0 },
  ];

  const picked = pickByWeight(pool, () => 0.4);
  assert.equal(picked.id, 'a');
});

test('pickByWeight chooses item according to weighted roll', () => {
  const pool = [
    { id: 'first', weight: 1 },
    { id: 'second', weight: 3 },
  ];

  const first = pickByWeight(pool, () => 0.0);
  const second = pickByWeight(pool, () => 0.9);

  assert.equal(first.id, 'first');
  assert.equal(second.id, 'second');
});
