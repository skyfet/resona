const test = require('node:test');
const assert = require('node:assert/strict');

const { sanitizeCheckpointSnapshot, pickByWeight } = require('../game-utils.js');

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

  assert.equal(snapshot.chapter, 2);
  assert.equal(snapshot.maxChapterUnlocked, 5);
  assert.deepEqual(snapshot.flags, { wolfDefeated: true });
  assert.deepEqual(snapshot.skills, { windGust: true });
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
