import test from "node:test";
import assert from "node:assert/strict";
import {
  clamp,
  roundToTenth,
  formatStatValue,
  randomInt,
  distance,
  seededRandom,
  deepCopyJson,
  withLocalStorage,
} from "../src/core/runtime-helpers.js";

test("runtime helpers clamp and format values consistently", () => {
  assert.equal(clamp(10, 0, 5), 5);
  assert.equal(roundToTenth(1.26), 1.3);
  assert.equal(formatStatValue(2), "2");
  assert.equal(formatStatValue(2.25), "2.3");
});

test("runtime helpers provide deterministic seeded random and geometry", () => {
  const valueA = seededRandom(1234);
  const valueB = seededRandom(1234);
  assert.equal(valueA, valueB);
  assert.equal(distance(0, 0, 3, 4), 5);
});

test("runtime helpers deep-copy json and use storage safely", () => {
  const src = { a: 1, nested: { b: 2 } };
  const clone = deepCopyJson(src);
  clone.nested.b = 3;
  assert.equal(src.nested.b, 2);

  const storage = {
    value: "",
    setItem(_, next) {
      this.value = next;
    },
    getItem() {
      return this.value;
    },
  };

  const ok = withLocalStorage((s) => {
    s.setItem("k", "v");
    return s.getItem("k");
  }, storage);
  assert.equal(ok, "v");
});

test("runtime helpers randomInt stays in range", () => {
  for (let i = 0; i < 30; i += 1) {
    const n = randomInt(2, 5);
    assert.equal(n >= 2 && n <= 5, true);
  }
});
