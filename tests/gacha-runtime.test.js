import test from "node:test";
import assert from "node:assert/strict";
import {
  getActiveBanner,
  getWeaponDefinition,
  getCharacterDefinition,
  runGachaSpins,
} from "../src/systems/gacha-runtime.js";

function createGachaState() {
  return {
    wishTokens: 3,
    spins: 0,
    lastPull: null,
    lastResults: [],
    activeBannerId: "forest",
    collection: {
      characters: [],
      weapons: {},
    },
    config: {
      weapons: [{ id: "w1", name: "Blade" }],
      characters: [{ id: "c1", name: "Liora" }],
      banners: [
        {
          banner_id: "forest",
          cost_amount: 1,
          character_chance: 1,
          weapon_pool: [{ id: "w1", weight: 1 }],
          character_pool: [{ id: "c1", weight: 1 }],
        },
      ],
    },
  };
}

test("gacha runtime resolves active banner and definitions", () => {
  const gacha = createGachaState();
  assert.equal(getActiveBanner(gacha)?.banner_id, "forest");
  assert.equal(getWeaponDefinition(gacha, "w1")?.name, "Blade");
  assert.equal(getCharacterDefinition(gacha, "c1")?.name, "Liora");
});

test("runGachaSpins awards reward and updates counters", () => {
  const gacha = createGachaState();
  const hints = [];
  const ok = runGachaSpins({
    gacha,
    spins: 1,
    setHint: (msg) => hints.push(msg),
    pickByWeight: (pool) => pool[0],
    randomValue: () => 0,
    now: () => 123,
  });

  assert.equal(ok, true);
  assert.equal(gacha.wishTokens, 2);
  assert.equal(gacha.spins, 1);
  assert.equal(gacha.lastPull.itemId, "c1");
  assert.deepEqual(gacha.collection.characters, ["c1"]);
  assert.equal(gacha.lastResults.length, 1);
  assert.equal(hints.length > 0, true);
});

test("runGachaSpins compensates duplicate character", () => {
  const gacha = createGachaState();
  gacha.collection.characters.push("c1");
  const hints = [];

  const ok = runGachaSpins({
    gacha,
    spins: 1,
    setHint: (msg) => hints.push(msg),
    pickByWeight: (pool) => pool[0],
    randomValue: () => 0,
    now: () => 124,
  });

  assert.equal(ok, true);
  assert.equal(gacha.wishTokens, 3);
  assert.equal(gacha.spins, 1);
  assert.equal(hints.some((msg) => msg.includes("Компенсация")), true);
});

test("runGachaSpins returns false when banner is missing", () => {
  const gacha = createGachaState();
  gacha.activeBannerId = "missing";
  let hint = "";
  const ok = runGachaSpins({
    gacha,
    spins: 1,
    setHint: (msg) => {
      hint = msg;
    },
  });

  assert.equal(ok, false);
  assert.equal(hint.includes("Конфиг баннера"), true);
});
