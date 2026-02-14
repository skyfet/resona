import test from "node:test";
import assert from "node:assert/strict";
import { normalizeGachaConfig } from "../src/gacha-config-schema.js";

test("normalizeGachaConfig strips invalid entries and keeps valid banner links", () => {
  const { config, isUsable, issues } = normalizeGachaConfig({
    currencies: [{ id: "wish_token", name: "WishToken" }, { id: "wish_token", name: "Duplicate" }],
    weapons: [{ id: "w1", name: "Blade" }],
    characters: [{ id: "c1", name: "Liora" }],
    banners: [
      {
        banner_id: "main",
        title: "Main",
        cost_currency_id: "wish_token",
        cost_amount: 2,
        character_chance: 1.4,
        weapon_pool: [{ id: "w1", weight: 2 }, { id: "bad", weight: 10 }],
        character_pool: [{ id: "c1", weight: 3 }, { id: "c1", weight: 5 }],
      },
      {
        banner_id: "broken",
        weapon_pool: [{ id: "missing", weight: 1 }],
        character_pool: [],
      },
    ],
  });

  assert.equal(isUsable, true);
  assert.equal(config.banners.length, 1);
  assert.equal(config.banners[0].banner_id, "main");
  assert.equal(config.banners[0].character_chance, 1);
  assert.deepEqual(config.banners[0].weapon_pool, [{ id: "w1", weight: 2 }]);
  assert.deepEqual(config.banners[0].character_pool, [{ id: "c1", weight: 3 }]);
  assert.equal(issues.includes("banner_empty_pool:broken"), true);
});

test("normalizeGachaConfig injects fallback currency and marks config unusable without valid banners", () => {
  const { config, isUsable, issues } = normalizeGachaConfig({
    currencies: [],
    banners: [],
  });

  assert.equal(config.currencies[0].id, "wish_token");
  assert.equal(isUsable, false);
  assert.equal(issues.includes("currencies_missing"), true);
  assert.equal(issues.includes("banners_missing_or_invalid"), true);
});
