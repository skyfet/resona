const CHECKPOINT_VERSION = 2;

function clone(value, fallback) {
  if (value == null) return fallback;
  return JSON.parse(JSON.stringify(value));
}

export function createCheckpointSnapshotFromState(state, savePointId) {
  return {
    version: CHECKPOINT_VERSION,
    savedAt: Date.now(),
    savePointId,
    chapter: state.chapter,
    maxChapterUnlocked: state.maxChapterUnlocked,
    mode: state.mode,
    objective: state.objective,
    hint: state.hint,
    storyLine: state.storyLine,
    gatherGoal: state.gatherGoal,
    gathered: state.gathered,
    lakeQuest: clone(state.lakeQuest, {}),
    flags: clone(state.flags, {}),
    skills: clone(state.skills, {}),
    player: {
      x: state.player.x,
      y: state.player.y,
      dirX: state.player.dirX,
      dirY: state.player.dirY,
      speed: state.player.speed,
      hp: state.player.hp,
      maxHp: state.player.maxHp,
      mana: state.player.mana,
      maxMana: state.player.maxMana,
      level: state.player.level,
      bridgeSprint: state.player.bridgeSprint,
    },
    combatMods: clone(state.combatMods, {}),
    ui: clone(state.ui, {}),
    inventory: clone(state.inventory, {}),
    recipeBook: clone(state.recipeBook, {}),
    loadout: clone(state.loadout, {}),
    collectibles: clone(state.collectibles, []),
    obstacles: clone(state.obstacles, []),
    breakables: clone(state.breakables, []),
    lakes: clone(state.lakes, []),
    enemies: clone(state.enemies, []),
    drops: clone(state.drops, []),
    wolf: clone(state.wolf, null),
    bridgeChallenge: clone(state.bridgeChallenge, {}),
    resourceSpawner: clone(state.resourceSpawner, {}),
    registration: clone(state.registration, {}),
    skillChoice: clone(state.skillChoice, {}),
    gacha: {
      wishTokens: state.gacha.wishTokens,
      spins: state.gacha.spins,
      lastPull: clone(state.gacha.lastPull, null),
      lastResults: clone(state.gacha.lastResults, []),
      collection: clone(state.gacha.collection, {}),
      activeBannerId: state.gacha.activeBannerId,
    },
  };
}

function migrateV1ToV2(snapshot) {
  return {
    ...snapshot,
    version: 2,
    ui: {
      mode: snapshot.ui?.mode || null,
      overlay: snapshot.ui?.overlay || null,
      ...snapshot.ui,
    },
  };
}

export function deserializeCheckpoint(raw, sanitize = null) {
  if (!raw) return null;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  let migrated = parsed;
  if (!migrated.version || migrated.version === 1) {
    migrated = migrateV1ToV2(migrated);
  }
  if (typeof sanitize === "function") {
    return sanitize(migrated);
  }
  return migrated;
}

export function serializeCheckpoint(snapshot) {
  return JSON.stringify(snapshot);
}
