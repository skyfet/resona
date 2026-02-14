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
const buildNode = document.querySelector("#build-label");
const objectiveNode = document.querySelector("#objective");
const hintNode = document.querySelector("#hint");
const bannerBtn = document.querySelector("#banner-btn");
const collectionBtn = document.querySelector("#collection-btn");

window.__resonaBoot = {
  canvas,
  ctx,
  menuNode,
  startBtn,
  continueBtn,
  helpBtn,
  loreBtn,
  controlsPanel,
  menuPanelTitle,
  menuPanelText,
  chapterNode,
  levelNode,
  hpNode,
  manaNode,
  inventoryNode,
  coinsNode,
  buildNode,
  objectiveNode,
  hintNode,
  bannerBtn,
  collectionBtn,
  WIDTH: canvas.width,
  HEIGHT: canvas.height,
  STEP: 1 / 60,
  CHECKPOINT_STORAGE_KEY: "resona_checkpoint_v1",
  utils: window.ResonaUtils || {},
};

canvas.setAttribute("tabindex", "0");
ctx.imageSmoothingEnabled = false;

await import("./src/state.js");
await import("./src/render.js");
const { setupInput } = await import("./src/input.js");
await import("./src/persistence.js");
const { boot, startLoop } = await import("./src/gameplay.js");

setupInput();
await boot();
startLoop();
