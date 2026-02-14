import test from "node:test";
import assert from "node:assert/strict";
import "../game-utils.js";

const { sanitizeCheckpointSnapshot, pickByWeight } = globalThis.ResonaUtils;

test("sanitizeCheckpointSnapshot rejects malformed payload", () => {
  assert.equal(sanitizeCheckpointSnapshot(null), null);
  assert.equal(sanitizeCheckpointSnapshot({}), null);
  assert.equal(sanitizeCheckpointSnapshot({ chapter: 1, player: {}, inventory: null }), null);
});

test("sanitizeCheckpointSnapshot normalizes basic numeric fields", () => {
  const snapshot = sanitizeCheckpointSnapshot({
    chapter: 2.8,
    maxChapterUnlocked: 5.9,
    gatherGoal: 4.9,
    gathered: 99,
    savePointId: 123,
    player: { hp: 10 },
    inventory: { coins: 4 },
    flags: { wolfDefeated: true },
    skills: { windGust: true },
  });

  assert.equal(snapshot.chapter, 2);
  assert.equal(snapshot.maxChapterUnlocked, 5);
  assert.equal(snapshot.gatherGoal, 4);
  assert.equal(snapshot.gathered, 4);
  assert.equal(snapshot.savePointId, null);
  assert.equal(snapshot.player.maxHp, 100);
  assert.deepEqual(snapshot.flags, { wolfDefeated: true });
  assert.deepEqual(snapshot.skills, { windGust: true });
});

test("sanitizeCheckpointSnapshot normalizes gacha and ui records", () => {
  const snapshot = sanitizeCheckpointSnapshot({
    chapter: 1,
    player: { hp: 50, maxHp: 100, mana: 12, maxMana: 24 },
    inventory: {},
    ui: { menuOpen: 1, menuTab: 7 },
    gacha: {
      wishTokens: -3,
      spins: 10.9,
      collection: {
        characters: ["char_a", "", "char_a"],
        weapons: { blade: 2.8, junk: -9 },
      },
      activeBannerId: 21,
    },
  });

  assert.equal(snapshot.ui.menuOpen, true);
  assert.equal(snapshot.ui.menuTab, "characters");
  assert.equal(snapshot.gacha.wishTokens, 0);
  assert.equal(snapshot.gacha.spins, 10);
  assert.deepEqual(snapshot.gacha.collection.characters, ["char_a"]);
  assert.deepEqual(snapshot.gacha.collection.weapons, { blade: 2 });
  assert.equal(snapshot.gacha.activeBannerId, null);
});

test("pickByWeight handles zero and negative weights safely", () => {
  const pool = [
    { id: "a", weight: -2 },
    { id: "b", weight: 0 },
    { id: "c", weight: 0 },
  ];

  const picked = pickByWeight(pool, () => 0.4);
  assert.equal(picked.id, "a");
});

test("pickByWeight chooses item according to weighted roll", () => {
  const pool = [
    { id: "first", weight: 1 },
    { id: "second", weight: 3 },
  ];

  const first = pickByWeight(pool, () => 0.0);
  const second = pickByWeight(pool, () => 0.9);

  assert.equal(first.id, "first");
  assert.equal(second.id, "second");
});
