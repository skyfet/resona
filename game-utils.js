(function (globalScope) {
  function isPlainObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  function sanitizeCheckpointSnapshot(snapshot) {
    if (!isPlainObject(snapshot)) return null;
    if (typeof snapshot.chapter !== "number" || Number.isNaN(snapshot.chapter)) return null;
    if (!isPlainObject(snapshot.player) || !isPlainObject(snapshot.inventory)) return null;

    return {
      ...snapshot,
      chapter: Math.max(0, Math.floor(snapshot.chapter)),
      maxChapterUnlocked:
        typeof snapshot.maxChapterUnlocked === "number" && !Number.isNaN(snapshot.maxChapterUnlocked)
          ? Math.max(0, Math.floor(snapshot.maxChapterUnlocked))
          : undefined,
      player: { ...snapshot.player },
      inventory: { ...snapshot.inventory },
      flags: isPlainObject(snapshot.flags) ? { ...snapshot.flags } : {},
      skills: isPlainObject(snapshot.skills) ? { ...snapshot.skills } : {},
    };
  }

  function pickByWeight(pool, randomValueFn = Math.random) {
    if (!Array.isArray(pool) || pool.length === 0) return null;

    const totalWeight = pool.reduce((sum, entry) => {
      const weight = Number(entry && entry.weight);
      return sum + (Number.isFinite(weight) ? Math.max(0, weight) : 0);
    }, 0);

    if (totalWeight <= 0) return pool[0];

    let roll = randomValueFn() * totalWeight;
    for (const entry of pool) {
      const weight = Number(entry && entry.weight);
      roll -= Number.isFinite(weight) ? Math.max(0, weight) : 0;
      if (roll <= 0) return entry;
    }

    return pool[pool.length - 1];
  }

  const api = {
    sanitizeCheckpointSnapshot,
    pickByWeight,
  };

  globalScope.ResonaUtils = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : window);
