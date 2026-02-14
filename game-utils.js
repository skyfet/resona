(function (globalScope) {
  function isPlainObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  function cloneJson(value, fallback) {
    if (value == null) return fallback;
    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      return fallback;
    }
  }

  function toInt(value, fallback, min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.max(min, Math.min(max, Math.floor(number)));
  }

  function toNumber(value, fallback, min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.max(min, Math.min(max, number));
  }

  function sanitizeBooleanRecord(value) {
    if (!isPlainObject(value)) return {};
    const result = {};
    for (const [key, flag] of Object.entries(value)) {
      result[key] = Boolean(flag);
    }
    return result;
  }

  function sanitizeUi(value) {
    const source = isPlainObject(value) ? value : {};
    return {
      mode: typeof source.mode === "string" ? source.mode : null,
      overlay: typeof source.overlay === "string" ? source.overlay : null,
      menuOpen: Boolean(source.menuOpen),
      gachaOpen: Boolean(source.gachaOpen),
      inventoryOpen: Boolean(source.inventoryOpen),
      worldMapOpen: Boolean(source.worldMapOpen),
      characterMenuOpen: Boolean(source.characterMenuOpen),
      collectionOpen: Boolean(source.collectionOpen),
      gachaResultOpen: Boolean(source.gachaResultOpen),
      menuTab: typeof source.menuTab === "string" ? source.menuTab : "characters",
      characterSelection: toInt(source.characterSelection, 0, 0, 10),
      weaponSelection: toInt(source.weaponSelection, 0, 0, 10),
      amuletSelection: toInt(source.amuletSelection, 0, 0, 10),
    };
  }

  function sanitizeGacha(value) {
    const source = isPlainObject(value) ? value : {};
    const collection = isPlainObject(source.collection) ? source.collection : {};

    const characters = Array.isArray(collection.characters)
      ? Array.from(
          new Set(collection.characters.filter((id) => typeof id === "string" && id.trim().length > 0).map((id) => id.trim())),
        )
      : [];

    const weapons = {};
    if (isPlainObject(collection.weapons)) {
      for (const [id, count] of Object.entries(collection.weapons)) {
        if (typeof id !== "string" || id.trim().length === 0) continue;
        const normalized = toInt(count, 0, 0, Number.MAX_SAFE_INTEGER);
        if (normalized > 0) weapons[id] = normalized;
      }
    }

    return {
      wishTokens: toInt(source.wishTokens, 0, 0, Number.MAX_SAFE_INTEGER),
      spins: toInt(source.spins, 0, 0, Number.MAX_SAFE_INTEGER),
      lastPull: isPlainObject(source.lastPull) ? cloneJson(source.lastPull, null) : null,
      lastResults: Array.isArray(source.lastResults) ? cloneJson(source.lastResults, []).slice(0, 10) : [],
      collection: { characters, weapons },
      activeBannerId: typeof source.activeBannerId === "string" ? source.activeBannerId : null,
    };
  }

  function sanitizeCheckpointSnapshot(snapshot) {
    if (!isPlainObject(snapshot)) return null;
    const chapter = toInt(snapshot.chapter, null, 0, 999);
    if (chapter == null) return null;
    if (!isPlainObject(snapshot.player) || !isPlainObject(snapshot.inventory)) return null;

    const normalized = cloneJson(snapshot, {});
    normalized.version = toInt(snapshot.version, 2, 1, 99);
    normalized.savedAt = toInt(snapshot.savedAt, Date.now(), 0, Number.MAX_SAFE_INTEGER);
    normalized.savePointId = typeof snapshot.savePointId === "string" ? snapshot.savePointId : null;
    normalized.chapter = chapter;
    normalized.maxChapterUnlocked = toInt(snapshot.maxChapterUnlocked, chapter, chapter, 999);
    normalized.mode = typeof snapshot.mode === "string" ? snapshot.mode : "play";
    normalized.objective = typeof snapshot.objective === "string" ? snapshot.objective : "";
    normalized.hint = typeof snapshot.hint === "string" ? snapshot.hint : "";
    normalized.storyLine = typeof snapshot.storyLine === "string" ? snapshot.storyLine : "";
    normalized.gatherGoal = toInt(snapshot.gatherGoal, 3, 0, 999);
    normalized.gathered = toInt(snapshot.gathered, 0, 0, normalized.gatherGoal);
    normalized.lakeQuest = isPlainObject(snapshot.lakeQuest)
      ? {
          fishOilGoal: toInt(snapshot.lakeQuest.fishOilGoal, 0, 0, 999),
          fishOilCollected: toInt(snapshot.lakeQuest.fishOilCollected, 0, 0, 999),
        }
      : { fishOilGoal: 0, fishOilCollected: 0 };

    const player = cloneJson(snapshot.player, {});
    normalized.player = {
      ...player,
      x: toNumber(player.x, 0, -9999, 9999),
      y: toNumber(player.y, 0, -9999, 9999),
      dirX: toNumber(player.dirX, 1, -1, 1),
      dirY: toNumber(player.dirY, 0, -1, 1),
      speed: toNumber(player.speed, 68, 0, 999),
      hp: toInt(player.hp, 100, 0, 9999),
      maxHp: toInt(player.maxHp, 100, 1, 9999),
      mana: toNumber(player.mana, 24, 0, 9999),
      maxMana: toNumber(player.maxMana, 24, 1, 9999),
      level: toInt(player.level, 1, 1, 999),
      bridgeSprint: toNumber(player.bridgeSprint, 0, 0, 60),
    };

    normalized.inventory = cloneJson(snapshot.inventory, {});
    normalized.flags = sanitizeBooleanRecord(snapshot.flags);
    normalized.skills = sanitizeBooleanRecord(snapshot.skills);
    normalized.combatMods = isPlainObject(snapshot.combatMods) ? cloneJson(snapshot.combatMods, {}) : {};
    normalized.ui = sanitizeUi(snapshot.ui);
    normalized.recipeBook = isPlainObject(snapshot.recipeBook) ? cloneJson(snapshot.recipeBook, {}) : {};
    normalized.loadout = isPlainObject(snapshot.loadout) ? cloneJson(snapshot.loadout, {}) : {};
    normalized.collectibles = Array.isArray(snapshot.collectibles) ? cloneJson(snapshot.collectibles, []) : [];
    normalized.obstacles = Array.isArray(snapshot.obstacles) ? cloneJson(snapshot.obstacles, []) : [];
    normalized.breakables = Array.isArray(snapshot.breakables) ? cloneJson(snapshot.breakables, []) : [];
    normalized.lakes = Array.isArray(snapshot.lakes) ? cloneJson(snapshot.lakes, []) : [];
    normalized.enemies = Array.isArray(snapshot.enemies) ? cloneJson(snapshot.enemies, []) : [];
    normalized.drops = Array.isArray(snapshot.drops) ? cloneJson(snapshot.drops, []) : [];
    normalized.wolf = isPlainObject(snapshot.wolf) ? cloneJson(snapshot.wolf, null) : null;
    normalized.bridgeChallenge = isPlainObject(snapshot.bridgeChallenge) ? cloneJson(snapshot.bridgeChallenge, {}) : {};
    normalized.resourceSpawner = isPlainObject(snapshot.resourceSpawner) ? cloneJson(snapshot.resourceSpawner, {}) : {};
    normalized.registration = isPlainObject(snapshot.registration) ? cloneJson(snapshot.registration, {}) : {};
    normalized.skillChoice = isPlainObject(snapshot.skillChoice) ? cloneJson(snapshot.skillChoice, {}) : {};
    normalized.gacha = sanitizeGacha(snapshot.gacha);

    return normalized;
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
