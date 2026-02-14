(function attachResonaStateFactories(global) {
  const registrationQuestions = [
    { q: "Вопрос 1: Что важнее у источника?", a: "A: личная выгода", b: "B: общая защита", correct: "B" },
    { q: "Вопрос 2: При тревоге вы...", a: "A: предупреждаете всех", b: "B: уходите в укрытие", correct: "A" },
    { q: "Вопрос 3: Работа в отряде это...", a: "A: координация и дисциплина", b: "B: каждый сам за себя", correct: "A" },
  ];

  function createPlayerState() {
    return {
      x: 72, y: 124, vx: 0, vy: 0, dirX: 1, dirY: 0, speed: 68,
      hp: 100, maxHp: 100, mana: 24, maxMana: 24, manaRegen: 4.5, level: 1,
      invuln: 0, dodgeTimer: 0, dodgeCooldown: 0, basicCooldown: 0, windCooldown: 0, leafCooldown: 0,
      bridgeSprint: 0, critChance: 0.08,
    };
  }

  function createWorldState() {
    return {
      chapter: 0,
      worldBounds: { x: 24, y: 34, w: 272, h: 134 },
      collectibles: [], obstacles: [], breakables: [], enemies: [], drops: [], lakes: [],
      wolf: null,
      savePoints: [],
      checkpointMeta: { id: null, chapter: null, savedAt: 0 },
      gatherGoal: 3,
      gathered: 0,
      lakeQuest: { fishOilGoal: 3, fishOilCollected: 0 },
      bridgeChallenge: { active: false, elapsed: 0, sprintCooldown: 0, failures: 0, planks: [] },
      resourceSpawner: {
        active: false, fireflyTimer: 1.8, reedTimer: 3.6, flaxTimer: 2.8,
        fireflyLimit: 0, reedLimit: 0, flaxLimit: 0, spawned: false,
      },
    };
  }

  function createUiState() {
    return {
      menuOpen: false, gachaOpen: false, inventoryOpen: false, worldMapOpen: false,
      characterMenuOpen: false, collectionOpen: false, gachaResultOpen: false,
      menuTab: "characters", characterSelection: 0, weaponSelection: 0, amuletSelection: 0,
    };
  }

  function createProgressState() {
    return {
      flags: {
        grandmaTalked: false, wolfDefeated: false, leafFallUnlocked: false, healerFound: false,
        rescuedHealer: false, lakeQuestDone: false, bridgePassed: false, organizerTalked: false,
        registrationComplete: false, batsDefeated: false, skillChoiceMade: false, snoopGlassTaken: false,
      },
      skills: { windGust: true, leafFall: false, directBurst: false, poisonBloom: false },
      registration: {
        active: false, index: 0, score: 0,
        questions: registrationQuestions.map((question) => ({ ...question })),
      },
      skillChoice: { active: false, selected: null },
      combatMods: { bonusDamage: 0, dotDamage: 0, damageReduction: 0, allyRegen: 0 },
      maxChapterUnlocked: 0,
      mapSelection: 0,
    };
  }

  function createEconomyState() {
    return {
      inventory: {
        mint: 0, glassStone: 0, wetFrog: 0, firefly: 0, denseReed: 0, flaxSeed: 0,
        fishOil: 0, magicFang: 0, healingPotion: 0, healingRecipeScroll: 0, emptyJar: 0,
        blackSlime: 0, amulet: 0, wolfFangBonus: "",
      },
      recipeBook: { hasHealingRecipe: false, learnedHealingPotion: false, open: false },
      gacha: {
        wishTokens: 3, spins: 0, lastPull: null, lastResults: [], activeBannerId: "standard_forest",
        collection: { characters: [], weapons: {} },
        config: { currencies: [], weapons: [], characters: [], banners: [] },
      },
      loadout: {
        characters: ["listi", "healer"], weapons: ["forest_blade", "sky_book"], amulets: ["none", "falcon_ring"],
        selectedCharacter: "listi", selectedWeapon: "forest_blade", selectedAmulet: "none",
        bonusSkillPoints: 0, lastMilestone: 0,
      },
      party: { leader: "Листи", members: [] },
    };
  }

  function createInitialState() {
    return {
      mode: "menu",
      hero: "listi",
      time: 0,
      objective: "Нажмите «Новая игра», чтобы войти в открытую долину.",
      hint: "-",
      hintTimer: 0,
      storyLine: "",
      storyLineTimer: 0,
      flash: 0,
      grandma: { x: 118, y: 96, r: 11 },
      door: { x: 286, y: 82, w: 12, h: 24 },
      organizer: { x: 116, y: 96, r: 12 },
      registrar: { x: 240, y: 102, r: 12 },
      healer: { x: 248, y: 98, r: 10 },
      worldDecorSeed: {},
      projectiles: [],
      leafBursts: [],
      sparks: [],
      dialogue: null,
      player: createPlayerState(),
      world: createWorldState(),
      ui: createUiState(),
      progress: createProgressState(),
      economy: createEconomyState(),
    };
  }

  const CHECKPOINT_SERIALIZED_FIELDS = Object.freeze([
    "version", "savedAt", "savePointId", "chapter", "maxChapterUnlocked", "mode", "objective", "hint", "storyLine", "gatherGoal", "gathered", "lakeQuest", "flags", "skills", "player", "combatMods", "ui", "inventory", "recipeBook", "loadout", "collectibles", "obstacles", "breakables", "lakes", "enemies", "drops", "wolf", "bridgeChallenge", "resourceSpawner", "registration", "skillChoice", "gacha",
  ]);

  const CHECKPOINT_RUNTIME_ONLY_FIELDS = Object.freeze([
    "time", "hintTimer", "storyLineTimer", "flash", "player.vx", "player.vy", "player.invuln", "player.dodgeTimer", "player.dodgeCooldown", "player.basicCooldown", "player.windCooldown", "player.leafCooldown", "ui.menuOpen", "ui.gachaOpen", "ui.inventoryOpen", "ui.worldMapOpen", "ui.characterMenuOpen", "ui.collectionOpen", "ui.gachaResultOpen", "ui.characterSelection", "ui.weaponSelection", "ui.amuletSelection", "projectiles", "leafBursts", "sparks", "dialogue",
  ]);

  global.ResonaStateFactories = {
    createPlayerState,
    createWorldState,
    createUiState,
    createProgressState,
    createEconomyState,
    createInitialState,
    CHECKPOINT_SERIALIZED_FIELDS,
    CHECKPOINT_RUNTIME_ONLY_FIELDS,
  };
})(window);
