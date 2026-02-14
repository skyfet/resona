function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const PERSISTABLE_STATE_FIELDS = {
  root: ['chapter', 'maxChapterUnlocked', 'mode', 'objective', 'hint', 'storyLine', 'gatherGoal', 'gathered'],
  nested: {
    lakeQuest: ['fishOilGoal', 'fishOilCollected'],
    flags: [
      'grandmaTalked',
      'wolfDefeated',
      'leafFallUnlocked',
      'healerFound',
      'rescuedHealer',
      'lakeQuestDone',
      'bridgePassed',
      'organizerTalked',
      'registrationComplete',
      'batsDefeated',
      'skillChoiceMade',
      'snoopGlassTaken',
    ],
    skills: ['windGust', 'leafFall', 'directBurst', 'poisonBloom'],
    player: ['x', 'y', 'dirX', 'dirY', 'speed', 'hp', 'maxHp', 'mana', 'maxMana', 'level', 'bridgeSprint'],
    combatMods: ['bonusDamage', 'dotDamage', 'damageReduction', 'allyRegen'],
    inventory: [
      'mint',
      'glassStone',
      'wetFrog',
      'firefly',
      'denseReed',
      'flaxSeed',
      'fishOil',
      'magicFang',
      'healingPotion',
      'healingRecipeScroll',
      'emptyJar',
      'blackSlime',
      'amulet',
      'wolfFangBonus',
    ],
    recipeBook: ['hasHealingRecipe', 'learnedHealingPotion'],
    loadout: [
      'characters',
      'weapons',
      'amulets',
      'selectedCharacter',
      'selectedWeapon',
      'selectedAmulet',
      'bonusSkillPoints',
      'lastMilestone',
    ],
    bridgeChallenge: ['elapsed', 'failures'],
    registration: ['active', 'index', 'score'],
    skillChoice: ['active', 'selected'],
    gacha: ['wishTokens', 'spins', 'lastPull', 'lastResults', 'collection', 'activeBannerId'],
  },
};

const RUNTIME_STATE_DEFAULTS = {
  hintTimer: 0,
  storyLineTimer: 0,
  flash: 0,
  projectiles: [],
  leafBursts: [],
  sparks: [],
  dialogue: null,
  ui: {
    menuOpen: false,
    gachaOpen: false,
    inventoryOpen: false,
    worldMapOpen: false,
    characterMenuOpen: false,
    collectionOpen: false,
    gachaResultOpen: false,
    menuTab: 'characters',
    characterSelection: 0,
    weaponSelection: 0,
    amuletSelection: 0,
  },
};

function pickFields(source, keys) {
  const output = {};
  if (!isPlainObject(source)) return output;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key) && source[key] !== undefined) {
      output[key] = clone(source[key]);
    }
  }
  return output;
}

function normalizePersistableState(state) {
  const persistableState = {
    ...pickFields(state, PERSISTABLE_STATE_FIELDS.root),
  };

  for (const [section, keys] of Object.entries(PERSISTABLE_STATE_FIELDS.nested)) {
    persistableState[section] = pickFields(state[section], keys);
  }

  return persistableState;
}

function sanitizeCheckpointSnapshot(snapshot) {
  if (!isPlainObject(snapshot)) return null;

  const persistable = isPlainObject(snapshot.persistableState) ? snapshot.persistableState : snapshot;
  if (typeof persistable.chapter !== 'number' || Number.isNaN(persistable.chapter)) return null;
  if (!isPlainObject(persistable.player) || !isPlainObject(persistable.inventory)) return null;

  const normalizedPersistable = normalizePersistableState(persistable);
  normalizedPersistable.chapter = Math.max(0, Math.floor(persistable.chapter));
  normalizedPersistable.maxChapterUnlocked =
    typeof persistable.maxChapterUnlocked === 'number' && !Number.isNaN(persistable.maxChapterUnlocked)
      ? Math.max(0, Math.floor(persistable.maxChapterUnlocked))
      : undefined;

  return {
    version: typeof snapshot.version === 'number' ? Math.floor(snapshot.version) : 1,
    savedAt: typeof snapshot.savedAt === 'number' ? snapshot.savedAt : 0,
    savePointId: snapshot.savePointId ?? null,
    persistableState: normalizedPersistable,
  };
}

function migrateCheckpointByVersion(snapshot) {
  if (snapshot.version <= 1) {
    return {
      ...snapshot,
      version: 2,
      persistableState: normalizePersistableState(snapshot.persistableState),
    };
  }

  return {
    ...snapshot,
    version: 2,
    persistableState: normalizePersistableState(snapshot.persistableState),
  };
}

function serializeCheckpoint(state, savePointId = null) {
  return {
    version: 2,
    savedAt: Date.now(),
    savePointId,
    persistableState: normalizePersistableState(state),
  };
}

function deserializeCheckpoint(raw) {
  const sanitized = sanitizeCheckpointSnapshot(raw);
  if (!sanitized) return null;

  const migrated = migrateCheckpointByVersion(sanitized);
  return {
    version: migrated.version,
    savedAt: migrated.savedAt,
    savePointId: migrated.savePointId,
    persistableState: migrated.persistableState,
    runtimeState: clone(RUNTIME_STATE_DEFAULTS),
  };
}

module.exports = {
  PERSISTABLE_STATE_FIELDS,
  RUNTIME_STATE_DEFAULTS,
  sanitizeCheckpointSnapshot,
  serializeCheckpoint,
  deserializeCheckpoint,
};
