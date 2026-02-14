import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const outputDir = path.join(projectRoot, "output", "web-game-keyboard-toggles");
const checkpointStorageKey = "resona_checkpoint_v1";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
};

function createCheckpointSnapshot() {
  return {
    version: 2,
    savedAt: Date.now(),
    savePointId: "source_glade",
    chapter: 9,
    maxChapterUnlocked: 9,
    mode: "play",
    objective: "Автотест клавиатурных переключателей.",
    hint: "-",
    storyLine: "",
    gatherGoal: 3,
    gathered: 3,
    player: {
      x: 158,
      y: 94,
      dirX: 1,
      dirY: 0,
      speed: 68,
      hp: 92,
      maxHp: 110,
      mana: 28,
      maxMana: 34,
      level: 4,
      bridgeSprint: 0,
    },
    inventory: {
      mint: 2,
      glassStone: 2,
      wetFrog: 1,
      firefly: 0,
      denseReed: 0,
      flaxSeed: 0,
      fishOil: 3,
      magicFang: 1,
      healingPotion: 0,
      healingRecipeScroll: 1,
      amulet: 0,
      blackSlime: 0,
      emptyJar: 0,
    },
    flags: {
      grandmaTalked: true,
      wolfDefeated: true,
      leafFallUnlocked: true,
      healerFound: true,
      rescuedHealer: true,
      lakeQuestDone: true,
      bridgePassed: true,
      organizerTalked: true,
      registrationComplete: true,
      batsDefeated: true,
      skillChoiceMade: true,
    },
    skills: {
      windGust: true,
      leafFall: true,
      directBurst: true,
      poisonBloom: false,
    },
    ui: {
      mode: null,
      overlay: null,
      menuOpen: false,
      gachaOpen: false,
      inventoryOpen: false,
      worldMapOpen: false,
      characterMenuOpen: false,
      collectionOpen: false,
      gachaResultOpen: false,
      menuTab: "characters",
      characterSelection: 0,
      weaponSelection: 0,
      amuletSelection: 0,
    },
    gacha: {
      wishTokens: 40,
      spins: 0,
      lastPull: null,
      lastResults: [],
      collection: {
        characters: [],
        weapons: {},
      },
      activeBannerId: "standard_forest",
    },
  };
}

function createStaticServer(rootDir) {
  return http.createServer((req, res) => {
    const requestPath = (req.url || "/").split("?")[0];
    const relativePath = requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, "");
    const resolvedPath = path.resolve(rootDir, relativePath);
    if (!resolvedPath.startsWith(rootDir)) {
      res.statusCode = 403;
      res.end("Forbidden");
      return;
    }

    fs.readFile(resolvedPath, (error, data) => {
      if (error) {
        res.statusCode = error.code === "ENOENT" ? 404 : 500;
        res.end(error.code === "ENOENT" ? "Not found" : "Server error");
        return;
      }
      const ext = path.extname(resolvedPath).toLowerCase();
      res.setHeader("Content-Type", MIME_TYPES[ext] || "application/octet-stream");
      res.statusCode = 200;
      res.end(data);
    });
  });
}

async function advance(page, ms = 120) {
  await page.evaluate((deltaMs) => {
    if (typeof window.advanceTime === "function") {
      window.advanceTime(deltaMs);
    }
  }, ms);
}

async function tapKey(page, code) {
  await page.keyboard.down(code);
  await advance(page, 100);
  await page.keyboard.up(code);
  await advance(page, 120);
}

async function readState(page) {
  const raw = await page.evaluate(() => {
    if (typeof window.render_game_to_text !== "function") return "";
    return window.render_game_to_text();
  });
  assert.notEqual(raw, "", "render_game_to_text is unavailable");
  return JSON.parse(raw);
}

async function run() {
  fs.mkdirSync(outputDir, { recursive: true });
  const server = createStaticServer(projectRoot);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  const url = `http://127.0.0.1:${port}`;

  let browser = null;
  const consoleErrors = [];
  const states = [];

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    await context.addInitScript(
      ({ key, snapshot }) => {
        localStorage.setItem(key, JSON.stringify(snapshot));
      },
      { key: checkpointStorageKey, snapshot: createCheckpointSnapshot() },
    );

    const page = await context.newPage();
    page.on("pageerror", (error) => {
      consoleErrors.push(`pageerror: ${error.message}`);
    });
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(`console.error: ${msg.text()}`);
      }
    });

    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForSelector("#continue-btn:not([hidden])", { timeout: 5000 });
    await page.click("#continue-btn");
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForFunction(() => typeof window.advanceTime === "function");
    await page.waitForFunction(() => {
      try {
        return JSON.parse(window.render_game_to_text()).chapter === 9;
      } catch {
        return false;
      }
    });

    await advance(page, 180);
    const initial = await readState(page);
    states.push(initial);
    assert.equal(initial.chapter, 9, "checkpoint restore should place player in chapter 9");
    assert.equal(initial.ui_mode, "gameplay", "initial UI mode should be gameplay");
    assert.equal(initial.gacha.banner_open, false, "banner should start closed");
    assert.equal(initial.gacha.collection_open, false, "collection should start closed");

    await tapKey(page, "KeyG");
    const gachaOpen = await readState(page);
    states.push(gachaOpen);
    assert.equal(gachaOpen.ui_mode, "gacha", "KeyG should open gacha mode");
    assert.equal(gachaOpen.gacha.menu_open, true, "opening gacha should set menu flag");
    assert.equal(gachaOpen.gacha.banner_open, true, "KeyG should set banner open");

    await tapKey(page, "KeyG");
    const gachaClosed = await readState(page);
    states.push(gachaClosed);
    assert.equal(gachaClosed.ui_mode, "gameplay", "KeyG should close gacha mode");
    assert.equal(gachaClosed.gacha.menu_open, false, "closing gacha should reset menu flag");
    assert.equal(gachaClosed.gacha.banner_open, false, "closing gacha should reset banner flag");

    await tapKey(page, "KeyC");
    const collectionOpen = await readState(page);
    states.push(collectionOpen);
    assert.equal(collectionOpen.ui_mode, "collection", "KeyC should open collection mode");
    assert.equal(collectionOpen.gacha.collection_open, true, "KeyC should set collection flag");
    assert.equal(collectionOpen.gacha.banner_open, false, "collection mode should keep gacha banner closed");

    await tapKey(page, "KeyC");
    const collectionClosed = await readState(page);
    states.push(collectionClosed);
    assert.equal(collectionClosed.ui_mode, "gameplay", "second KeyC should close collection mode");
    assert.equal(collectionClosed.gacha.collection_open, false, "collection flag should reset on close");

    await page.screenshot({ path: path.join(outputDir, "shot-0.png"), fullPage: false });
  } finally {
    states.forEach((state, index) => {
      fs.writeFileSync(path.join(outputDir, `state-${index}.json`), JSON.stringify(state, null, 2));
    });
    if (browser) {
      await browser.close();
    }
    await new Promise((resolve) => server.close(() => resolve()));
  }

  if (consoleErrors.length > 0) {
    throw new Error(`Playwright run produced console errors:\n${consoleErrors.join("\n")}`);
  }
}

run()
  .then(() => {
    console.log("Keyboard toggle harness passed.");
  })
  .catch((error) => {
    console.error(error && error.stack ? error.stack : String(error));
    process.exitCode = 1;
  });
