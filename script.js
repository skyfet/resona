const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d", { alpha: false });
const menuNode = document.querySelector("#menu");
const startBtn = document.querySelector("#start-btn");
const continueBtn = document.querySelector("#continue-btn");
const helpBtn = document.querySelector("#help-btn");
const loreBtn = document.querySelector("#lore-btn");
const controlsPanel = document.querySelector("#controls-panel");
const menuPanelTitle = document.querySelector("#menu-panel-title");
const menuPanelText = document.querySelector("#menu-panel-text");

const chapterNode = document.querySelector("#chapter-label");
const levelNode = document.querySelector("#level-label");
const hpNode = document.querySelector("#hp-label");
const manaNode = document.querySelector("#mana-label");
const inventoryNode = document.querySelector("#inventory-label");
const coinsNode = document.querySelector("#coins-label");
const objectiveNode = document.querySelector("#objective");
const hintNode = document.querySelector("#hint");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const STEP = 1 / 60;
const CHECKPOINT_STORAGE_KEY = "resona_checkpoint_v1";

const chapterNames = {
  0: "Дом бабушки",
  1: "Маленькая деревня",
  2: "Лесная тропа",
  3: "Старый лесной волк",
  4: "Глубокая чаща",
  5: "Озёрная кромка",
  6: "Старый мост",
  7: "Грибная аллея",
  8: "Налёт летучих мышей",
  9: "Путь защитницы",
};

const keysDown = new Set();
const keysPressed = new Set();

const menuEntries = [
  {
    id: "start",
    button: startBtn,
    title: "Новая игра",
    text: "Начать путь заново: пролог у дома бабушки, базовые задания и постепенное открытие умений.",
    action: () => startGame(),
  },
  {
    id: "continue",
    button: continueBtn,
    title: "Продолжить",
    text: "Загрузить последнее сохранение от кристалла и вернуться в нужную главу.",
    action: () => continueFromStoredCheckpoint(),
    hidden: () => !readStoredCheckpoint(),
  },
  {
    id: "help",
    button: helpBtn,
    title: "Как играть",
    text: "Управление, боевая система и быстрые подсказки по выживанию в лесу.",
    action: () => showControlsPanel(),
  },
  {
    id: "lore",
    button: loreBtn,
    title: "О мире игры",
    text: "Вы — эльфийка-защитница. Источник теряет силу, и вам нужно собрать команду, пройти испытания и остановить угрозу.",
    action: () => showLorePanel(),
  },
];

const menuState = {
  selectedIndex: 0,
};

const forestDecor = {
  2: [
    { x: 20, y: 34, s: 1.2 },
    { x: 56, y: 30, s: 1.3 },
    { x: 100, y: 34, s: 1.15 },
    { x: 144, y: 32, s: 1.25 },
    { x: 188, y: 30, s: 1.4 },
    { x: 236, y: 34, s: 1.2 },
    { x: 286, y: 32, s: 1.3 },
    { x: 30, y: 154, s: 1.2 },
    { x: 86, y: 150, s: 1.3 },
    { x: 134, y: 152, s: 1.25 },
    { x: 178, y: 150, s: 1.25 },
    { x: 226, y: 152, s: 1.35 },
    { x: 280, y: 150, s: 1.2 },
  ],
  3: [
    { x: 24, y: 30, s: 1.3 },
    { x: 74, y: 28, s: 1.2 },
    { x: 124, y: 30, s: 1.4 },
    { x: 176, y: 28, s: 1.2 },
    { x: 228, y: 30, s: 1.35 },
    { x: 278, y: 28, s: 1.2 },
    { x: 40, y: 154, s: 1.2 },
    { x: 98, y: 150, s: 1.35 },
    { x: 152, y: 152, s: 1.25 },
    { x: 208, y: 150, s: 1.35 },
    { x: 262, y: 152, s: 1.25 },
  ],
  4: [
    { x: 18, y: 28, s: 1.45 },
    { x: 60, y: 26, s: 1.3 },
    { x: 104, y: 28, s: 1.45 },
    { x: 148, y: 26, s: 1.35 },
    { x: 194, y: 28, s: 1.5 },
    { x: 240, y: 26, s: 1.4 },
    { x: 286, y: 28, s: 1.35 },
    { x: 24, y: 156, s: 1.3 },
    { x: 80, y: 152, s: 1.25 },
    { x: 134, y: 154, s: 1.35 },
    { x: 188, y: 152, s: 1.25 },
    { x: 240, y: 154, s: 1.35 },
    { x: 294, y: 152, s: 1.2 },
  ],
  5: [
    { x: 16, y: 28, s: 1.3 },
    { x: 56, y: 26, s: 1.2 },
    { x: 106, y: 30, s: 1.3 },
    { x: 154, y: 28, s: 1.25 },
    { x: 206, y: 30, s: 1.3 },
    { x: 254, y: 26, s: 1.2 },
    { x: 300, y: 28, s: 1.25 },
    { x: 28, y: 156, s: 1.2 },
    { x: 84, y: 152, s: 1.25 },
    { x: 136, y: 154, s: 1.2 },
    { x: 194, y: 152, s: 1.3 },
    { x: 248, y: 154, s: 1.2 },
    { x: 302, y: 152, s: 1.15 },
  ],
  6: [
    { x: 20, y: 28, s: 1.2 },
    { x: 70, y: 28, s: 1.15 },
    { x: 124, y: 28, s: 1.2 },
    { x: 180, y: 28, s: 1.15 },
    { x: 238, y: 28, s: 1.2 },
    { x: 292, y: 28, s: 1.15 },
    { x: 20, y: 156, s: 1.2 },
    { x: 74, y: 154, s: 1.2 },
    { x: 126, y: 154, s: 1.15 },
    { x: 182, y: 154, s: 1.2 },
    { x: 236, y: 154, s: 1.15 },
    { x: 292, y: 154, s: 1.2 },
  ],
  7: [
    { x: 18, y: 26, s: 1.25 },
    { x: 62, y: 28, s: 1.2 },
    { x: 112, y: 26, s: 1.3 },
    { x: 162, y: 28, s: 1.2 },
    { x: 214, y: 26, s: 1.3 },
    { x: 266, y: 28, s: 1.2 },
    { x: 304, y: 26, s: 1.15 },
    { x: 24, y: 156, s: 1.2 },
    { x: 80, y: 152, s: 1.25 },
    { x: 138, y: 154, s: 1.2 },
    { x: 196, y: 152, s: 1.25 },
    { x: 252, y: 154, s: 1.2 },
    { x: 304, y: 152, s: 1.15 },
  ],
  8: [
    { x: 18, y: 26, s: 1.25 },
    { x: 62, y: 28, s: 1.2 },
    { x: 112, y: 26, s: 1.3 },
    { x: 162, y: 28, s: 1.2 },
    { x: 214, y: 26, s: 1.3 },
    { x: 266, y: 28, s: 1.2 },
    { x: 304, y: 26, s: 1.15 },
    { x: 24, y: 156, s: 1.2 },
    { x: 80, y: 152, s: 1.25 },
    { x: 138, y: 154, s: 1.2 },
    { x: 196, y: 152, s: 1.25 },
    { x: 252, y: 154, s: 1.2 },
    { x: 304, y: 152, s: 1.15 },
  ],
};

const state = {
  mode: "menu",
  chapter: 0,
  time: 0,
  objective: "Нажмите «Начать путь»",
  hint: "-",
  hintTimer: 0,
  storyLine: "",
  storyLineTimer: 0,
  flash: 0,
  worldBounds: { x: 24, y: 34, w: 272, h: 134 },
  flags: {
    grandmaTalked: false,
    wolfDefeated: false,
    leafFallUnlocked: false,
    healerFound: false,
    rescuedHealer: false,
    lakeQuestDone: false,
    bridgePassed: false,
    organizerTalked: false,
    registrationComplete: false,
    batsDefeated: false,
    skillChoiceMade: false,
  },
  player: {
    x: 72,
    y: 124,
    vx: 0,
    vy: 0,
    dirX: 1,
    dirY: 0,
    speed: 68,
    hp: 100,
    maxHp: 100,
    mana: 24,
    maxMana: 24,
    manaRegen: 4.5,
    level: 1,
    invuln: 0,
    dodgeTimer: 0,
    dodgeCooldown: 0,
    basicCooldown: 0,
    windCooldown: 0,
    leafCooldown: 0,
    bridgeSprint: 0,
  },
  skills: {
    windGust: true,
    leafFall: false,
    directBurst: false,
    poisonBloom: false,
  },
  grandma: { x: 118, y: 96, r: 11 },
  door: { x: 286, y: 82, w: 12, h: 24 },
  organizer: { x: 116, y: 96, r: 12 },
  registrar: { x: 240, y: 102, r: 12 },
  gatherGoal: 3,
  gathered: 0,
  lakeQuest: {
    fishOilGoal: 3,
    fishOilCollected: 0,
  },
  bridgeChallenge: {
    active: false,
    elapsed: 0,
    sprintCooldown: 0,
    failures: 0,
    planks: [],
  },
  resourceSpawner: {
    active: false,
    fireflyTimer: 1.8,
    reedTimer: 3.6,
    flaxTimer: 2.8,
    fireflyLimit: 0,
    reedLimit: 0,
    flaxLimit: 0,
    spawned: false,
  },
  ui: {
    menuOpen: false,
    gachaOpen: false,
    inventoryOpen: false,
  },
  savePoints: [],
  checkpointMeta: {
    id: null,
    chapter: null,
    savedAt: 0,
  },
  collectibles: [],
  obstacles: [],
  breakables: [],
  lakes: [],
  enemies: [],
  drops: [],
  inventory: {
    mint: 0,
    glassStone: 0,
    wetFrog: 0,
    firefly: 0,
    denseReed: 0,
    flaxSeed: 0,
    fishOil: 0,
    magicFang: 0,
    healingPotion: 0,
    healingRecipeScroll: 0,
  },
  recipeBook: {
    hasHealingRecipe: false,
    learnedHealingPotion: false,
    open: false,
  },
  wolf: null,
  healer: { x: 248, y: 98, r: 10 },
  registration: {
    active: false,
    index: 0,
    score: 0,
    questions: [
      {
        q: "Вопрос 1: Что важнее у источника?",
        a: "A: личная выгода",
        b: "B: общая защита",
        correct: "B",
      },
      {
        q: "Вопрос 2: При тревоге вы...",
        a: "A: предупреждаете всех",
        b: "B: уходите в укрытие",
        correct: "A",
      },
      {
        q: "Вопрос 3: Работа в отряде это...",
        a: "A: координация и дисциплина",
        b: "B: каждый сам за себя",
        correct: "A",
      },
    ],
  },
  skillChoice: {
    active: false,
    selected: null,
  },
  combatMods: {
    bonusDamage: 0,
    dotDamage: 0,
    damageReduction: 0,
    allyRegen: 0,
  },
  gacha: {
    coins: 2,
    costPerSpin: 2,
    spins: 0,
    lastPull: null,
    owned: {},
    banner: [
      {
        id: "herbalist_liora",
        name: "Травница Лиора",
        type: "character",
        rarity: "SSR",
        weight: 8,
        description: "Союзница: медленно восстанавливает здоровье в бою.",
      },
      {
        id: "arcane_book",
        name: "Магическая книжка",
        type: "relic",
        rarity: "SR",
        weight: 18,
        description: "Позволяет освоить больше боевых навыков.",
      },
      {
        id: "ward_amulet",
        name: "Оберег-амулет",
        type: "relic",
        rarity: "SR",
        weight: 22,
        description: "Снижает входящий урон.",
      },
      {
        id: "forest_scout",
        name: "Лесной следопыт",
        type: "character",
        rarity: "R",
        weight: 26,
        description: "Поддержка отряда. Дубликаты дают валюту.",
      },
      {
        id: "river_guard",
        name: "Страж брода",
        type: "character",
        rarity: "R",
        weight: 26,
        description: "Поддержка отряда. Дубликаты дают валюту.",
      },
    ],
  },
  projectiles: [],
  leafBursts: [],
  sparks: [],
  dialogue: null,
};

canvas.setAttribute("tabindex", "0");
ctx.imageSmoothingEnabled = false;

let manualStepping = false;
let lastFrameTime = performance.now();
let accumulator = 0;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value) {
  return Math.round(value * 10) / 10;
}

function formatStatValue(value) {
  const rounded = round(value);
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function randomInt(min, max) {
  return Math.floor(randomRange(min, max + 1));
}

function dist(aX, aY, bX, bY) {
  return Math.hypot(aX - bX, aY - bY);
}

function keyDown(codes) {
  return codes.some((code) => keysDown.has(code));
}

function consumeKey(codes) {
  for (const code of codes) {
    if (keysPressed.has(code)) {
      keysPressed.delete(code);
      return true;
    }
  }
  return false;
}

function setObjective(text) {
  state.objective = text;
}

function setHint(text, seconds = 2.2) {
  state.hint = text;
  state.hintTimer = seconds;
}

function setStoryLine(text, seconds = 2.8) {
  state.storyLine = text;
  state.storyLineTimer = seconds;
}

function awardGachaCoins(amount, reason) {
  if (amount <= 0) return;
  state.gacha.coins += amount;
  setHint(`Получено ${amount} валюты для круток: ${reason}.`, 2.6);
}

function deepCopy(data) {
  return JSON.parse(JSON.stringify(data));
}

function withStorage(callback) {
  try {
    return callback(window.localStorage);
  } catch {
    return null;
  }
}

function readStoredCheckpoint() {
  const raw = withStorage((storage) => storage.getItem(CHECKPOINT_STORAGE_KEY));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (typeof parsed.chapter !== "number") return null;
    if (!parsed.player || !parsed.inventory) return null;
    return parsed;
  } catch {
    return null;
  }
}

function updateContinueButtonVisibility() {
  if (!continueBtn) return;
  continueBtn.hidden = !readStoredCheckpoint();
  updateMenuFocus();
}

function markActiveSavePoint(savePointId) {
  state.savePoints = state.savePoints.map((point) => ({
    ...point,
    activated: point.id === savePointId,
  }));
}

function buildCheckpointSnapshot(savePointId) {
  return {
    version: 1,
    savedAt: Date.now(),
    savePointId,
    chapter: state.chapter,
    mode: state.mode,
    objective: state.objective,
    hint: state.hint,
    storyLine: state.storyLine,
    gatherGoal: state.gatherGoal,
    gathered: state.gathered,
    lakeQuest: deepCopy(state.lakeQuest),
    flags: deepCopy(state.flags),
    skills: deepCopy(state.skills),
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
    combatMods: deepCopy(state.combatMods),
    ui: deepCopy(state.ui),
    inventory: deepCopy(state.inventory),
    recipeBook: deepCopy(state.recipeBook),
    collectibles: deepCopy(state.collectibles),
    obstacles: deepCopy(state.obstacles),
    breakables: deepCopy(state.breakables),
    lakes: deepCopy(state.lakes),
    enemies: deepCopy(state.enemies),
    drops: deepCopy(state.drops),
    wolf: state.wolf ? deepCopy(state.wolf) : null,
    bridgeChallenge: deepCopy(state.bridgeChallenge),
    resourceSpawner: deepCopy(state.resourceSpawner),
    registration: deepCopy(state.registration),
    skillChoice: deepCopy(state.skillChoice),
    gacha: {
      coins: state.gacha.coins,
      spins: state.gacha.spins,
      lastPull: state.gacha.lastPull,
      owned: deepCopy(state.gacha.owned),
    },
  };
}

function applyCheckpointSnapshot(snapshot, options = {}) {
  const revive = options.revive === true;
  if (!snapshot || typeof snapshot.chapter !== "number") return false;

  menuNode.classList.add("hidden");
  state.mode = "play";
  gotoChapter(snapshot.chapter);

  state.mode = snapshot.mode || "play";
  state.gatherGoal = typeof snapshot.gatherGoal === "number" ? snapshot.gatherGoal : 3;
  state.gathered = typeof snapshot.gathered === "number" ? snapshot.gathered : 0;
  if (snapshot.lakeQuest) {
    state.lakeQuest.fishOilGoal = snapshot.lakeQuest.fishOilGoal ?? state.lakeQuest.fishOilGoal;
    state.lakeQuest.fishOilCollected =
      snapshot.lakeQuest.fishOilCollected ?? state.lakeQuest.fishOilCollected;
  }

  Object.assign(state.flags, snapshot.flags || {});
  Object.assign(state.skills, snapshot.skills || {});
  Object.assign(state.combatMods, snapshot.combatMods || {});
  Object.assign(state.ui, snapshot.ui || {});
  if (typeof state.ui.inventoryOpen !== "boolean") state.ui.inventoryOpen = false;
  Object.assign(state.inventory, snapshot.inventory || {});
  Object.assign(state.recipeBook, snapshot.recipeBook || {});

  if (snapshot.player) {
    state.player.x = snapshot.player.x ?? state.player.x;
    state.player.y = snapshot.player.y ?? state.player.y;
    state.player.dirX = snapshot.player.dirX ?? state.player.dirX;
    state.player.dirY = snapshot.player.dirY ?? state.player.dirY;
    state.player.speed = snapshot.player.speed ?? state.player.speed;
    state.player.maxHp = snapshot.player.maxHp ?? state.player.maxHp;
    state.player.maxMana = snapshot.player.maxMana ?? state.player.maxMana;
    state.player.level = snapshot.player.level ?? state.player.level;
    state.player.hp = snapshot.player.hp ?? state.player.hp;
    state.player.mana = snapshot.player.mana ?? state.player.mana;
    state.player.bridgeSprint = snapshot.player.bridgeSprint ?? state.player.bridgeSprint;
  }

  state.collectibles = Array.isArray(snapshot.collectibles) ? deepCopy(snapshot.collectibles) : [];
  state.obstacles = Array.isArray(snapshot.obstacles) ? deepCopy(snapshot.obstacles) : [];
  state.breakables = Array.isArray(snapshot.breakables) ? deepCopy(snapshot.breakables) : [];
  state.lakes = Array.isArray(snapshot.lakes) ? deepCopy(snapshot.lakes) : [];
  state.enemies = Array.isArray(snapshot.enemies) ? deepCopy(snapshot.enemies) : [];
  state.drops = Array.isArray(snapshot.drops) ? deepCopy(snapshot.drops) : [];
  state.wolf = snapshot.wolf ? deepCopy(snapshot.wolf) : null;
  if (snapshot.bridgeChallenge) {
    Object.assign(state.bridgeChallenge, snapshot.bridgeChallenge);
  }
  if (snapshot.resourceSpawner) {
    Object.assign(state.resourceSpawner, snapshot.resourceSpawner);
  }
  if (snapshot.registration) {
    state.registration.active = snapshot.registration.active ?? false;
    state.registration.index = snapshot.registration.index ?? 0;
    state.registration.score = snapshot.registration.score ?? 0;
  }
  if (snapshot.skillChoice) {
    state.skillChoice.active = snapshot.skillChoice.active ?? false;
    state.skillChoice.selected = snapshot.skillChoice.selected ?? null;
  }
  if (snapshot.gacha) {
    state.gacha.coins = snapshot.gacha.coins ?? state.gacha.coins;
    state.gacha.spins = snapshot.gacha.spins ?? state.gacha.spins;
    state.gacha.lastPull = snapshot.gacha.lastPull ?? state.gacha.lastPull;
    state.gacha.owned = snapshot.gacha.owned ? deepCopy(snapshot.gacha.owned) : state.gacha.owned;
  }

  state.player.vx = 0;
  state.player.vy = 0;
  state.player.invuln = revive ? 1.2 : 0.2;
  state.player.dodgeTimer = 0;
  state.player.dodgeCooldown = 0;
  state.player.basicCooldown = 0;
  state.player.windCooldown = 0;
  state.player.leafCooldown = 0;
  state.projectiles = [];
  state.leafBursts = [];
  state.sparks = [];
  state.dialogue = null;
  state.recipeBook.open = false;
  state.ui.menuOpen = false;
  state.ui.gachaOpen = false;
  state.ui.inventoryOpen = false;

  state.objective = snapshot.objective || state.objective;
  state.hint = snapshot.hint || "-";
  if (snapshot.storyLine) {
    setStoryLine(snapshot.storyLine, 2.2);
  }

  if (revive) {
    state.player.hp = Math.max(18, Math.round(state.player.maxHp * 0.55));
    state.player.mana = Math.max(8, Math.round(state.player.maxMana * 0.45));
    setHint("Эльфийка вернулась к последней точке сохранения.", 2.6);
    setStoryLine("Сила кристалла вернула её в безопасное место.", 2.8);
  }

  state.checkpointMeta.id = snapshot.savePointId || null;
  state.checkpointMeta.chapter = snapshot.chapter;
  state.checkpointMeta.savedAt = snapshot.savedAt || Date.now();
  if (state.checkpointMeta.id) {
    markActiveSavePoint(state.checkpointMeta.id);
  }

  canvas.focus();
  return true;
}

function saveCheckpoint(savePointId) {
  const snapshot = buildCheckpointSnapshot(savePointId);
  const success = withStorage((storage) => {
    storage.setItem(CHECKPOINT_STORAGE_KEY, JSON.stringify(snapshot));
    return true;
  });
  if (!success) {
    setHint("Не удалось сохранить прогресс в этой среде.", 2);
    return false;
  }

  state.checkpointMeta.id = savePointId;
  state.checkpointMeta.chapter = state.chapter;
  state.checkpointMeta.savedAt = snapshot.savedAt;
  markActiveSavePoint(savePointId);
  updateContinueButtonVisibility();
  setHint("Точка сохранения активирована.", 2.4);
  setStoryLine("Прогресс сохранён. Можно продолжить позже.", 2.6);
  return true;
}

function continueFromStoredCheckpoint() {
  const snapshot = readStoredCheckpoint();
  if (!snapshot) {
    setHint("Сохранение не найдено.", 2);
    updateContinueButtonVisibility();
    return false;
  }
  const loaded = applyCheckpointSnapshot(snapshot);
  if (!loaded) {
    setHint("Сохранение повреждено. Начните новую игру.", 2.5);
    return false;
  }
  setHint("Прогресс восстановлен.", 2.2);
  setStoryLine("Эльфийка продолжает путь с точки сохранения.", 2.4);
  if (controlsPanel) controlsPanel.hidden = true;
  return true;
}

function tryRespawnFromCheckpoint() {
  const snapshot = readStoredCheckpoint();
  if (!snapshot) return false;
  return applyCheckpointSnapshot(snapshot, { revive: true });
}

function findNearbySavePoint(maxDistance = 18) {
  let nearest = null;
  let nearestDistance = Infinity;
  for (const point of state.savePoints) {
    const allowedDistance = Math.max(maxDistance, (point.radius || 0) + 8);
    const distance = dist(state.player.x, state.player.y, point.x, point.y);
    if (distance > allowedDistance || distance >= nearestDistance) continue;
    nearest = point;
    nearestDistance = distance;
  }
  return nearest;
}

function tryActivateSavePoint() {
  const point = findNearbySavePoint();
  if (!point) return false;

  if (point.activated) {
    setHint("Эта точка уже активна.", 1.6);
    return true;
  }

  saveCheckpoint(point.id);
  return true;
}

function hasOwnedBannerItem(itemId) {
  return (state.gacha.owned[itemId] || 0) > 0;
}

function pickBannerReward() {
  const totalWeight = state.gacha.banner.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = randomRange(0, totalWeight);
  for (const entry of state.gacha.banner) {
    roll -= entry.weight;
    if (roll <= 0) return entry;
  }
  return state.gacha.banner[state.gacha.banner.length - 1];
}

function applyBannerReward(entry) {
  const ownedBefore = state.gacha.owned[entry.id] || 0;
  state.gacha.owned[entry.id] = ownedBefore + 1;

  if (ownedBefore > 0) {
    state.gacha.coins += 1;
    setHint(`Дубликат: ${entry.name}. Компенсация +1 валюта.`, 2.4);
  } else {
    setHint(`Получено из баннера: ${entry.name} (${entry.rarity}).`, 2.6);
  }

  if (entry.id === "ward_amulet") {
    state.combatMods.damageReduction = 0.25;
  }

  if (entry.id === "herbalist_liora") {
    state.combatMods.allyRegen = 1.2;
  }

  if (entry.id === "arcane_book") {
    if (!state.skills.directBurst) {
      state.skills.directBurst = true;
      state.combatMods.bonusDamage = Math.max(state.combatMods.bonusDamage, 7);
    }
    if (!state.skills.poisonBloom) {
      state.skills.poisonBloom = true;
      state.combatMods.dotDamage = Math.max(state.combatMods.dotDamage, 2.3);
    }
  }
}

function runGachaSpins(spins) {
  let completed = 0;
  for (let i = 0; i < spins; i += 1) {
    if (state.gacha.coins < state.gacha.costPerSpin) break;
    state.gacha.coins -= state.gacha.costPerSpin;
    const reward = pickBannerReward();
    state.gacha.lastPull = reward.id;
    state.gacha.spins += 1;
    applyBannerReward(reward);
    completed += 1;
  }

  if (completed === 0) {
    setHint("Недостаточно валюты для крутки.", 2);
    return false;
  }

  return true;
}

function startDialogue(lines, onEnd) {
  if (!lines.length) return;
  state.dialogue = {
    lines,
    index: 0,
    onEnd,
  };
  setStoryLine(lines[0], 60);
}

function nextDialogueLine() {
  if (!state.dialogue) return;
  state.dialogue.index += 1;
  if (state.dialogue.index >= state.dialogue.lines.length) {
    const callback = state.dialogue.onEnd;
    state.dialogue = null;
    if (typeof callback === "function") {
      callback();
    }
    return;
  }
  setStoryLine(state.dialogue.lines[state.dialogue.index], 60);
}

function trailCollectibles() {
  return [
    { x: 62, y: 95, type: "mint", name: "Мятное растение", collected: false },
    { x: 94, y: 77, type: "glass", name: "Стеклянный камень", collected: false },
    { x: 128, y: 112, type: "frog", name: "Влажная лягушка", collected: false },
    { x: 156, y: 86, type: "mint", name: "Мятное растение", collected: false },
    { x: 186, y: 106, type: "glass", name: "Стеклянный камень", collected: false },
    { x: 214, y: 80, type: "mint", name: "Мятное растение", collected: false },
    { x: 242, y: 108, type: "frog", name: "Влажная лягушка", collected: false },
    { x: 286, y: 88, type: "glass", name: "Стеклянный камень", collected: false },
  ];
}

function deepForestCollectibles() {
  return [
    { x: 78, y: 86, type: "mint", name: "Мятное растение", collected: false },
    { x: 118, y: 104, type: "glass", name: "Стеклянный камень", collected: false },
    { x: 152, y: 88, type: "frog", name: "Влажная лягушка", collected: false },
    { x: 188, y: 114, type: "mint", name: "Мятное растение", collected: false },
    { x: 240, y: 118, type: "frog", name: "Влажная лягушка", collected: false },
  ];
}

function chapterFiveResources() {
  return [
    { x: 54, y: 78, type: "firefly", name: "Светлячок", collected: false },
    { x: 96, y: 122, type: "dense_reed", name: "Плотный камыш", collected: false },
    { x: 152, y: 74, type: "flax_seed", name: "Семена льна", collected: false },
    { x: 188, y: 124, type: "dense_reed", name: "Плотный камыш", collected: false },
    { x: 238, y: 84, type: "firefly", name: "Светлячок", collected: false },
    { x: 268, y: 122, type: "flax_seed", name: "Семена льна", collected: false },
  ];
}

function chapterSevenResources() {
  return [
    { x: 66, y: 126, type: "firefly", name: "Светлячок", collected: false },
    { x: 126, y: 118, type: "dense_reed", name: "Плотный камыш", collected: false },
    { x: 178, y: 128, type: "flax_seed", name: "Семена льна", collected: false },
    { x: 248, y: 122, type: "firefly", name: "Светлячок", collected: false },
  ];
}

function lakeObstacleLayout() {
  return [
    { id: "lake_rock_1", x: 70, y: 60, w: 18, h: 14, colorDark: "#38404a", colorLight: "#596474" },
    { id: "lake_rock_2", x: 140, y: 122, w: 20, h: 14, colorDark: "#38404a", colorLight: "#596474" },
    { id: "lake_root", x: 214, y: 66, w: 24, h: 16, colorDark: "#4d3422", colorLight: "#714c2f" },
    { id: "lake_rock_3", x: 258, y: 122, w: 22, h: 14, colorDark: "#38404a", colorLight: "#596474" },
  ];
}

function mushroomObstacleLayout() {
  return [
    { id: "mush_crate_1", x: 154, y: 60, w: 18, h: 16, colorDark: "#4a3123", colorLight: "#714932" },
    { id: "mush_crate_2", x: 164, y: 106, w: 20, h: 16, colorDark: "#4a3123", colorLight: "#714932" },
    { id: "mush_bush_1", x: 82, y: 108, w: 20, h: 14, colorDark: "#364a30", colorLight: "#4f6947" },
    { id: "mush_bush_2", x: 264, y: 74, w: 20, h: 14, colorDark: "#364a30", colorLight: "#4f6947" },
  ];
}

function buildBridgePlanks() {
  const planks = [];
  let x = 42;
  let index = 0;
  while (x < 292) {
    planks.push({
      id: `bridge_plank_${index}`,
      x,
      y: 84,
      w: 16,
      h: 22,
      fallAt: 1 + index * 0.45 + randomRange(-0.08, 0.12),
    });
    x += 18;
    index += 1;
  }
  return planks;
}

function lakeSpawnPoints() {
  return [
    { x: 96, y: 98, r: 24, timer: 2.6, minInterval: 4.8, maxInterval: 6.4 },
    { x: 216, y: 94, r: 22, timer: 3.4, minInterval: 5.4, maxInterval: 7.2 },
  ];
}

function setupAmbientSpawner(active) {
  state.resourceSpawner.active = active;
  state.resourceSpawner.fireflyTimer = randomRange(1.2, 2.6);
  state.resourceSpawner.reedTimer = randomRange(2.8, 4.4);
  state.resourceSpawner.flaxTimer = randomRange(2.2, 3.8);
  state.resourceSpawner.fireflyLimit = randomInt(2, 5);
  state.resourceSpawner.reedLimit = randomInt(1, 4);
  state.resourceSpawner.flaxLimit = randomInt(3, 6);
  state.resourceSpawner.spawned = false;
}

function canSpawnAt(x, y) {
  for (const obstacle of state.obstacles) {
    if (x > obstacle.x - 6 && x < obstacle.x + obstacle.w + 6 && y > obstacle.y - 6 && y < obstacle.y + obstacle.h + 6) {
      return false;
    }
  }

  for (const lake of state.lakes) {
    if (dist(x, y, lake.x, lake.y) < lake.r + 5) {
      return false;
    }
  }

  return true;
}

function spawnResourceByType(type) {
  const spawnNames = {
    firefly: "Светлячок",
    dense_reed: "Плотный камыш",
    flax_seed: "Семена льна",
  };

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const x = randomInt(state.worldBounds.x + 12, state.worldBounds.x + state.worldBounds.w - 12);
    const y = randomInt(state.worldBounds.y + 12, state.worldBounds.y + state.worldBounds.h - 12);
    if (!canSpawnAt(x, y)) continue;
    state.collectibles.push({
      x,
      y,
      type,
      name: spawnNames[type] || "Ресурс",
      collected: false,
    });
    break;
  }
}

function countUncollected(type) {
  return state.collectibles.reduce((sum, item) => sum + (item.type === type && !item.collected ? 1 : 0), 0);
}

function updateDynamicResourceSpawns(dt) {
  if (!state.resourceSpawner.active) return;
  if (!(state.chapter === 5 || state.chapter === 7 || state.chapter === 8)) return;
  if (state.resourceSpawner.spawned) return;

  state.resourceSpawner.fireflyTimer -= dt;
  state.resourceSpawner.reedTimer -= dt;
  state.resourceSpawner.flaxTimer -= dt;

  let done = true;
  if (state.resourceSpawner.fireflyTimer <= 0) {
    if (countUncollected("firefly") < state.resourceSpawner.fireflyLimit) {
      spawnResourceByType("firefly");
      state.resourceSpawner.fireflyTimer = randomRange(0.14, 0.34);
      done = false;
    }
  } else if (countUncollected("firefly") < state.resourceSpawner.fireflyLimit) {
    done = false;
  }

  if (state.resourceSpawner.reedTimer <= 0) {
    if (countUncollected("dense_reed") < state.resourceSpawner.reedLimit) {
      spawnResourceByType("dense_reed");
      state.resourceSpawner.reedTimer = randomRange(0.2, 0.4);
      done = false;
    }
  } else if (countUncollected("dense_reed") < state.resourceSpawner.reedLimit) {
    done = false;
  }

  if (state.resourceSpawner.flaxTimer <= 0) {
    if (countUncollected("flax_seed") < state.resourceSpawner.flaxLimit) {
      spawnResourceByType("flax_seed");
      state.resourceSpawner.flaxTimer = randomRange(0.18, 0.36);
      done = false;
    }
  } else if (countUncollected("flax_seed") < state.resourceSpawner.flaxLimit) {
    done = false;
  }

  if (done) {
    state.resourceSpawner.spawned = true;
  }
}

function wolfPassBreakables() {
  return [
    {
      id: "wolf_barrier",
      chapter: 3,
      name: "Сухой завал",
      x: 284,
      y: 72,
      w: 22,
      h: 42,
      hp: 1,
      broken: false,
      colorDark: "#4e2f1d",
      colorLight: "#6f442a",
    },
  ];
}

function deepForestBreakables() {
  return [
    {
      id: "healer_tree",
      chapter: 4,
      name: "Упавшее дерево",
      x: 220,
      y: 78,
      w: 68,
      h: 26,
      hp: 1,
      broken: false,
      colorDark: "#4e2f1d",
      colorLight: "#6f442a",
    },
    {
      id: "thorn_1",
      chapter: 4,
      name: "Колючая глыба",
      x: 136,
      y: 58,
      w: 20,
      h: 16,
      hp: 1,
      broken: false,
      colorDark: "#384523",
      colorLight: "#526632",
    },
    {
      id: "thorn_2",
      chapter: 4,
      name: "Колючая завеса",
      x: 174,
      y: 116,
      w: 24,
      h: 16,
      hp: 1,
      broken: false,
      colorDark: "#384523",
      colorLight: "#526632",
    },
  ];
}

function chapterSavePoints(chapter) {
  if (chapter === 1) {
    return [{ id: "village_well", chapter: 1, x: 170, y: 96, radius: 14, activated: false }];
  }
  if (chapter === 2) {
    return [{ id: "trail_crystal", chapter: 2, x: 148, y: 96, radius: 14, activated: false }];
  }
  if (chapter === 3) {
    return [{ id: "wolf_watch", chapter: 3, x: 62, y: 96, radius: 14, activated: false }];
  }
  if (chapter === 4) {
    return [{ id: "deep_circle", chapter: 4, x: 108, y: 104, radius: 14, activated: false }];
  }
  if (chapter === 5) {
    return [{ id: "lake_stone", chapter: 5, x: 38, y: 94, radius: 14, activated: false }];
  }
  if (chapter === 6) {
    return [{ id: "bridge_gate", chapter: 6, x: 30, y: 94, radius: 14, activated: false }];
  }
  if (chapter === 7) {
    return [{ id: "mush_ring", chapter: 7, x: 78, y: 102, radius: 14, activated: false }];
  }
  if (chapter === 8) {
    return [{ id: "source_plaza", chapter: 8, x: 86, y: 102, radius: 14, activated: false }];
  }
  return [];
}

function resetAdventureState() {
  state.time = 0;
  state.mode = "play";
  state.hint = "-";
  state.hintTimer = 0;
  state.storyLine = "";
  state.storyLineTimer = 0;
  state.flash = 0;

  state.flags.grandmaTalked = false;
  state.flags.wolfDefeated = false;
  state.flags.leafFallUnlocked = false;
  state.flags.healerFound = false;
  state.flags.rescuedHealer = false;
  state.flags.lakeQuestDone = false;
  state.flags.bridgePassed = false;
  state.flags.organizerTalked = false;
  state.flags.registrationComplete = false;
  state.flags.batsDefeated = false;
  state.flags.skillChoiceMade = false;

  state.skills.windGust = true;
  state.skills.leafFall = false;
  state.skills.directBurst = false;
  state.skills.poisonBloom = false;

  state.gathered = 0;
  state.lakeQuest.fishOilCollected = 0;
  state.lakeQuest.fishOilGoal = 3;
  state.bridgeChallenge.active = false;
  state.bridgeChallenge.elapsed = 0;
  state.bridgeChallenge.sprintCooldown = 0;
  state.bridgeChallenge.failures = 0;
  state.bridgeChallenge.planks = [];
  setupAmbientSpawner(false);
  state.ui.menuOpen = false;
  state.ui.gachaOpen = false;
  state.ui.inventoryOpen = false;
  state.savePoints = [];
  state.checkpointMeta.id = null;
  state.checkpointMeta.chapter = null;
  state.checkpointMeta.savedAt = 0;

  state.inventory.mint = 0;
  state.inventory.glassStone = 0;
  state.inventory.wetFrog = 0;
  state.inventory.firefly = 0;
  state.inventory.denseReed = 0;
  state.inventory.flaxSeed = 0;
  state.inventory.fishOil = 0;
  state.inventory.magicFang = 0;
  state.inventory.healingPotion = 0;
  state.inventory.healingRecipeScroll = 0;

  state.recipeBook.hasHealingRecipe = false;
  state.recipeBook.learnedHealingPotion = false;
  state.recipeBook.open = false;
  state.registration.active = false;
  state.registration.index = 0;
  state.registration.score = 0;
  state.skillChoice.active = false;
  state.skillChoice.selected = null;
  state.combatMods.bonusDamage = 0;
  state.combatMods.dotDamage = 0;
  state.combatMods.damageReduction = 0;
  state.combatMods.allyRegen = 0;
  state.gacha.coins = 2;
  state.gacha.spins = 0;
  state.gacha.lastPull = null;
  state.gacha.owned = {};

  state.player.maxHp = 100;
  state.player.hp = state.player.maxHp;
  state.player.mana = state.player.maxMana;
  state.player.maxMana = 24;
  state.player.level = 1;
  state.player.speed = 68;
  state.player.vx = 0;
  state.player.vy = 0;
  state.player.dirX = 1;
  state.player.dirY = 0;
  state.player.invuln = 0;
  state.player.dodgeTimer = 0;
  state.player.dodgeCooldown = 0;
  state.player.basicCooldown = 0;
  state.player.windCooldown = 0;
  state.player.leafCooldown = 0;
  state.player.bridgeSprint = 0;

  state.collectibles = [];
  state.obstacles = [];
  state.breakables = [];
  state.lakes = [];
  state.enemies = [];
  state.drops = [];
  state.projectiles = [];
  state.leafBursts = [];
  state.sparks = [];
  state.dialogue = null;

  gotoChapter(0);
}

function gotoChapter(chapter) {
  state.chapter = chapter;
  state.projectiles.length = 0;
  state.leafBursts.length = 0;
  state.sparks.length = 0;
  state.dialogue = null;
  state.registration.active = false;
  state.registration.index = 0;
  state.registration.score = 0;
  state.skillChoice.active = false;
  state.ui.menuOpen = false;
  state.ui.gachaOpen = false;
  state.ui.inventoryOpen = false;
  state.recipeBook.open = false;
  state.savePoints = chapterSavePoints(chapter);
  if (state.checkpointMeta.id && state.checkpointMeta.chapter === chapter) {
    markActiveSavePoint(state.checkpointMeta.id);
  }

  if (chapter === 0) {
    state.worldBounds = { x: 24, y: 34, w: 272, h: 134 };
    state.player.x = 64;
    state.player.y = 124;
    state.collectibles = [];
    state.obstacles = [];
    state.breakables = [];
    state.lakes = [];
    state.enemies = [];
    state.drops = [];
    state.wolf = null;
    setObjective("Поговорите с бабушкой Нурсой (E). ");
    setHint("Подойдите к Нурсе у очага.", 3);
    setStoryLine("Листи весь день чувствует нестабильность энергии источника и не может найти себе места.");
    return;
  }

  if (chapter === 1) {
    state.worldBounds = { x: 8, y: 18, w: 304, h: 154 };
    state.player.x = 24;
    state.player.y = 98;
    state.collectibles = [];
    state.obstacles = [
      { id: "village_cart", x: 118, y: 62, w: 16, h: 12, colorDark: "#5c3f29", colorLight: "#7a5335" },
      { id: "village_barrel", x: 206, y: 108, w: 12, h: 12, colorDark: "#5c3f29", colorLight: "#7a5335" },
    ];
    state.breakables = [];
    state.lakes = [];
    state.enemies = [];
    state.drops = [];
    state.wolf = null;
    setupAmbientSpawner(false);
    setObjective("Пройдите через маленькую деревню и выйдите на тропу.");
    setHint("Двигайтесь вправо по дороге.", 2.6);
    setStoryLine("Листи выбежала из дома и прошла через сонную деревню, прислушиваясь к дрожи в воздухе.");
    return;
  }

  if (chapter === 2) {
    state.worldBounds = { x: 8, y: 16, w: 304, h: 158 };
    state.player.x = 24;
    state.player.y = 96;
    state.collectibles = trailCollectibles();
    state.obstacles = [
      { id: "trail_stone_1", x: 106, y: 56, w: 14, h: 10, colorDark: "#434d58", colorLight: "#687382" },
      { id: "trail_stone_2", x: 198, y: 120, w: 14, h: 10, colorDark: "#434d58", colorLight: "#687382" },
    ];
    state.breakables = [];
    state.lakes = [];
    state.enemies = [];
    state.drops = [];
    state.wolf = null;
    setupAmbientSpawner(false);
    setObjective(`Соберите ресурсы на тропе (${state.gathered}/${state.gatherGoal}).`);
    setHint("Ищите мяту, стеклянные камни и влажных лягушек.", 3);
    setStoryLine("На тропе блестят стеклянные камни и шуршит мята.");
    return;
  }

  if (chapter === 3) {
    state.worldBounds = { x: 8, y: 16, w: 304, h: 158 };
    state.player.x = 34;
    state.player.y = 96;
    state.obstacles = [];
    state.lakes = [];
    state.enemies = [];
    state.drops = [];
    state.wolf = {
      x: 246,
      y: 96,
      hp: 84,
      maxHp: 84,
      speed: 24,
      attackCooldown: 0,
      hitFlash: 0,
      alive: true,
    };
    state.collectibles = [];
    state.breakables = wolfPassBreakables();
    setupAmbientSpawner(false);
    setObjective("Победите волка: J/B - удар, K/A - «Порыв ветра», Space - уворот.");
    setHint("Магия тратит ману. Следите за флаконом справа.", 3.2);
    setStoryLine("Старый волк с большими лапами преградил путь и рычанием заглушил ветер в кронах.");
    return;
  }

  if (chapter === 4) {
    state.worldBounds = { x: 8, y: 16, w: 304, h: 158 };
    state.player.x = 24;
    state.player.y = 104;
    state.wolf = null;
    state.lakes = [];
    state.enemies = [];
    state.drops = [];
    state.collectibles = deepForestCollectibles();
    state.obstacles = [
      { id: "deep_stump", x: 94, y: 72, w: 20, h: 14, colorDark: "#4e3525", colorLight: "#6d4a31" },
      { id: "deep_rock", x: 168, y: 132, w: 18, h: 12, colorDark: "#38404a", colorLight: "#596474" },
    ];
    state.breakables = deepForestBreakables();
    setupAmbientSpawner(false);
    setObjective("Осмотрите заваленное дерево рядом с одеждой (E). ");
    setHint("Найдите травницу в правой части леса.", 3);
    setStoryLine("В чаще лежит разорванная одежда, а под деревом слышен слабый голос, зовущий о помощи.");
    return;
  }

  if (chapter === 5) {
    state.worldBounds = { x: 8, y: 16, w: 304, h: 158 };
    state.player.x = 24;
    state.player.y = 94;
    state.wolf = null;
    state.lakes = lakeSpawnPoints();
    state.enemies = [];
    state.drops = [];
    state.collectibles = chapterFiveResources();
    state.obstacles = lakeObstacleLayout();
    state.breakables = [];
    state.lakeQuest.fishOilCollected = 0;
    setupAmbientSpawner(true);
    setObjective("У озёр победите монстров и соберите рыбий жир (0/3).");
    setHint("Новые ресурсы появляются с разной частотой: светлячки, камыш, семена льна.", 3.4);
    setStoryLine("Из озёр поднимаются твари, и каждая волна приносит новую угрозу. Рыбий жир пригодится для укрепления маны.");
    return;
  }

  if (chapter === 6) {
    state.worldBounds = { x: 8, y: 34, w: 304, h: 108 };
    state.player.x = 22;
    state.player.y = 94;
    state.wolf = null;
    state.lakes = [];
    state.enemies = [];
    state.drops = [];
    state.collectibles = [];
    state.obstacles = [];
    state.breakables = [];
    state.bridgeChallenge.active = true;
    state.bridgeChallenge.elapsed = 0;
    state.bridgeChallenge.sprintCooldown = 0;
    state.bridgeChallenge.planks = buildBridgePlanks();
    setupAmbientSpawner(false);
    setObjective("Перейдите старый мост. Если упали — попытка начнётся заново.");
    setHint("Space даёт рывок. После провала мост перестраивается и даёт ещё шанс.", 3.2);
    setStoryLine("Старый мост трещит под шагами, но Листи замечает, что можно пробовать снова, пока не найдёшь ритм.");
    return;
  }

  if (chapter === 7) {
    state.worldBounds = { x: 8, y: 16, w: 304, h: 158 };
    state.player.x = 22;
    state.player.y = 104;
    state.wolf = null;
    state.lakes = [];
    state.enemies = [];
    state.drops = [];
    state.collectibles = chapterSevenResources();
    state.obstacles = mushroomObstacleLayout();
    state.breakables = [];
    state.flags.organizerTalked = false;
    state.flags.registrationComplete = false;
    setupAmbientSpawner(true);
    setObjective("Поговорите с организатором Кэри (E).");
    setHint("Это грибная аллея: светящиеся грибы у магического источника.", 3.3);
    setStoryLine("У источника собирают отряд для расследования кражи силы: впереди сложный разговор и непростой выбор.");
    return;
  }

  if (chapter === 8) {
    state.worldBounds = { x: 8, y: 16, w: 304, h: 158 };
    state.player.x = 74;
    state.player.y = 104;
    state.wolf = null;
    state.lakes = [];
    state.collectibles = chapterSevenResources();
    state.obstacles = mushroomObstacleLayout();
    state.breakables = [];
    state.drops = [];
    state.enemies = spawnBatSwarm();
    setupAmbientSpawner(true);
    setObjective("Отразите налёт летучих мышей.");
    setHint("После победы выберите новый навык (A или B).", 3.2);
    setStoryLine("Пока Листи записывали в отряд, стая летучих мышей вырвалась из тени и пошла в атаку.");
    return;
  }

  if (chapter === 9) {
    state.worldBounds = { x: 8, y: 16, w: 304, h: 158 };
    state.player.x = 150;
    state.player.y = 104;
    state.wolf = null;
    state.lakes = [];
    state.enemies = [];
    state.drops = [];
    state.collectibles = chapterSevenResources();
    state.obstacles = mushroomObstacleLayout();
    state.breakables = [];
    setupAmbientSpawner(true);
    setObjective("Откройте меню (M) и используйте гачу-баннер (G, A, B).");
    setHint("Валюту дают уровни и задания. Крутка: стоимость 2.", 3.2);
    setStoryLine("Листи вступила в защиту источника и готовится к большому расследованию вместе с новым отрядом.");
  }
}

function visibleMenuEntries() {
  return menuEntries.filter((entry) => !entry.hidden || !entry.hidden());
}

function setMenuPanel(title, text) {
  if (menuPanelTitle) menuPanelTitle.textContent = title;
  if (menuPanelText) menuPanelText.textContent = text;
}

function updateMenuFocus() {
  const visible = visibleMenuEntries();
  if (!visible.length) return;

  if (menuState.selectedIndex >= visible.length) {
    menuState.selectedIndex = 0;
  }

  for (const entry of menuEntries) {
    if (!entry.button) continue;
    entry.button.classList.remove("is-focused");
    entry.button.tabIndex = -1;
  }

  const selected = visible[menuState.selectedIndex];
  if (!selected || !selected.button) return;
  selected.button.classList.add("is-focused");
  selected.button.tabIndex = 0;
  setMenuPanel(selected.title, selected.text);
}

function moveMenuSelection(direction) {
  const visible = visibleMenuEntries();
  if (!visible.length) return;
  menuState.selectedIndex = (menuState.selectedIndex + direction + visible.length) % visible.length;
  updateMenuFocus();
}

function runSelectedMenuAction() {
  const visible = visibleMenuEntries();
  const selected = visible[menuState.selectedIndex];
  if (selected && typeof selected.action === "function") {
    selected.action();
  }
}

function showControlsPanel() {
  if (controlsPanel) controlsPanel.hidden = false;
  setMenuPanel(
    "Как играть",
    "Совет: начните с разговора с бабушкой (E), следите за маной и чаще активируйте кристаллы сохранения.",
  );
}

function showLorePanel() {
  if (controlsPanel) controlsPanel.hidden = true;
  setMenuPanel(
    "О мире игры",
    "Лесной источник питает окрестности. Вам предстоит отразить атаки, помочь жителям и вступить в отряд защитников.",
  );
}

function setupMenuInteractions() {
  for (const entry of menuEntries) {
    if (!entry.button) continue;
    entry.button.addEventListener("mouseenter", () => {
      const visible = visibleMenuEntries();
      const visibleIndex = visible.findIndex((item) => item.id === entry.id);
      if (visibleIndex >= 0) {
        menuState.selectedIndex = visibleIndex;
        updateMenuFocus();
      }
    });
    entry.button.addEventListener("focus", () => {
      const visible = visibleMenuEntries();
      const visibleIndex = visible.findIndex((item) => item.id === entry.id);
      if (visibleIndex >= 0) {
        menuState.selectedIndex = visibleIndex;
        updateMenuFocus();
      }
    });
    entry.button.addEventListener("click", entry.action);
  }

  showLorePanel();
  updateContinueButtonVisibility();
  updateMenuFocus();
}

function startGame() {
  menuNode.classList.add("hidden");
  if (controlsPanel) controlsPanel.hidden = true;
  resetAdventureState();
  canvas.focus();
}

function inventoryText() {
  if (!state.ui.inventoryOpen) {
    return "Скрыт (I — открыть багаж)";
  }
  const recipe = state.recipeBook.learnedHealingPotion ? "изучен" : state.recipeBook.hasHealingRecipe ? "получен" : "нет";
  return `мята:${state.inventory.mint} стекло:${state.inventory.glassStone} лягушки:${state.inventory.wetFrog} светлячки:${state.inventory.firefly} камыш:${state.inventory.denseReed} лён:${state.inventory.flaxSeed} рыбий жир:${state.inventory.fishOil} зелья:${state.inventory.healingPotion} рецепт:${recipe}`;
}

function refreshHud() {
  chapterNode.textContent = chapterNames[state.chapter] || "Эпилог";
  levelNode.textContent = String(state.player.level);
  hpNode.textContent = `${formatStatValue(state.player.hp)}/${formatStatValue(state.player.maxHp)}`;
  manaNode.textContent = `${formatStatValue(state.player.mana)}/${formatStatValue(state.player.maxMana)}`;
  inventoryNode.textContent = inventoryText();
  if (coinsNode) {
    coinsNode.textContent = `${state.gacha.coins}`;
  }
  objectiveNode.textContent = state.objective;
  hintNode.textContent = state.hint;
}

function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
    return;
  }
  canvas.requestFullscreen().catch(() => {});
}

function resizeCanvasDisplay() {
  const ratio = WIDTH / HEIGHT;
  const widthLimit = window.innerWidth * (document.fullscreenElement ? 0.98 : 0.92);
  const heightLimit = window.innerHeight * (document.fullscreenElement ? 0.95 : 0.72);
  let displayWidth = widthLimit;
  let displayHeight = displayWidth / ratio;
  if (displayHeight > heightLimit) {
    displayHeight = heightLimit;
    displayWidth = displayHeight * ratio;
  }
  canvas.style.width = `${Math.floor(displayWidth)}px`;
  canvas.style.height = `${Math.floor(displayHeight)}px`;
}

function checkGlobalKeys() {
  if (consumeKey(["KeyF"])) {
    toggleFullscreen();
  }
  if (consumeKey(["KeyM"]) && state.mode !== "menu" && !state.dialogue && !state.registration.active && !state.skillChoice.active) {
    state.ui.menuOpen = !state.ui.menuOpen;
    if (!state.ui.menuOpen) {
      state.ui.gachaOpen = false;
      state.ui.inventoryOpen = false;
    } else {
      setHint("Меню открыто: G — баннер, A/B — крутки, I — вкладка багажа.", 2.8);
    }
  }
  if (consumeKey(["KeyI"]) && state.mode !== "menu") {
    state.ui.inventoryOpen = !state.ui.inventoryOpen;
  }
  if (consumeKey(["Escape"])) {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else if (state.ui.gachaOpen) {
      state.ui.gachaOpen = false;
    } else if (state.ui.menuOpen) {
      state.ui.menuOpen = false;
    }
  }
  if (state.ui.menuOpen && consumeKey(["KeyG"])) {
    state.ui.gachaOpen = !state.ui.gachaOpen;
  }

  if (
    state.chapter === 9 &&
    !state.dialogue &&
    !state.registration.active &&
    !state.skillChoice.active &&
    consumeKey(["Enter"])
  ) {
    if (!state.ui.menuOpen) {
      state.ui.menuOpen = true;
      return;
    }
    if (state.ui.menuOpen && !state.ui.gachaOpen) {
      state.ui.gachaOpen = true;
    }
  }
}

function updateTimers(dt) {
  const player = state.player;
  player.invuln = Math.max(0, player.invuln - dt);
  player.dodgeCooldown = Math.max(0, player.dodgeCooldown - dt);
  player.basicCooldown = Math.max(0, player.basicCooldown - dt);
  player.windCooldown = Math.max(0, player.windCooldown - dt);
  player.leafCooldown = Math.max(0, player.leafCooldown - dt);
  player.bridgeSprint = Math.max(0, player.bridgeSprint - dt);

  player.mana = clamp(player.mana + player.manaRegen * dt, 0, player.maxMana);
  if (state.combatMods.allyRegen > 0 && state.mode !== "menu" && !state.ui.menuOpen) {
    player.hp = Math.min(player.maxHp, player.hp + state.combatMods.allyRegen * dt);
  }

  if (player.dodgeTimer > 0) {
    player.dodgeTimer = Math.max(0, player.dodgeTimer - dt);
  }

  if (state.wolf) {
    state.wolf.attackCooldown = Math.max(0, state.wolf.attackCooldown - dt);
    state.wolf.hitFlash = Math.max(0, state.wolf.hitFlash - dt);
  }

  for (const enemy of state.enemies) {
    enemy.attackCooldown = Math.max(0, (enemy.attackCooldown || 0) - dt);
    enemy.hitFlash = Math.max(0, (enemy.hitFlash || 0) - dt);
    enemy.dotTimer = Math.max(0, (enemy.dotTimer || 0) - dt);
    enemy.dotTick = Math.max(0, (enemy.dotTick || 0) - dt);
  }

  if (state.bridgeChallenge.active) {
    state.bridgeChallenge.sprintCooldown = Math.max(0, state.bridgeChallenge.sprintCooldown - dt);
  }

  if (state.hintTimer > 0) {
    state.hintTimer = Math.max(0, state.hintTimer - dt);
    if (state.hintTimer === 0 && !state.dialogue) {
      state.hint = "-";
    }
  }

  if (!state.dialogue && state.storyLineTimer > 0) {
    state.storyLineTimer = Math.max(0, state.storyLineTimer - dt);
    if (state.storyLineTimer === 0) {
      state.storyLine = "";
    }
  }

  state.flash = Math.max(0, state.flash - dt);
}

function activeBlockingRects() {
  const solids = state.obstacles.map((obstacle) => ({
    x: obstacle.x,
    y: obstacle.y,
    w: obstacle.w,
    h: obstacle.h,
  }));

  for (const obstacle of state.breakables) {
    if (obstacle.chapter !== state.chapter || obstacle.broken) continue;
    solids.push({
      x: obstacle.x,
      y: obstacle.y,
      w: obstacle.w,
      h: obstacle.h,
    });
  }

  if (state.chapter === 6 && state.bridgeChallenge.active) {
    const elapsed = state.bridgeChallenge.elapsed;
    for (const plank of state.bridgeChallenge.planks) {
      if (elapsed > plank.fallAt) {
        solids.push({
          x: plank.x,
          y: plank.y,
          w: plank.w,
          h: plank.h,
          hole: true,
        });
      }
    }
  }

  return solids;
}

function collidesWithRect(x, y, rect) {
  const radius = 3.6;
  return x + radius > rect.x && x - radius < rect.x + rect.w && y + radius > rect.y && y - radius < rect.y + rect.h;
}

function applyPlayerMovement(dt) {
  const player = state.player;
  const baseSpeed = player.speed * (player.bridgeSprint > 0 ? 1.75 : 1);

  if (player.dodgeTimer > 0) {
    player.x += player.vx * dt;
    player.y += player.vy * dt;
  } else {
    let xAxis = 0;
    let yAxis = 0;

    if (keyDown(["ArrowLeft", "KeyA"])) xAxis -= 1;
    if (keyDown(["ArrowRight", "KeyD"])) xAxis += 1;
    if (keyDown(["ArrowUp", "KeyW"])) yAxis -= 1;
    if (keyDown(["ArrowDown", "KeyS"])) yAxis += 1;

    if (xAxis !== 0 || yAxis !== 0) {
      const length = Math.hypot(xAxis, yAxis);
      xAxis /= length;
      yAxis /= length;
      player.dirX = xAxis;
      player.dirY = yAxis;
    }

    player.vx = xAxis * baseSpeed;
    player.vy = yAxis * baseSpeed;

    const b = state.worldBounds;
    const solids = activeBlockingRects().filter((rect) => !rect.hole);
    const targetX = clamp(player.x + player.vx * dt, b.x, b.x + b.w);
    const targetY = clamp(player.y + player.vy * dt, b.y, b.y + b.h);

    const blockedX = solids.some((rect) => collidesWithRect(targetX, player.y, rect));
    if (!blockedX) {
      player.x = targetX;
    }

    const blockedY = solids.some((rect) => collidesWithRect(player.x, targetY, rect));
    if (!blockedY) {
      player.y = targetY;
    }
  }

  const b = state.worldBounds;
  player.x = clamp(player.x, b.x, b.x + b.w);
  player.y = clamp(player.y, b.y, b.y + b.h);
}

function nearDoor() {
  const player = state.player;
  const door = state.door;
  return (
    player.x > door.x - 14 &&
    player.x < door.x + door.w + 10 &&
    player.y > door.y - 12 &&
    player.y < door.y + door.h + 12
  );
}

function collectResource(item) {
  if (item.collected) return;
  item.collected = true;

  if (item.type === "mint") state.inventory.mint += 1;
  if (item.type === "glass") state.inventory.glassStone += 1;
  if (item.type === "frog") state.inventory.wetFrog += 1;
  if (item.type === "firefly") state.inventory.firefly += 1;
  if (item.type === "dense_reed") state.inventory.denseReed += 1;
  if (item.type === "flax_seed") state.inventory.flaxSeed += 1;

  if (state.chapter === 2) {
    state.gathered += 1;
    if (state.gathered >= state.gatherGoal) {
      setObjective("Ресурсы собраны. Продолжайте путь вправо.");
      setHint("Тропа стала тихой... кто-то ждет впереди.", 2.6);
    } else {
      setObjective(`Соберите ресурсы на тропе (${state.gathered}/${state.gatherGoal}).`);
      setHint(`Собрано: ${item.name} (${state.gathered}/${state.gatherGoal})`, 1.6);
    }
  } else if (state.chapter === 5 || state.chapter === 7 || state.chapter === 8) {
    setHint(`Собрано: ${item.name}. Ресурсы продолжают появляться.`, 1.8);
  } else {
    setHint(`Собрано: ${item.name}`, 1.5);
  }

  state.sparks.push({ x: item.x, y: item.y, life: 0.22, color: "#b7f07a" });
}

function collectNearbyResources() {
  for (const item of state.collectibles) {
    if (item.collected) continue;
    if (dist(state.player.x, state.player.y, item.x, item.y) < 10) {
      collectResource(item);
    }
  }
}

function spawnDrop(x, y, type, name) {
  state.drops.push({
    x,
    y,
    type,
    name,
    collected: false,
  });
}

function collectDrop(drop) {
  if (drop.collected) return;
  drop.collected = true;

  if (drop.type === "fish_oil") {
    state.inventory.fishOil += 1;
    state.lakeQuest.fishOilCollected += 1;
    state.player.maxMana += 2;
    state.player.mana = Math.min(state.player.maxMana, state.player.mana + 6);
    setHint("Получен рыбий жир: +2 к максимальной мане.", 2.4);

    if (!state.flags.lakeQuestDone && state.lakeQuest.fishOilCollected >= state.lakeQuest.fishOilGoal) {
      state.flags.lakeQuestDone = true;
      setObjective("Рыбий жир собран. Переходите к мосту вправо.");
      setStoryLine("Озёрные твари отступили. Путь к старому мосту открыт.");
      awardGachaCoins(3, "озёрное испытание");
    } else if (!state.flags.lakeQuestDone) {
      setObjective(
        `У озёр победите монстров и соберите рыбий жир (${state.lakeQuest.fishOilCollected}/${state.lakeQuest.fishOilGoal}).`
      );
    }
  }

  state.sparks.push({ x: drop.x, y: drop.y, life: 0.2, color: "#8fdfff" });
}

function collectNearbyDrops() {
  for (const drop of state.drops) {
    if (drop.collected) continue;
    if (dist(state.player.x, state.player.y, drop.x, drop.y) < 11) {
      collectDrop(drop);
    }
  }
  state.drops = state.drops.filter((drop) => !drop.collected);
}

function applyDamageToPlayer(amount, textHint) {
  const reduced = Math.max(1, Math.round(amount * (1 - state.combatMods.damageReduction)));
  if (state.player.invuln > 0) return;
  state.player.hp = Math.max(0, state.player.hp - reduced);
  state.player.invuln = 0.35;
  state.flash = 0.12;
  if (textHint) {
    setHint(textHint, 1.6);
  }
}

function spawnLakeMonster(lake) {
  const angle = randomRange(0, Math.PI * 2);
  const x = lake.x + Math.cos(angle) * Math.max(2, lake.r - 5);
  const y = lake.y + Math.sin(angle) * Math.max(2, lake.r - 5);
  state.enemies.push({
    id: `lake_${Math.round(state.time * 1000)}_${randomInt(0, 999)}`,
    kind: "lake_spawn",
    x,
    y,
    hp: 28,
    maxHp: 28,
    speed: randomRange(24, 34),
    attackCooldown: randomRange(0.6, 1.2),
    contactDamage: 8,
    hitFlash: 0,
    dotTimer: 0,
    dotTick: 0,
    alive: true,
  });
}

function spawnBatSwarm() {
  const bats = [];
  for (let i = 0; i < 7; i += 1) {
    bats.push({
      id: `bat_${i}_${Date.now()}`,
      kind: "bat",
      x: 188 + Math.cos(i * 0.7) * 28,
      y: 86 + Math.sin(i * 0.9) * 22,
      hp: 22,
      maxHp: 22,
      speed: randomRange(38, 52),
      attackCooldown: randomRange(0.3, 0.9),
      contactDamage: 7,
      hitFlash: 0,
      dotTimer: 0,
      dotTick: 0,
      flutter: randomRange(0, Math.PI * 2),
      alive: true,
    });
  }
  return bats;
}

function updateLakeMonsterSpawns(dt) {
  if (state.chapter !== 5) return;
  for (const lake of state.lakes) {
    lake.timer -= dt;
    if (lake.timer > 0) continue;
    const aliveCount = state.enemies.filter((enemy) => enemy.kind === "lake_spawn" && enemy.alive).length;
    if (aliveCount < 3) {
      spawnLakeMonster(lake);
    }
    lake.timer = randomRange(lake.minInterval, lake.maxInterval);
  }
}

function nearestEnemyToPlayer(maxDistance = Infinity) {
  let best = null;
  let bestDistance = maxDistance;

  if (state.wolf && state.wolf.alive) {
    const wolfDistance = dist(state.player.x, state.player.y, state.wolf.x, state.wolf.y);
    if (wolfDistance < bestDistance) {
      bestDistance = wolfDistance;
      best = { type: "wolf", ref: state.wolf, distance: wolfDistance };
    }
  }

  for (const enemy of state.enemies) {
    if (!enemy.alive) continue;
    const d = dist(state.player.x, state.player.y, enemy.x, enemy.y);
    if (d < bestDistance) {
      bestDistance = d;
      best = { type: "enemy", ref: enemy, distance: d };
    }
  }

  return best;
}

function isBreakableBroken(id) {
  const obstacle = state.breakables.find((entry) => entry.id === id);
  return obstacle ? obstacle.broken : false;
}

function circleIntersectsRect(cx, cy, radius, rect) {
  const nearestX = clamp(cx, rect.x, rect.x + rect.w);
  const nearestY = clamp(cy, rect.y, rect.y + rect.h);
  return dist(cx, cy, nearestX, nearestY) <= radius;
}

function damageWolf(amount) {
  if (!state.wolf || !state.wolf.alive) return;
  state.wolf.hp = Math.max(0, state.wolf.hp - amount);
  state.wolf.hitFlash = 0.12;
  state.sparks.push({ x: state.wolf.x, y: state.wolf.y, life: 0.16, color: "#ffe4b6" });

  if (state.wolf.hp > 0) return;

  state.wolf.alive = false;
  state.flags.wolfDefeated = true;
  state.flags.leafFallUnlocked = true;
  state.skills.leafFall = true;
  state.inventory.magicFang += 1;
  state.player.maxHp += 2;
  state.player.hp = Math.min(state.player.maxHp, state.player.hp + 2);
  state.player.level += 1;
  awardGachaCoins(2, "победа над волком");

  setObjective("Волк повержен. Нажмите L, чтобы «Листопадом» разбить завал впереди.");
  setHint("Получен магический клык (+2 к максимальному здоровью).", 3.2);
  setStoryLine("Новый навык: «Листопад». Он ломает препятствия в лесу.");
}

function damageEnemy(enemy, amount) {
  if (!enemy || !enemy.alive) return;

  enemy.hp = Math.max(0, enemy.hp - amount);
  enemy.hitFlash = 0.12;
  state.sparks.push({ x: enemy.x, y: enemy.y, life: 0.14, color: "#ffdca2" });

  if (state.skills.poisonBloom && state.combatMods.dotDamage > 0) {
    enemy.dotTimer = Math.max(enemy.dotTimer || 0, 3.6);
    enemy.dotTick = Math.min(enemy.dotTick || 0, 0.35);
  }

  if (enemy.hp > 0) return;
  enemy.alive = false;

  if (enemy.kind === "lake_spawn") {
    spawnDrop(enemy.x, enemy.y, "fish_oil", "Рыбий жир");
  }

  if (enemy.kind === "bat") {
    const aliveBats = state.enemies.filter((entry) => entry.kind === "bat" && entry.alive).length;
    if (aliveBats <= 0 && !state.flags.batsDefeated) {
      state.flags.batsDefeated = true;
      state.player.level += 1;
      awardGachaCoins(4, "отражение налёта летучих мышей");
      state.skillChoice.active = true;
      state.skillChoice.selected = null;
      setObjective("Выберите навык: A - больше урона, B - продолжительный урон.");
      setStoryLine("Новый уровень! Выберите боевой стиль.");
    }
  }
}

function spendMana(cost, label) {
  if (state.player.mana < cost) {
    setHint(`Недостаточно маны для «${label}».`, 1.8);
    return false;
  }
  state.player.mana = Math.max(0, state.player.mana - cost);
  return true;
}

function tryDodge() {
  const player = state.player;
  if (player.dodgeCooldown > 0) return;

  let xAxis = 0;
  let yAxis = 0;
  if (keyDown(["ArrowLeft", "KeyA"])) xAxis -= 1;
  if (keyDown(["ArrowRight", "KeyD"])) xAxis += 1;
  if (keyDown(["ArrowUp", "KeyW"])) yAxis -= 1;
  if (keyDown(["ArrowDown", "KeyS"])) yAxis += 1;

  if (xAxis === 0 && yAxis === 0) {
    xAxis = player.dirX;
    yAxis = player.dirY;
  }

  const length = Math.hypot(xAxis, yAxis) || 1;
  xAxis /= length;
  yAxis /= length;

  player.vx = xAxis * 220;
  player.vy = yAxis * 220;
  player.dodgeTimer = 0.14;
  player.dodgeCooldown = 1.2;
  player.invuln = Math.max(player.invuln, 0.22);
  state.sparks.push({ x: player.x, y: player.y, life: 0.14, color: "#9ed4ff" });
}

function tryBasicAttack() {
  const player = state.player;
  if (player.basicCooldown > 0) return;

  player.basicCooldown = 0.35;
  state.sparks.push({
    x: player.x + player.dirX * 10,
    y: player.y + player.dirY * 10,
    life: 0.13,
    color: "#ffdca2",
  });

  const target = nearestEnemyToPlayer(28);
  if (!target) return;

  const damage = 13 + (state.skills.directBurst ? Math.max(4, state.combatMods.bonusDamage) : 0);
  if (target.type === "wolf") {
    if (target.distance < 28) {
      damageWolf(damage);
    }
    return;
  }

  if (target.distance < 28) {
    damageEnemy(target.ref, damage);
  }
}

function tryWindGust() {
  if (!state.skills.windGust) return;
  const player = state.player;
  if (player.windCooldown > 0) return;
  if (!spendMana(6, "Порыв ветра")) return;

  player.windCooldown = 0.85;

  let xAxis = player.dirX;
  let yAxis = player.dirY;

  const target = nearestEnemyToPlayer(240);
  if (target) {
    const toEnemyX = target.ref.x - player.x;
    const toEnemyY = target.ref.y - player.y;
    const length = Math.hypot(toEnemyX, toEnemyY);
    if (length > 0.01) {
      xAxis = toEnemyX / length;
      yAxis = toEnemyY / length;
    }
  }

  state.projectiles.push({
    kind: "wind",
    x: player.x + xAxis * 7,
    y: player.y + yAxis * 7,
    vx: xAxis * 182,
    vy: yAxis * 182,
    life: 1.1,
    damage: 30 + Math.round(state.combatMods.bonusDamage * 0.45),
    radius: 2.5,
  });
}

function onHealerTreeBroken() {
  if (state.flags.rescuedHealer) return;

  startDialogue(
    [
      "т: спасибо тебе большое, эльфийка. порыв ветра скинул на меня это дерево, и я пролежала несколько дней.",
      "т: не знаю, что со мной было бы без зелья здоровья. за твое добродушие дарую рецепт зелья восстановления здоровья.",
      "т: изготовь с запасом, и путь к источнику станет легче.",
      "э: спасибо большое, мудрейшая травница.",
    ],
    () => {
      state.flags.rescuedHealer = true;
      state.inventory.healingRecipeScroll = 1;
      state.recipeBook.hasHealingRecipe = true;
      setObjective("Рецепт добавлен в рюкзак. Откройте книгу (R) и выходите к озёрам вправо.");
      setHint("Крафт: 1 мята + 1 влажная лягушка (H). За квест вы получили валюту.", 3.8);
      setStoryLine("Новый рецепт в книге: зелье восстановления здоровья.");
      awardGachaCoins(2, "помощь травнице");
    }
  );
}

function breakNearbyObstacles(centerX, centerY, radius) {
  for (const obstacle of state.breakables) {
    if (obstacle.broken) continue;
    if (obstacle.chapter !== state.chapter) continue;
    if (!circleIntersectsRect(centerX, centerY, radius, obstacle)) continue;

    if (obstacle.id === "healer_tree" && !state.flags.healerFound) {
      setHint("Сначала проверьте, кто под деревом (E).", 2);
      continue;
    }

    obstacle.hp -= 1;
    state.sparks.push({
      x: obstacle.x + obstacle.w / 2,
      y: obstacle.y + obstacle.h / 2,
      life: 0.2,
      color: "#ebd09e",
    });

    if (obstacle.hp > 0) continue;

    obstacle.broken = true;
    setHint(`«Листопад» разрушил: ${obstacle.name}.`, 2.2);

    if (obstacle.id === "wolf_barrier") {
      setObjective("Путь открыт. Идите в глубокий лес вправо.");
    }

    if (obstacle.id === "healer_tree") {
      onHealerTreeBroken();
    }
  }
}

function tryLeafFall() {
  if (!state.skills.leafFall) {
    setHint("Навык «Листопад» откроется после победы над волком.", 2.2);
    return;
  }

  const player = state.player;
  if (player.leafCooldown > 0) return;
  if (!spendMana(10, "Листопад")) return;

  player.leafCooldown = 1.35;

  const centerX = player.x + player.dirX * 16;
  const centerY = player.y + player.dirY * 16;

  state.leafBursts.push({ x: centerX, y: centerY, radius: 30, life: 0.2 });
  state.sparks.push({ x: centerX, y: centerY, life: 0.18, color: "#c8f574" });

  if (state.chapter === 3 && state.wolf && state.wolf.alive) {
    if (dist(centerX, centerY, state.wolf.x, state.wolf.y) < 34) {
      damageWolf(18 + Math.round(state.combatMods.bonusDamage * 0.3));
    }
  }

  for (const enemy of state.enemies) {
    if (!enemy.alive) continue;
    if (dist(centerX, centerY, enemy.x, enemy.y) < 34) {
      damageEnemy(enemy, 16 + Math.round(state.combatMods.bonusDamage * 0.25));
    }
  }

  breakNearbyObstacles(centerX, centerY, 34);
}

function toggleRecipeBook() {
  if (!state.recipeBook.hasHealingRecipe) {
    setHint("Книга рецептов пуста.", 1.8);
    return;
  }

  if (!state.recipeBook.learnedHealingPotion) {
    state.recipeBook.learnedHealingPotion = true;
    setHint("Рецепт изучен: 1 мята + 1 влажная лягушка = зелье восстановления.", 3);
    setStoryLine("Эльфийка изучила новый рецепт и может варить зелья.");
  }

  state.recipeBook.open = !state.recipeBook.open;
}

function tryCraftPotion() {
  if (!state.recipeBook.learnedHealingPotion) {
    setHint("Сначала прочитайте рецепт в книге (R).", 2);
    return;
  }

  if (state.inventory.mint < 1 || state.inventory.wetFrog < 1) {
    setHint("Нужно 1 мятное растение и 1 влажная лягушка.", 2);
    return;
  }

  state.inventory.mint -= 1;
  state.inventory.wetFrog -= 1;
  state.inventory.healingPotion += 1;
  setHint("Зелье восстановления создано (+1).", 2);
}

function tryUsePotion() {
  if (state.inventory.healingPotion < 1) {
    setHint("В рюкзаке нет зелья восстановления.", 1.8);
    return;
  }

  if (state.player.hp >= state.player.maxHp) {
    setHint("Здоровье уже полное.", 1.6);
    return;
  }

  state.inventory.healingPotion -= 1;
  state.player.hp = Math.min(state.player.maxHp, state.player.hp + 20);
  setHint("Эльфийка восстановила здоровье.", 1.8);
}

function updateProjectiles(dt) {
  for (let i = state.projectiles.length - 1; i >= 0; i -= 1) {
    const projectile = state.projectiles[i];
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;
    projectile.life -= dt;

    const outside =
      projectile.x < 0 ||
      projectile.x > WIDTH ||
      projectile.y < 0 ||
      projectile.y > HEIGHT;

    if (outside || projectile.life <= 0) {
      state.projectiles.splice(i, 1);
      continue;
    }

    if (state.wolf && state.wolf.alive && dist(projectile.x, projectile.y, state.wolf.x, state.wolf.y) < 11) {
      damageWolf(projectile.damage);
      state.projectiles.splice(i, 1);
      continue;
    }

    let hitEnemy = false;
    for (const enemy of state.enemies) {
      if (!enemy.alive) continue;
      if (dist(projectile.x, projectile.y, enemy.x, enemy.y) < 10) {
        damageEnemy(enemy, projectile.damage);
        hitEnemy = true;
        break;
      }
    }
    if (hitEnemy) {
      state.projectiles.splice(i, 1);
    }
  }
}

function updateLeafBursts(dt) {
  for (let i = state.leafBursts.length - 1; i >= 0; i -= 1) {
    state.leafBursts[i].life -= dt;
    if (state.leafBursts[i].life <= 0) {
      state.leafBursts.splice(i, 1);
    }
  }
}

function updateSparks(dt) {
  for (let i = state.sparks.length - 1; i >= 0; i -= 1) {
    state.sparks[i].life -= dt;
    if (state.sparks[i].life <= 0) {
      state.sparks.splice(i, 1);
    }
  }
}

function updateWolf(dt) {
  if (!state.wolf || !state.wolf.alive) return;

  const wolf = state.wolf;
  const player = state.player;

  const toPlayerX = player.x - wolf.x;
  const toPlayerY = player.y - wolf.y;
  const distance = Math.hypot(toPlayerX, toPlayerY);

  if (distance > 18) {
    const moveX = (toPlayerX / distance) * wolf.speed;
    const moveY = (toPlayerY / distance) * wolf.speed;
    wolf.x += moveX * dt;
    wolf.y += moveY * dt;
  }

  if (distance < 18 && wolf.attackCooldown <= 0) {
    wolf.attackCooldown = 1.35;
    applyDamageToPlayer(11, "Волк попал. Уклоняйтесь и тратьте ману экономно.");
  }

  if (player.hp > 0) return;

  if (tryRespawnFromCheckpoint()) {
    return;
  }

  player.hp = 42;
  player.mana = Math.min(player.maxMana, player.mana + 6);
  player.x = 28;
  player.y = 98;
  player.invuln = 1;
  setHint("Эльфийка отступила и собралась с силами.", 2.8);
}

function updateEnemies(dt) {
  const player = state.player;
  for (const enemy of state.enemies) {
    if (!enemy.alive) continue;

    if (enemy.dotTimer > 0 && enemy.dotTick <= 0 && state.combatMods.dotDamage > 0) {
      enemy.dotTick = 0.7;
      enemy.hp = Math.max(0, enemy.hp - state.combatMods.dotDamage);
      if (enemy.hp <= 0) {
        damageEnemy(enemy, 0);
        continue;
      }
      state.sparks.push({ x: enemy.x, y: enemy.y, life: 0.16, color: "#8cd57a" });
    }

    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const d = Math.hypot(dx, dy) || 1;
    const baseSpeed = enemy.speed || 30;

    let vx = (dx / d) * baseSpeed;
    let vy = (dy / d) * baseSpeed;

    if (enemy.kind === "bat") {
      enemy.flutter = (enemy.flutter || 0) + dt * 6;
      vy += Math.sin(enemy.flutter) * 18;
      vx += Math.cos(enemy.flutter * 0.7) * 8;
    }

    enemy.x += vx * dt;
    enemy.y += vy * dt;
    enemy.x = clamp(enemy.x, state.worldBounds.x + 2, state.worldBounds.x + state.worldBounds.w - 2);
    enemy.y = clamp(enemy.y, state.worldBounds.y + 2, state.worldBounds.y + state.worldBounds.h - 2);

    if (d < 16 && enemy.attackCooldown <= 0) {
      enemy.attackCooldown = enemy.kind === "bat" ? 0.82 : 1.18;
      const hitText =
        enemy.kind === "bat"
          ? "Летучая мышь царапнула эльфийку."
          : "Озёрная тварь ударила и попыталась утащить в воду.";
      applyDamageToPlayer(enemy.contactDamage || 6, hitText);
    }
  }

  state.enemies = state.enemies.filter((enemy) => enemy.alive);
}

function tryBridgeSprint() {
  if (state.chapter !== 6 || !state.bridgeChallenge.active) {
    tryDodge();
    return;
  }

  if (state.bridgeChallenge.sprintCooldown > 0) return;
  state.bridgeChallenge.sprintCooldown = 0.22;
  state.player.bridgeSprint = 0.32;
  state.player.invuln = Math.max(state.player.invuln, 0.14);
  state.sparks.push({ x: state.player.x, y: state.player.y, life: 0.16, color: "#f8d08d" });
}

function bridgeFailedStep() {
  state.bridgeChallenge.failures += 1;
  state.bridgeChallenge.elapsed = 0;
  const bonus = Math.min(0.35, state.bridgeChallenge.failures * 0.05);
  state.bridgeChallenge.planks = buildBridgePlanks().map((plank) => ({ ...plank, fallAt: plank.fallAt + bonus }));
  state.player.x = 24;
  state.player.y = 94;
  state.player.vx = 0;
  state.player.vy = 0;
  state.player.invuln = 0.8;
  setHint("Доска сорвалась. Нужен быстрый рывок (Space).", 2.2);
}

function updateBridgeChallenge(dt) {
  if (state.chapter !== 6 || !state.bridgeChallenge.active) return;

  state.bridgeChallenge.elapsed += dt;
  if (state.player.x > 300) {
    state.bridgeChallenge.active = false;
    if (!state.flags.bridgePassed) {
      state.flags.bridgePassed = true;
      awardGachaCoins(2, "испытание на мосту");
      setStoryLine("Мост остался позади. Впереди грибная аллея у источника.");
    }
    return;
  }

  for (const plank of state.bridgeChallenge.planks) {
    if (state.bridgeChallenge.elapsed <= plank.fallAt) continue;
    if (collidesWithRect(state.player.x, state.player.y, plank)) {
      bridgeFailedStep();
      break;
    }
  }
}

function shouldEnterCastLeafFall() {
  if (!state.skills.leafFall) return false;

  if (state.chapter === 3) {
    const barrier = state.breakables.find((entry) => entry.id === "wolf_barrier");
    if (!barrier || barrier.broken) return false;
    const centerX = barrier.x + barrier.w / 2;
    const centerY = barrier.y + barrier.h / 2;
    return dist(state.player.x, state.player.y, centerX, centerY) < 58;
  }

  if (state.chapter === 4) {
    const tree = state.breakables.find((entry) => entry.id === "healer_tree");
    if (!tree || tree.broken || !state.flags.healerFound) return false;
    const centerX = tree.x + tree.w / 2;
    const centerY = tree.y + tree.h / 2;
    return dist(state.player.x, state.player.y, centerX, centerY) < 66;
  }

  return false;
}

function startRegistrationQuiz() {
  state.registration.active = true;
  state.registration.index = 0;
  state.registration.score = 0;
  setHint("Опрос: используйте A или B для ответа.", 2.4);
}

function submitRegistrationAnswer(answerLetter) {
  if (!state.registration.active) return;
  const question = state.registration.questions[state.registration.index];
  if (!question) return;

  if (question.correct === answerLetter) {
    state.registration.score += 1;
  }
  state.registration.index += 1;

  if (state.registration.index < state.registration.questions.length) {
    return;
  }

  state.registration.active = false;
  if (state.registration.score >= 2) {
    state.flags.registrationComplete = true;
    awardGachaCoins(2, "опрос на зачисление");
    setStoryLine("Снуп одобрил заявку. В этот момент у источника началась тревога.");
    gotoChapter(8);
  } else {
    setHint("Ответов недостаточно. Снуп попросил пройти опрос заново.", 2.6);
    setObjective("Подойдите к столу регистрации и снова пройдите короткий опрос (E).");
  }
}

function chooseSkillOption(option) {
  if (!state.skillChoice.active) return;

  if (option === "A") {
    state.skills.directBurst = true;
    state.combatMods.bonusDamage = Math.max(state.combatMods.bonusDamage, 7);
    state.skillChoice.selected = "direct";
    setHint("Выбран навык: «Сокрушающий луч» (+урон).", 2.8);
  } else {
    state.skills.poisonBloom = true;
    state.combatMods.dotDamage = Math.max(state.combatMods.dotDamage, 2.3);
    state.skillChoice.selected = "dot";
    setHint("Выбран навык: «Ядовитая пыльца» (урон со временем).", 2.8);
  }

  state.flags.skillChoiceMade = true;
  state.skillChoice.active = false;
  setObjective("Битва окончена. Откройте меню (M) и баннер для круток (G).");
  setStoryLine("Новый навык освоен. Отряд готов к расследованию у источника.");
  gotoChapter(9);
}

function tryInteract() {
  if (tryActivateSavePoint()) {
    return;
  }

  if (state.chapter === 0) {
    const nearGrandma = dist(state.player.x, state.player.y, state.grandma.x, state.grandma.y) < 20;
    if (nearGrandma && !state.flags.grandmaTalked) {
      startDialogue(
        [
          "Нурса: Листи, куда ты собралась с таким тревожным лицом в поздний час?",
          "Листи: Бабушка, я не могу сидеть дома. Лес зовёт, и источник будто срывается с ритма.",
          "Нурса: Ты снова чувствуешь магию лучше взрослых… но именно поэтому я боюсь за тебя.",
          "Листи: Я прошла обучение у друидов, умею лечить и защищаться. Я не бегу бездумно.",
          "Нурса: В волшебном лесу сегодня неспокойно: звери агрессивны, вода в озёрах темнеет.",
          "Листи: Тем более я должна идти. Если мы опоздаем, пострадает вся деревня.",
          "Нурса: Возьми мой оберег и обещай возвращаться к кристаллам сохранения.",
          "Листи: Обещаю. Прости, что спорю, но я вернусь и всё расскажу.",
        ],
        () => {
          state.flags.grandmaTalked = true;
          setObjective("Сбегите из дома через дверь справа (E). ");
          setHint("Бабушка против, но Нора решила идти к источнику.", 3);
          setStoryLine("Эльфийка выбрала путь к магическому источнику.");
        }
      );
      return;
    }

    if (nearDoor()) {
      if (state.flags.grandmaTalked) {
        gotoChapter(1);
      } else {
        setHint("Сначала поговорите с бабушкой.", 1.8);
      }
      return;
    }

    setHint("Здесь не с чем взаимодействовать.", 1.4);
    return;
  }

  if (state.chapter === 4) {
    const tree = state.breakables.find((entry) => entry.id === "healer_tree");
    const nearTree = tree
      ? dist(state.player.x, state.player.y, tree.x + tree.w / 2, tree.y + tree.h / 2) < 68
      : false;
    const nearHealer = dist(state.player.x, state.player.y, state.healer.x, state.healer.y) < 56;

    if (!state.flags.healerFound && (nearTree || nearHealer)) {
      startDialogue(
        [
          "Листи: Здесь разорванная одежда и следы когтей... Кто-нибудь меня слышит?",
          "Травница: Да... я под стволом... не могу выбраться, ветви прижали ногу.",
          "Листи: Держитесь, я рядом. Сейчас освобожу проход и выведу вас к безопасному месту.",
          "Травница: Спасибо... если выживу, отдам тебе свиток с рецептом лечебного настоя.",
        ],
        () => {
          state.flags.healerFound = true;
          setObjective("Разбейте дерево навыком «Листопад». ");
          setHint("Используйте L (или Enter рядом с деревом).", 3);
          setStoryLine("Эльфийка готовит новый магический удар.");
        }
      );
      return;
    }

    if (state.flags.healerFound && tree && !tree.broken) {
      setHint("Нужен «Листопад», чтобы убрать дерево.", 2);
      return;
    }
  }

  if (state.chapter === 7) {
    const nearOrganizer = dist(state.player.x, state.player.y, state.organizer.x, state.organizer.y) < 28;
    const nearRegistrar = dist(state.player.x, state.player.y, state.registrar.x, state.registrar.y) < 30;

    if (nearOrganizer && !state.flags.organizerTalked) {
      startDialogue(
        [
          "Кэри: Мы собираем отряд со способностями для расследования и защиты источника.",
          "Кэри: Кто-то похищает неприкосновенную силу, из-за этого лес болеет и звери теряют разум.",
          "Листи: Я уже видела это по пути — волк, озёрные твари, раненые жители. Я хочу помочь.",
          "Кэри: Хорошо говоришь. Но нам нужны не только смелые, нам нужны дисциплинированные.",
          "Кэри: Подойди к столу. Снуп задаст вопросы и проверит, готова ли ты действовать в команде.",
        ],
        () => {
          state.flags.organizerTalked = true;
          setObjective("Подойдите к столу Снупа (справа) и пройдите опрос (E).");
          setHint("В опросе ответы выбираются клавишами A/B.", 3);
        }
      );
      return;
    }

    if (nearRegistrar) {
      if (!state.flags.organizerTalked) {
        setHint("Сначала поговорите с организатором у источника.", 2);
        return;
      }
      if (!state.flags.registrationComplete) {
        startRegistrationQuiz();
        return;
      }
    }
  }
}

function updateChapterTransitions(dt) {
  if (state.chapter === 1) {
    if (state.player.x > 306) {
      gotoChapter(2);
    }
    return;
  }

  if (state.chapter === 2) {
    collectNearbyResources();
    if (state.player.x > 306) {
      if (state.gathered >= state.gatherGoal) {
        gotoChapter(3);
      } else {
        state.player.x = 306;
        setHint(`Нужно собрать еще ${state.gatherGoal - state.gathered} ресурсов.`, 1.9);
      }
    }
    return;
  }

  if (state.chapter === 3) {
    updateWolf(dt);

    if (state.player.x > 306) {
      if (!state.flags.wolfDefeated) {
        state.player.x = 306;
        setHint("Сначала победите волка.", 1.8);
      } else if (!isBreakableBroken("wolf_barrier")) {
        state.player.x = 306;
        setHint("Разбейте сухой завал навыком «Листопад» (L).", 2);
      } else {
        gotoChapter(4);
      }
    }
    return;
  }

  if (state.chapter === 4) {
    collectNearbyResources();
    if (state.player.x > 306) {
      if (!state.flags.rescuedHealer) {
        state.player.x = 306;
        setHint("Помогите травнице, прежде чем идти дальше.", 2);
      } else {
        gotoChapter(5);
      }
    }
    return;
  }

  if (state.chapter === 5) {
    collectNearbyResources();
    collectNearbyDrops();
    updateLakeMonsterSpawns(dt);
    updateEnemies(dt);

    if (state.player.hp <= 0) {
      if (tryRespawnFromCheckpoint()) {
        return;
      }
      state.player.hp = Math.round(state.player.maxHp * 0.6);
      state.player.mana = Math.round(state.player.maxMana * 0.55);
      state.player.x = 24;
      state.player.y = 94;
      setHint("Эльфийка отступила от озёр и восстановилась.", 2.2);
    }

    if (state.player.x > 306) {
      if (!state.flags.lakeQuestDone) {
        state.player.x = 306;
        setHint("Сначала соберите рыбий жир с озёрных монстров.", 2);
      } else {
        gotoChapter(6);
      }
    }
    return;
  }

  if (state.chapter === 6) {
    updateBridgeChallenge(dt);
    if (state.flags.bridgePassed && state.player.x > 306) {
      gotoChapter(7);
    }
    return;
  }

  if (state.chapter === 7) {
    collectNearbyResources();
    if (state.player.x > 306) {
      state.player.x = 306;
      setHint("Сначала поговорите с организатором и пройдите регистрацию.", 2);
    }
    return;
  }

  if (state.chapter === 8) {
    collectNearbyResources();
    updateEnemies(dt);
    if (state.player.hp <= 0) {
      if (tryRespawnFromCheckpoint()) {
        return;
      }
      state.player.hp = Math.round(state.player.maxHp * 0.6);
      state.player.mana = Math.round(state.player.maxMana * 0.55);
      state.player.x = 74;
      state.player.y = 104;
      setHint("Эльфийка перехватила дыхание и снова вступила в бой.", 2.2);
    }
    return;
  }

  if (state.chapter === 9) {
    collectNearbyResources();
  }
}

function update(dt) {
  state.time += dt;

  checkGlobalKeys();
  updateTimers(dt);
  updateProjectiles(dt);
  updateLeafBursts(dt);
  updateSparks(dt);
  updateDynamicResourceSpawns(dt);

  if (state.mode === "menu") return;


  if (state.ui.inventoryOpen) {
    return;
  }

  if (state.dialogue) {
    if (consumeKey(["Enter", "KeyE", "Space"])) {
      nextDialogueLine();
    }
    return;
  }

  if (state.registration.active) {
    if (consumeKey(["KeyA", "KeyJ"])) {
      submitRegistrationAnswer("A");
    } else if (consumeKey(["KeyB", "KeyK", "Enter"])) {
      submitRegistrationAnswer("B");
    }
    return;
  }

  if (state.skillChoice.active) {
    if (consumeKey(["KeyA", "KeyJ"])) {
      chooseSkillOption("A");
    } else if (consumeKey(["KeyB", "KeyK", "Enter"])) {
      chooseSkillOption("B");
    }
    return;
  }

  if (state.ui.menuOpen) {
    if (state.ui.gachaOpen) {
      if (consumeKey(["KeyA", "KeyJ", "Enter"])) {
        runGachaSpins(1);
      }
      if (consumeKey(["KeyB", "KeyK"])) {
        runGachaSpins(5);
      }
    }
    return;
  }

  if (consumeKey(["KeyR"])) {
    toggleRecipeBook();
  }

  if (consumeKey(["KeyH"])) {
    tryCraftPotion();
  }

  if (consumeKey(["KeyU"])) {
    tryUsePotion();
  }

  if (consumeKey(["Space"])) {
    tryBridgeSprint();
  }

  applyPlayerMovement(dt);

  let enterPressed = consumeKey(["Enter"]);
  const useLeafByEnter = enterPressed && shouldEnterCastLeafFall();
  if (useLeafByEnter) {
    tryLeafFall();
    enterPressed = false;
  }

  if (consumeKey(["KeyL"])) {
    tryLeafFall();
  }

  if (consumeKey(["KeyJ", "KeyB"])) {
    tryBasicAttack();
  }

  if (consumeKey(["KeyK", "KeyA"])) {
    tryWindGust();
  }

  if (consumeKey(["KeyE"])) {
    tryInteract();
  }

  if (enterPressed) {
    tryInteract();
  }

  updateChapterTransitions(dt);
}

function drawTree(x, y, scale = 1) {
  const trunkW = Math.round(4 * scale);
  const trunkH = Math.round(6 * scale);
  const crownW = Math.round(12 * scale);
  const crownH = Math.round(10 * scale);

  ctx.fillStyle = "#3f2a17";
  ctx.fillRect(Math.round(x - trunkW / 2), Math.round(y), trunkW, trunkH);

  ctx.fillStyle = "#2f6a43";
  ctx.fillRect(Math.round(x - crownW / 2), Math.round(y - crownH), crownW, crownH);
  ctx.fillStyle = "#4a8f5a";
  ctx.fillRect(Math.round(x - crownW / 2 + 2), Math.round(y - crownH + 2), crownW - 4, crownH - 4);
}

function drawPlayer() {
  const player = state.player;
  const x = Math.round(player.x);
  const y = Math.round(player.y);

  ctx.fillStyle = player.invuln > 0 ? "#fff3cd" : "#f4d2b1";
  ctx.fillRect(x - 2, y - 9, 4, 3);
  ctx.fillStyle = "#8a6be2";
  ctx.fillRect(x - 4, y - 6, 8, 2);

  ctx.fillStyle = "#6d4ec2";
  ctx.fillRect(x - 3, y - 5, 6, 6);
  ctx.fillStyle = "#8e74dc";
  ctx.fillRect(x - 2, y - 4, 4, 4);

  ctx.fillStyle = "#2fc4a6";
  ctx.fillRect(x - 4, y - 2, 8, 5);
  ctx.fillStyle = "#52d8bc";
  ctx.fillRect(x - 3, y - 1, 6, 3);

  ctx.fillStyle = "#23343d";
  ctx.fillRect(x - 3, y + 3, 2, 3);
  ctx.fillRect(x + 1, y + 3, 2, 3);

  if (state.flags.leafFallUnlocked) {
    ctx.fillStyle = "#d4e878";
    ctx.fillRect(x + 4, y - 1, 2, 4);
  }

  ctx.fillStyle = "#b7e3ff";
  ctx.fillRect(x + Math.round(player.dirX * 4), y + Math.round(player.dirY * 3), 1, 1);
  drawEntityName("Листи", x, y - 10, "#e7f7c9");
}

function drawGrandma() {
  const x = Math.round(state.grandma.x);
  const y = Math.round(state.grandma.y);
  ctx.fillStyle = "#d5ceb7";
  ctx.fillRect(x - 2, y - 8, 4, 3);
  ctx.fillStyle = "#85714f";
  ctx.fillRect(x - 4, y - 5, 8, 8);
  ctx.fillStyle = "#9a8562";
  ctx.fillRect(x - 3, y - 4, 6, 5);
  ctx.fillStyle = "#3a2b1e";
  ctx.fillRect(x - 1, y + 3, 2, 3);
  drawEntityName("Нурса", x, y - 10);
}

function drawWolf() {
  if (!state.wolf || !state.wolf.alive) return;

  const wolf = state.wolf;
  const x = Math.round(wolf.x);
  const y = Math.round(wolf.y);

  ctx.fillStyle = wolf.hitFlash > 0 ? "#d8c4ab" : "#8d7962";
  ctx.fillRect(x - 8, y - 6, 16, 9);
  ctx.fillStyle = "#705d4b";
  ctx.fillRect(x - 10, y + 2, 6, 5);
  ctx.fillRect(x + 4, y + 2, 6, 5);
  ctx.fillStyle = "#4a3c31";
  ctx.fillRect(x - 5, y - 7, 10, 3);
  ctx.fillStyle = "#f5e3cc";
  ctx.fillRect(x + 5, y - 2, 2, 1);

  drawEntityName("Старый волк", x, y - 15, "#f2ded0");
  const barX = x - 12;
  const barY = y - 12;
  const hpRatio = wolf.hp / wolf.maxHp;
  ctx.fillStyle = "#2f1e1e";
  ctx.fillRect(barX, barY, 24, 3);
  ctx.fillStyle = "#c95f5f";
  ctx.fillRect(barX + 1, barY + 1, Math.round(22 * hpRatio), 1);
}

function drawHealer() {
  const healerX = Math.round(state.healer.x);
  const healerY = Math.round(state.healer.y);

  ctx.fillStyle = "#efd8b8";
  ctx.fillRect(healerX - 2, healerY - 8, 4, 3);
  ctx.fillStyle = "#4c9a63";
  ctx.fillRect(healerX - 3, healerY - 5, 6, 8);
  ctx.fillStyle = "#7bc58f";
  ctx.fillRect(healerX - 2, healerY - 4, 4, 5);
  drawEntityName("Травница", healerX, healerY - 10);
}

function drawOrganizer() {
  const x = Math.round(state.organizer.x);
  const y = Math.round(state.organizer.y);
  ctx.fillStyle = "#f0dcb9";
  ctx.fillRect(x - 2, y - 8, 4, 3);
  ctx.fillStyle = "#5f6dc7";
  ctx.fillRect(x - 3, y - 5, 6, 8);
  ctx.fillStyle = "#d6d18f";
  ctx.fillRect(x - 4, y + 3, 8, 2);
  drawEntityName("Кэри", x, y - 10, "#d8e8ff");
}

function drawRegistrar() {
  const x = Math.round(state.registrar.x);
  const y = Math.round(state.registrar.y);
  ctx.fillStyle = "#eed8b6";
  ctx.fillRect(x - 2, y - 8, 4, 3);
  ctx.fillStyle = "#7b8c4e";
  ctx.fillRect(x - 3, y - 5, 6, 8);
  ctx.fillStyle = "#d8bc82";
  ctx.fillRect(x - 8, y + 2, 16, 2);
  drawEntityName("Снуп", x, y - 10, "#f5edcf");
}

function drawCollectibles() {
  for (const item of state.collectibles) {
    if (item.collected) continue;

    const x = Math.round(item.x);
    const y = Math.round(item.y);

    if (item.type === "mint") {
      ctx.fillStyle = "#7cf275";
      ctx.fillRect(x - 1, y - 3, 2, 6);
      ctx.fillRect(x - 3, y - 1, 6, 2);
      continue;
    }

    if (item.type === "glass") {
      ctx.fillStyle = "#b9ebff";
      ctx.fillRect(x - 3, y - 2, 6, 4);
      ctx.fillStyle = "#82c6dd";
      ctx.fillRect(x - 2, y - 1, 4, 2);
      continue;
    }

    if (item.type === "firefly") {
      ctx.fillStyle = "#f6f39d";
      ctx.fillRect(x - 1, y - 1, 2, 2);
      ctx.fillStyle = "rgba(246, 243, 157, 0.45)";
      ctx.fillRect(x - 3, y - 3, 6, 6);
      continue;
    }

    if (item.type === "dense_reed") {
      ctx.fillStyle = "#74b45b";
      ctx.fillRect(x - 2, y - 5, 1, 6);
      ctx.fillRect(x, y - 6, 1, 7);
      ctx.fillRect(x + 2, y - 5, 1, 6);
      continue;
    }

    if (item.type === "flax_seed") {
      ctx.fillStyle = "#d5b97c";
      ctx.fillRect(x - 2, y - 2, 4, 4);
      ctx.fillStyle = "#9a7e49";
      ctx.fillRect(x - 1, y - 1, 2, 2);
      continue;
    }

    ctx.fillStyle = "#87c95f";
    ctx.fillRect(x - 3, y - 2, 6, 4);
    ctx.fillStyle = "#2b4a1f";
    ctx.fillRect(x - 1, y - 1, 1, 1);
    ctx.fillRect(x + 1, y - 1, 1, 1);
  }
}

function drawObstacles() {
  for (const obstacle of state.obstacles) {
    ctx.fillStyle = obstacle.colorDark || "#3f3f3f";
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
    ctx.fillStyle = obstacle.colorLight || "#666";
    ctx.fillRect(obstacle.x + 1, obstacle.y + 1, Math.max(1, obstacle.w - 2), Math.max(1, obstacle.h - 2));
  }
}

function drawBreakables() {
  for (const obstacle of state.breakables) {
    if (obstacle.broken || obstacle.chapter !== state.chapter) continue;
    ctx.fillStyle = obstacle.colorDark;
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
    ctx.fillStyle = obstacle.colorLight;
    ctx.fillRect(obstacle.x + 2, obstacle.y + 2, obstacle.w - 4, obstacle.h - 4);
  }
}

function drawSavePoints() {
  for (const point of state.savePoints) {
    const x = Math.round(point.x);
    const y = Math.round(point.y);
    const active = Boolean(point.activated);

    ctx.fillStyle = active ? "#7ef5ff" : "#6ac7df";
    ctx.fillRect(x - 2, y - 8, 4, 8);
    ctx.fillStyle = active ? "#c7fbff" : "#9adbe8";
    ctx.fillRect(x - 4, y - 4, 8, 4);
    ctx.fillStyle = active ? "rgba(126, 245, 255, 0.22)" : "rgba(106, 199, 223, 0.15)";
    ctx.fillRect(x - 8, y - 2, 16, 8);
  }
}

function drawLakes() {
  for (const lake of state.lakes) {
    ctx.fillStyle = "rgba(66, 114, 144, 0.72)";
    ctx.beginPath();
    ctx.arc(lake.x, lake.y, lake.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(129, 184, 214, 0.38)";
    ctx.beginPath();
    ctx.arc(lake.x - 4, lake.y - 3, Math.max(3, lake.r - 8), 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBridgePlanks() {
  if (state.chapter !== 6) return;
  for (const plank of state.bridgeChallenge.planks) {
    const fallen = state.bridgeChallenge.elapsed > plank.fallAt;
    if (fallen) {
      ctx.fillStyle = "rgba(22, 15, 11, 0.82)";
      ctx.fillRect(plank.x, plank.y, plank.w, plank.h);
      continue;
    }
    ctx.fillStyle = "#7b5537";
    ctx.fillRect(plank.x, plank.y, plank.w, plank.h);
    ctx.fillStyle = "#9a6e48";
    ctx.fillRect(plank.x + 1, plank.y + 2, plank.w - 2, plank.h - 4);
  }
}

function drawDrops() {
  for (const drop of state.drops) {
    if (drop.collected) continue;
    const x = Math.round(drop.x);
    const y = Math.round(drop.y);
    if (drop.type === "fish_oil") {
      ctx.fillStyle = "#8fdfff";
      ctx.fillRect(x - 2, y - 3, 4, 6);
      ctx.fillStyle = "#caefff";
      ctx.fillRect(x - 1, y - 2, 2, 3);
    }
  }
}

function drawEnemies() {
  for (const enemy of state.enemies) {
    if (!enemy.alive) continue;
    const x = Math.round(enemy.x);
    const y = Math.round(enemy.y);

    if (enemy.kind === "lake_spawn") {
      ctx.fillStyle = enemy.hitFlash > 0 ? "#d9e7f3" : "#6e91b7";
      ctx.fillRect(x - 6, y - 4, 12, 8);
      ctx.fillStyle = "#c1d4e8";
      ctx.fillRect(x - 2, y - 2, 4, 3);
    } else if (enemy.kind === "bat") {
      ctx.fillStyle = enemy.hitFlash > 0 ? "#f1d5de" : "#5d4758";
      ctx.fillRect(x - 5, y - 2, 10, 4);
      ctx.fillRect(x - 8, y - 1, 3, 2);
      ctx.fillRect(x + 5, y - 1, 3, 2);
      ctx.fillStyle = "#b99eb0";
      ctx.fillRect(x - 1, y + 2, 2, 1);
    }

    drawEntityName(enemy.kind === "bat" ? "Летучая мышь" : "Озёрный монстр", x, y - 10, "#f2d8d8");
    const ratio = enemy.maxHp > 0 ? enemy.hp / enemy.maxHp : 0;
    ctx.fillStyle = "#271d1d";
    ctx.fillRect(x - 7, y - 8, 14, 2);
    ctx.fillStyle = "#d06f6f";
    ctx.fillRect(x - 7, y - 8, Math.round(14 * ratio), 2);
  }
}

function drawProjectiles() {
  for (const projectile of state.projectiles) {
    ctx.fillStyle = projectile.kind === "wind" ? "#8fdfff" : "#82e3ff";
    ctx.fillRect(
      Math.round(projectile.x - projectile.radius),
      Math.round(projectile.y - projectile.radius),
      Math.round(projectile.radius * 2),
      Math.round(projectile.radius * 2)
    );
  }
}

function drawLeafBursts() {
  for (const burst of state.leafBursts) {
    const lifeRatio = burst.life / 0.2;
    const size = Math.max(2, Math.round(burst.radius * lifeRatio));
    ctx.fillStyle = `rgba(185, 235, 96, ${0.22 + lifeRatio * 0.25})`;
    ctx.fillRect(Math.round(burst.x - size / 2), Math.round(burst.y - size / 2), size, size);
  }
}

function drawSparks() {
  for (const spark of state.sparks) {
    const size = Math.max(1, Math.round(4 * spark.life));
    ctx.fillStyle = spark.color;
    ctx.fillRect(Math.round(spark.x - size / 2), Math.round(spark.y - size / 2), size, size);
  }
}

function drawHouseBackground() {
  ctx.fillStyle = "#6f5a43";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "#8f7659";
  ctx.fillRect(20, 30, 280, 140);

  ctx.fillStyle = "#4a3a2c";
  ctx.fillRect(20, 30, 280, 8);
  ctx.fillRect(20, 162, 280, 8);
  ctx.fillRect(20, 30, 8, 140);
  ctx.fillRect(292, 30, 8, 140);

  ctx.fillStyle = "#ae8a51";
  ctx.fillRect(state.door.x, state.door.y, state.door.w, state.door.h);

  ctx.fillStyle = "#70442a";
  ctx.fillRect(54, 74, 18, 18);
  ctx.fillStyle = "#ffae5e";
  ctx.fillRect(58, 78, 10, 10);

  ctx.fillStyle = "#63472f";
  ctx.fillRect(156, 74, 58, 24);
}

function drawVillageBackground() {
  ctx.fillStyle = "#577e5f";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "#6ba173";
  ctx.fillRect(0, 24, WIDTH, 132);

  ctx.fillStyle = "#ad956e";
  ctx.fillRect(0, 80, WIDTH, 26);

  const houseXs = [34, 92, 156, 218, 276];
  for (const x of houseXs) {
    ctx.fillStyle = "#6e4b33";
    ctx.fillRect(x - 10, 52, 20, 20);
    ctx.fillStyle = "#8f6744";
    ctx.fillRect(x - 8, 54, 16, 16);
    ctx.fillStyle = "#52341f";
    ctx.fillRect(x - 12, 46, 24, 6);
    ctx.fillStyle = "#ffcb77";
    ctx.fillRect(x - 2, 60, 4, 6);
  }

  const villagerXs = [66, 132, 196, 252];
  for (const x of villagerXs) {
    ctx.fillStyle = "#f2d6b8";
    ctx.fillRect(x - 1, 73, 2, 2);
    ctx.fillStyle = "#5b62a6";
    ctx.fillRect(x - 2, 75, 4, 5);
  }
}

function drawForestBackground(chapter) {
  if (chapter === 6) {
    ctx.fillStyle = "#1f261d";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#273226";
    ctx.fillRect(0, 24, WIDTH, 132);
    ctx.fillStyle = "#2f1d14";
    ctx.fillRect(0, 68, WIDTH, 52);
    ctx.fillStyle = "#41281b";
    ctx.fillRect(0, 74, WIDTH, 40);
    drawBridgePlanks();
    for (const tree of forestDecor[chapter] || []) {
      drawTree(tree.x, tree.y, tree.s);
    }
    return;
  }

  const isMushroomLane = chapter === 7 || chapter === 8 || chapter === 9;
  const tone = chapter === 4 ? "#244833" : chapter === 5 ? "#264f3f" : isMushroomLane ? "#2e3f34" : "#2d5e42";
  const pathTone = chapter === 3 ? "#8f7c5a" : chapter === 5 ? "#8f8465" : isMushroomLane ? "#7f7557" : "#9e8b65";

  ctx.fillStyle = tone;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = isMushroomLane ? "#3a5b46" : "#356a4a";
  ctx.fillRect(0, 22, WIDTH, 136);

  ctx.fillStyle = pathTone;
  ctx.fillRect(0, 78, WIDTH, 28);

  if (chapter === 4) {
    ctx.fillStyle = "#85724f";
    ctx.fillRect(0, 102, WIDTH, 14);
  }

  for (const tree of forestDecor[chapter] || []) {
    drawTree(tree.x, tree.y, tree.s);
  }

  if (chapter === 5) {
    drawLakes();
  }

  if (isMushroomLane) {
    const mushrooms = [
      { x: 28, y: 116, c: "#8ef2ca" },
      { x: 44, y: 122, c: "#b1f4b5" },
      { x: 70, y: 114, c: "#8ef2ca" },
      { x: 96, y: 126, c: "#ffd0f4" },
      { x: 122, y: 118, c: "#8ef2ca" },
      { x: 148, y: 124, c: "#b1f4b5" },
      { x: 176, y: 118, c: "#ffd0f4" },
      { x: 204, y: 124, c: "#8ef2ca" },
      { x: 232, y: 120, c: "#b1f4b5" },
      { x: 260, y: 124, c: "#ffd0f4" },
      { x: 286, y: 118, c: "#8ef2ca" },
    ];
    for (const mushroom of mushrooms) {
      ctx.fillStyle = mushroom.c;
      ctx.fillRect(mushroom.x - 2, mushroom.y - 4, 4, 4);
      ctx.fillStyle = "rgba(176, 246, 226, 0.24)";
      ctx.fillRect(mushroom.x - 5, mushroom.y - 6, 10, 8);
      ctx.fillStyle = "#574934";
      ctx.fillRect(mushroom.x - 1, mushroom.y, 2, 3);
    }
  } else {
    ctx.fillStyle = "#95d2c0";
    for (let i = 0; i < 8; i += 1) {
      const x = Math.round((i * 41 + Math.floor(state.time * 18)) % WIDTH);
      const y = 28 + ((i * 17) % 24);
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

function wrapText(text, maxLength) {
  const words = text.split(" ");
  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxLength) {
      current = candidate;
      continue;
    }
    if (current) lines.push(current);
    current = word;
  }

  if (current) lines.push(current);
  return lines;
}

function ellipsizeText(text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) {
    return text;
  }

  const glyphs = [...text];
  let visible = glyphs.length;
  while (visible > 0) {
    const candidate = `${glyphs.slice(0, visible).join("")}...`;
    if (ctx.measureText(candidate).width <= maxWidth) {
      return candidate;
    }
    visible -= 1;
  }

  return "...";
}


function drawEntityName(text, x, y, color = "#f6efcf") {
  ctx.fillStyle = "rgba(12, 10, 8, 0.72)";
  const width = Math.max(18, Math.round(ctx.measureText(text).width) + 6);
  ctx.fillRect(Math.round(x - width / 2), y - 8, width, 8);
  ctx.fillStyle = color;
  ctx.font = '7px "Lucida Console", "Courier New", monospace';
  ctx.fillText(text, Math.round(x - width / 2) + 3, y - 2);
}

function drawDialoguePanel() {
  if (!state.dialogue) return;

  ctx.fillStyle = "rgba(19, 13, 8, 0.88)";
  ctx.fillRect(8, 122, 304, 50);
  ctx.strokeStyle = "#d3b789";
  ctx.lineWidth = 1;
  ctx.strokeRect(8.5, 122.5, 303, 49);

  const text = state.dialogue.lines[state.dialogue.index];
  const lines = wrapText(text, 50);
  ctx.fillStyle = "#f8ecd1";
  ctx.font = '9px "Lucida Console", "Courier New", monospace';

  const visible = lines.slice(0, 4);
  for (let i = 0; i < visible.length; i += 1) {
    ctx.fillText(visible[i], 14, 136 + i * 10);
  }

  ctx.fillStyle = "#c8c39d";
  ctx.fillText("E / Enter / Space", 206, 166);
}

function drawStoryLine() {
  if (!state.storyLine || state.dialogue) return;
  const panelX = 66;
  const panelW = 188;
  ctx.fillStyle = "rgba(12, 17, 14, 0.58)";
  ctx.fillRect(panelX, 8, panelW, 12);
  ctx.fillStyle = "#f4edc4";
  ctx.font = '8px "Lucida Console", "Courier New", monospace';
  const line = ellipsizeText(state.storyLine, panelW - 8);
  ctx.fillText(line, panelX + 4, 16);
}

function drawBridgePanel() {
  if (state.chapter !== 6 || !state.bridgeChallenge.active) return;
  const progress = clamp(state.player.x / 306, 0, 1);
  ctx.fillStyle = "rgba(16, 12, 8, 0.72)";
  ctx.fillRect(94, 24, 132, 14);
  ctx.fillStyle = "#7a5738";
  ctx.fillRect(96, 26, 128, 10);
  ctx.fillStyle = "#cfa46d";
  ctx.fillRect(96, 26, Math.round(128 * progress), 10);
  ctx.fillStyle = "#f2e1c2";
  ctx.font = '8px "Lucida Console", "Courier New", monospace';
  ctx.fillText("Мост: Space для рывка", 102, 34);
}

function drawRegistrationPanel() {
  if (!state.registration.active) return;
  const question = state.registration.questions[state.registration.index];
  if (!question) return;

  ctx.fillStyle = "rgba(20, 15, 10, 0.9)";
  ctx.fillRect(24, 42, 272, 56);
  ctx.strokeStyle = "#d7bf96";
  ctx.strokeRect(24.5, 42.5, 271, 55);
  ctx.fillStyle = "#f3e4c7";
  ctx.font = '8px "Lucida Console", "Courier New", monospace';
  ctx.fillText(question.q, 32, 56);
  ctx.fillStyle = "#bddf9f";
  ctx.fillText(question.a, 32, 72);
  ctx.fillStyle = "#9dd5f6";
  ctx.fillText(question.b, 32, 84);
  ctx.fillStyle = "#d6c8ab";
  ctx.fillText(`Вопрос ${state.registration.index + 1}/3 | Счёт: ${state.registration.score}`, 32, 94);
}

function drawSkillChoicePanel() {
  if (!state.skillChoice.active) return;
  ctx.fillStyle = "rgba(18, 23, 20, 0.88)";
  ctx.fillRect(34, 46, 252, 72);
  ctx.strokeStyle = "#bee1b8";
  ctx.strokeRect(34.5, 46.5, 251, 71);
  ctx.fillStyle = "#e7f4d9";
  ctx.font = '9px "Lucida Console", "Courier New", monospace';
  ctx.fillText("Новый уровень! Выберите навык:", 44, 62);
  ctx.fillStyle = "#ffd09f";
  ctx.fillText("A: Сокрушающий луч (+урон)", 44, 80);
  ctx.fillStyle = "#bde6b3";
  ctx.fillText("B: Ядовитая пыльца (DoT)", 44, 96);
  ctx.fillStyle = "#d7dfbe";
  ctx.fillText("Выбор можно сделать один раз.", 44, 110);
}

function drawPauseMenuPanel() {
  if (!state.ui.menuOpen) return;

  ctx.fillStyle = "rgba(11, 16, 13, 0.82)";
  ctx.fillRect(52, 26, 216, 124);
  ctx.strokeStyle = "#c8dcb2";
  ctx.strokeRect(52.5, 26.5, 215, 123);
  ctx.fillStyle = "#e5f1d8";
  ctx.font = '9px "Lucida Console", "Courier New", monospace';
  ctx.fillText("Меню отряда", 128, 42);
  ctx.font = '8px "Lucida Console", "Courier New", monospace';
  ctx.fillText("M: закрыть", 62, 58);
  ctx.fillText(`Валюта: ${state.gacha.coins}`, 62, 70);
  ctx.fillText("G: открыть баннер", 62, 82);
  ctx.fillText("A: крутка x1", 62, 94);
  ctx.fillText("B: крутка x5", 62, 106);
  ctx.fillText("SSR: Травница | SR: Книжка, Амулет", 62, 122);

  if (state.ui.gachaOpen) {
    drawGachaBannerPanel();
  }
}

function drawGachaBannerPanel() {
  ctx.fillStyle = "rgba(25, 22, 14, 0.92)";
  ctx.fillRect(60, 126, 200, 48);
  ctx.strokeStyle = "#dcb878";
  ctx.strokeRect(60.5, 126.5, 199, 47);
  ctx.fillStyle = "#f6e7be";
  ctx.font = '7px "Lucida Console", "Courier New", monospace';
  ctx.fillText("Баннер: Травница Лиора | Магическая книжка | Оберег-амулет", 64, 138);
  ctx.fillText(`Круток: ${state.gacha.spins} | Цена: ${state.gacha.costPerSpin}`, 64, 150);
  const last = state.gacha.banner.find((entry) => entry.id === state.gacha.lastPull);
  const pullLabel = last ? `Последняя награда: ${last.name}` : "Последняя награда: -";
  ctx.fillText(ellipsizeText(pullLabel, 186), 64, 162);
}

function drawHeartIcon(x, y, ratio) {
  const pixels = [
    [1, 0],
    [2, 0],
    [4, 0],
    [5, 0],
    [0, 1],
    [1, 1],
    [2, 1],
    [3, 1],
    [4, 1],
    [5, 1],
    [6, 1],
    [0, 2],
    [1, 2],
    [2, 2],
    [3, 2],
    [4, 2],
    [5, 2],
    [6, 2],
    [1, 3],
    [2, 3],
    [3, 3],
    [4, 3],
    [5, 3],
    [2, 4],
    [3, 4],
    [4, 4],
    [3, 5],
  ];

  const scale = 2;
  const thresholdY = 6 - ratio * 6;
  for (const [px, py] of pixels) {
    ctx.fillStyle = py >= thresholdY ? "#ea5252" : "#5a2323";
    ctx.fillRect(x + px * scale, y + py * scale, scale, scale);
  }

  ctx.fillStyle = "rgba(19, 13, 8, 0.7)";
  ctx.fillRect(x + 16, y + 2, 42, 10);
  ctx.fillStyle = "#662d2d";
  ctx.fillRect(x + 17, y + 3, 40, 8);
  ctx.fillStyle = "#ea5252";
  ctx.fillRect(x + 17, y + 3, Math.round(40 * ratio), 8);
}

function drawManaFlask(x, y, ratio) {
  ctx.fillStyle = "rgba(19, 13, 8, 0.7)";
  ctx.fillRect(x - 38, y + 1, 38, 12);

  ctx.fillStyle = "#3d2d1d";
  ctx.fillRect(x + 14, y, 4, 3);
  ctx.fillStyle = "#8abed1";
  ctx.fillRect(x + 12, y + 3, 8, 12);
  ctx.fillStyle = "#2e4954";
  ctx.fillRect(x + 13, y + 4, 6, 10);

  const fillHeight = Math.round(10 * ratio);
  ctx.fillStyle = "#66c7ff";
  ctx.fillRect(x + 13, y + 14 - fillHeight, 6, fillHeight);

  ctx.fillStyle = "#2a4e62";
  ctx.fillRect(x - 36, y + 2, 34, 10);
  ctx.fillStyle = "#4f82a2";
  ctx.fillRect(x - 35, y + 3, 32, 8);
  ctx.fillStyle = "#66c7ff";
  ctx.fillRect(x - 35, y + 3, Math.round(32 * ratio), 8);
}

function drawEdgeMeters() {
  const hpRatio = state.player.maxHp > 0 ? state.player.hp / state.player.maxHp : 0;
  const manaRatio = state.player.maxMana > 0 ? state.player.mana / state.player.maxMana : 0;

  drawHeartIcon(8, 8, clamp(hpRatio, 0, 1));
  drawManaFlask(WIDTH - 20, 8, clamp(manaRatio, 0, 1));

  ctx.fillStyle = "#f9f2d3";
  ctx.font = '8px "Lucida Console", "Courier New", monospace';
  ctx.fillText(`${formatStatValue(state.player.hp)}/${formatStatValue(state.player.maxHp)}`, 8, 28);
  const manaText = `${formatStatValue(state.player.mana)}/${formatStatValue(state.player.maxMana)}`;
  ctx.fillText(manaText, WIDTH - 50, 28);
}

function drawRecipeBookPanel() {
  if (!state.recipeBook.open) return;

  ctx.fillStyle = "rgba(23, 20, 13, 0.86)";
  ctx.fillRect(176, 38, 134, 90);
  ctx.strokeStyle = "#d5b888";
  ctx.strokeRect(176.5, 38.5, 133, 89);

  ctx.fillStyle = "#f6e6c4";
  ctx.font = '8px "Lucida Console", "Courier New", monospace';
  ctx.fillText("Книга рецептов", 184, 50);

  if (!state.recipeBook.hasHealingRecipe) {
    ctx.fillText("Пусто", 184, 64);
    return;
  }

  ctx.fillText("Зелье восстановления", 184, 64);
  ctx.fillText("1 мята + 1 лягушка", 184, 74);

  if (state.recipeBook.learnedHealingPotion) {
    ctx.fillStyle = "#b6f08d";
    ctx.fillText("Изучено", 184, 88);
    ctx.fillStyle = "#d9caa9";
    ctx.fillText("H: скрафтить", 184, 102);
    ctx.fillText("U: выпить", 184, 112);
  } else {
    ctx.fillStyle = "#d9caa9";
    ctx.fillText("Нажмите R для изучения", 184, 88);
  }
}


function drawInventoryPanel() {
  if (!state.ui.inventoryOpen) return;
  ctx.fillStyle = "rgba(14, 18, 16, 0.9)";
  ctx.fillRect(20, 20, 280, 140);
  ctx.strokeStyle = "#cfd8b1";
  ctx.strokeRect(20.5, 20.5, 279, 139);
  ctx.fillStyle = "#eaf3d0";
  ctx.font = '9px "Lucida Console", "Courier New", monospace';
  ctx.fillText("Багаж Листи (I — закрыть)", 30, 36);
  ctx.font = '8px "Lucida Console", "Courier New", monospace';
  const rows = [
    `Мята: ${state.inventory.mint}`,
    `Стеклянный камень: ${state.inventory.glassStone}`,
    `Влажная лягушка: ${state.inventory.wetFrog}`,
    `Светлячок: ${state.inventory.firefly}`,
    `Плотный камыш: ${state.inventory.denseReed}`,
    `Семена льна: ${state.inventory.flaxSeed}`,
    `Рыбий жир: ${state.inventory.fishOil}`,
    `Клык: ${state.inventory.magicFang}`,
    `Зелье лечения: ${state.inventory.healingPotion}`,
  ];
  rows.forEach((line, i) => ctx.fillText(line, 30, 54 + i * 11));
}

function drawVictoryPanel() {
  if (state.mode !== "victory" && state.chapter !== 9) return;

  const compact = state.recipeBook.open;
  const x = compact ? 8 : 42;
  const y = 58;
  const w = compact ? 160 : 236;
  const h = compact ? 62 : 62;

  ctx.fillStyle = "rgba(19, 28, 20, 0.64)";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "#b7dba8";
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  ctx.fillStyle = "#e8f7d4";
  ctx.font = '9px "Lucida Console", "Courier New", monospace';

  if (state.chapter === 9 && !compact) {
    ctx.fillText("Отряд собран. Источник ждёт расследования.", x + 8, y + 20);
    ctx.fillText("Откройте меню (M) и крутите баннер (G).", x + 10, y + 34);
    ctx.fillText("Травница, книжка и амулет усиливают отряд.", x + 4, y + 48);
    return;
  }

  if (compact) {
    ctx.fillText("Травница спасена.", x + 12, y + 20);
    ctx.fillText("Рецепт в рюкзаке.", x + 12, y + 34);
    ctx.fillText("Откройте R / крафт H.", x + 12, y + 48);
    return;
  }

  ctx.fillText("Травница спасена. Рецепт в рюкзаке.", x + 16, y + 20);
  ctx.fillText("Откройте книгу (R) и варите зелья.", x + 20, y + 34);
  ctx.fillText("Дальше путь ведет к магическому источнику.", x + 6, y + 48);
}

function renderScene() {
  if (state.chapter === 0) {
    drawHouseBackground();
    drawGrandma();
  } else if (state.chapter === 1) {
    drawVillageBackground();
    drawObstacles();
    drawSavePoints();
  } else {
    drawForestBackground(state.chapter);
    drawObstacles();
    drawCollectibles();
    drawDrops();
    drawBreakables();
    drawSavePoints();
    if (state.chapter === 3) drawWolf();
    if (state.chapter === 4) drawHealer();
    if (state.chapter === 7 || state.chapter === 8 || state.chapter === 9) {
      drawOrganizer();
      drawRegistrar();
    }
    drawEnemies();
  }

  drawProjectiles();
  drawLeafBursts();
  drawSparks();
  drawPlayer();
  drawStoryLine();
  drawBridgePanel();
  drawDialoguePanel();
  drawRegistrationPanel();
  drawSkillChoicePanel();
  if (!state.ui.menuOpen) {
    drawVictoryPanel();
  }
  drawRecipeBookPanel();
  drawPauseMenuPanel();
  drawInventoryPanel();
  drawEdgeMeters();

  if (state.flash > 0) {
    ctx.fillStyle = `rgba(220, 70, 70, ${state.flash * 1.6})`;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

}

function render() {
  renderScene();
  refreshHud();
}

function updateFrame(ts) {
  const delta = Math.min(0.05, (ts - lastFrameTime) / 1000);
  lastFrameTime = ts;

  if (!manualStepping) {
    accumulator += delta;
    while (accumulator >= STEP) {
      update(STEP);
      accumulator -= STEP;
    }
  }

  render();
  requestAnimationFrame(updateFrame);
}

function renderGameToText() {
  const visibleCollectibles = state.collectibles
    .filter((item) => !item.collected)
    .map((item) => ({ type: item.type, name: item.name, x: round(item.x), y: round(item.y) }));

  const activeBreakables = state.breakables
    .filter((item) => item.chapter === state.chapter)
    .map((item) => ({
      id: item.id,
      name: item.name,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
      broken: item.broken,
    }));

  const obstacles = state.obstacles.map((item) => ({
    id: item.id,
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
  }));

  const savePoints = state.savePoints.map((point) => ({
    id: point.id,
    x: round(point.x),
    y: round(point.y),
    activated: Boolean(point.activated),
  }));

  const enemies = [];
  if (state.wolf && state.wolf.alive) {
    enemies.push({
      type: "old_forest_wolf",
      x: round(state.wolf.x),
      y: round(state.wolf.y),
      hp: state.wolf.hp,
    });
  }
  for (const enemy of state.enemies) {
    if (!enemy.alive) continue;
    enemies.push({
      type: enemy.kind,
      x: round(enemy.x),
      y: round(enemy.y),
      hp: round(enemy.hp),
      dot_timer: round(enemy.dotTimer || 0),
    });
  }

  const drops = state.drops.map((drop) => ({
    type: drop.type,
    x: round(drop.x),
    y: round(drop.y),
  }));

  const payload = {
    coordinate_system: "origin top-left; x increases right; y increases down; world units are canvas pixels on 320x180",
    mode: state.mode,
    chapter: state.chapter,
    chapter_name: chapterNames[state.chapter] || "Эпилог",
    objective: state.objective,
    story_line: state.storyLine,
    player: {
      x: round(state.player.x),
      y: round(state.player.y),
      vx: round(state.player.vx),
      vy: round(state.player.vy),
      hp: state.player.hp,
      max_hp: state.player.maxHp,
      mana: round(state.player.mana),
      max_mana: state.player.maxMana,
      level: state.player.level,
      invulnerable: state.player.invuln > 0,
      cooldowns: {
        dodge: round(state.player.dodgeCooldown),
        basic: round(state.player.basicCooldown),
        wind_gust: round(state.player.windCooldown),
        leaf_fall: round(state.player.leafCooldown),
        bridge_sprint: round(state.player.bridgeSprint),
      },
    },
    progress: {
      grandma_talked: state.flags.grandmaTalked,
      village_passed: state.chapter >= 2,
      gathered_resources: `${state.gathered}/${state.gatherGoal}`,
      wolf_defeated: state.flags.wolfDefeated,
      leaf_fall_unlocked: state.flags.leafFallUnlocked,
      healer_found: state.flags.healerFound,
      healer_rescued: state.flags.rescuedHealer,
      lake_quest_done: state.flags.lakeQuestDone,
      bridge_passed: state.flags.bridgePassed,
      organizer_talked: state.flags.organizerTalked,
      registration_complete: state.flags.registrationComplete,
      bats_defeated: state.flags.batsDefeated,
      skill_choice_made: state.flags.skillChoiceMade,
      recipe_read: state.recipeBook.learnedHealingPotion,
    },
    skills: {
      wind_gust: state.skills.windGust,
      leaf_fall: state.skills.leafFall,
      direct_burst: state.skills.directBurst,
      poison_bloom: state.skills.poisonBloom,
    },
    inventory: {
      mint: state.inventory.mint,
      glass_stone: state.inventory.glassStone,
      wet_frog: state.inventory.wetFrog,
      firefly: state.inventory.firefly,
      dense_reed: state.inventory.denseReed,
      flax_seed: state.inventory.flaxSeed,
      fish_oil: state.inventory.fishOil,
      magic_fang: state.inventory.magicFang,
      healing_potion: state.inventory.healingPotion,
      healing_recipe_scroll: state.inventory.healingRecipeScroll,
    },
    recipe_book: {
      has_healing_recipe: state.recipeBook.hasHealingRecipe,
      learned_healing_potion: state.recipeBook.learnedHealingPotion,
      open: state.recipeBook.open,
    },
    enemies,
    drops,
    lakes: state.lakes.map((lake) => ({ x: round(lake.x), y: round(lake.y), r: round(lake.r) })),
    collectibles: visibleCollectibles,
    static_obstacles: obstacles,
    breakable_obstacles: activeBreakables,
    save_points: savePoints,
    checkpoint: {
      id: state.checkpointMeta.id,
      chapter: state.checkpointMeta.chapter,
      saved_at: state.checkpointMeta.savedAt || null,
    },
    quests: {
      fish_oil: `${state.lakeQuest.fishOilCollected}/${state.lakeQuest.fishOilGoal}`,
      bridge_elapsed: round(state.bridgeChallenge.elapsed),
    },
    registration: {
      active: state.registration.active,
      index: state.registration.index,
      score: state.registration.score,
    },
    skill_choice: {
      active: state.skillChoice.active,
      selected: state.skillChoice.selected,
    },
    gacha: {
      coins: state.gacha.coins,
      cost_per_spin: state.gacha.costPerSpin,
      spins: state.gacha.spins,
      last_pull: state.gacha.lastPull,
      owned: state.gacha.owned,
      menu_open: state.ui.menuOpen,
      banner_open: state.ui.gachaOpen,
    },
    combat_mods: {
      bonus_damage: state.combatMods.bonusDamage,
      dot_damage: state.combatMods.dotDamage,
      damage_reduction: state.combatMods.damageReduction,
      ally_regen: state.combatMods.allyRegen,
    },
    healer:
      state.chapter === 4
        ? {
            x: round(state.healer.x),
            y: round(state.healer.y),
            rescued: state.flags.rescuedHealer,
          }
        : null,
    source_npcs:
      state.chapter >= 7
        ? {
            organizer: { x: round(state.organizer.x), y: round(state.organizer.y) },
            registrar: { x: round(state.registrar.x), y: round(state.registrar.y) },
          }
        : null,
    dialogue: state.dialogue ? state.dialogue.lines[state.dialogue.index] : null,
  };

  return JSON.stringify(payload);
}

window.render_game_to_text = renderGameToText;
window.advanceTime = (ms) => {
  manualStepping = true;
  const steps = Math.max(1, Math.round(ms / (1000 / 60)));
  for (let i = 0; i < steps; i += 1) {
    update(STEP);
  }
  render();
};

window.addEventListener("keydown", (event) => {
  if (!keysDown.has(event.code)) {
    keysPressed.add(event.code);
  }
  keysDown.add(event.code);

  if (state.mode === "menu") {
    if (event.code === "ArrowUp") {
      moveMenuSelection(-1);
    }
    if (event.code === "ArrowDown") {
      moveMenuSelection(1);
    }
    if (event.code === "Enter") {
      runSelectedMenuAction();
    }
  }

  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space", "Enter"].includes(event.code)) {
    event.preventDefault();
  }
});

window.addEventListener("keyup", (event) => {
  keysDown.delete(event.code);
});

window.addEventListener("resize", resizeCanvasDisplay);
document.addEventListener("fullscreenchange", resizeCanvasDisplay);
function boot() {
  gotoChapter(0);
  state.mode = "menu";
  state.objective = "Выберите пункт в главном меню";
  state.hint = "Начните игру или откройте раздел «Как играть».";
  setupMenuInteractions();
  resizeCanvasDisplay();
  refreshHud();
  requestAnimationFrame(updateFrame);
}

boot();
