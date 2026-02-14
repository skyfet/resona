export const UI_MODES = {
  GAMEPLAY: "gameplay",
  MENU: "menu",
  WORLD_MAP: "world_map",
  INVENTORY: "inventory",
  CHARACTER: "character",
  GACHA: "gacha",
  GACHA_RESULT: "gacha_result",
  COLLECTION: "collection",
};

function getOverlay(mode) {
  return mode === UI_MODES.GACHA_RESULT ? "result_modal" : null;
}

export function setUiMode(state, mode) {
  state.ui.mode = mode;
  state.ui.overlay = getOverlay(mode);
  state.ui.menuOpen = mode !== UI_MODES.GAMEPLAY;
  state.ui.gachaOpen = mode === UI_MODES.GACHA || mode === UI_MODES.GACHA_RESULT;
  state.ui.inventoryOpen = mode === UI_MODES.INVENTORY;
  state.ui.worldMapOpen = mode === UI_MODES.WORLD_MAP;
  state.ui.characterMenuOpen = mode === UI_MODES.CHARACTER;
  state.ui.collectionOpen = mode === UI_MODES.COLLECTION;
  state.ui.gachaResultOpen = mode === UI_MODES.GACHA_RESULT;
}

export function getUiMode(state) {
  if (state.ui.mode) return state.ui.mode;
  if (state.ui.gachaResultOpen) return UI_MODES.GACHA_RESULT;
  if (state.ui.gachaOpen) return UI_MODES.GACHA;
  if (state.ui.collectionOpen) return UI_MODES.COLLECTION;
  if (state.ui.characterMenuOpen) return UI_MODES.CHARACTER;
  if (state.ui.worldMapOpen) return UI_MODES.WORLD_MAP;
  if (state.ui.inventoryOpen) return UI_MODES.INVENTORY;
  if (state.ui.menuOpen) return UI_MODES.MENU;
  return UI_MODES.GAMEPLAY;
}
