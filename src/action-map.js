export const ACTIONS = {
  TOGGLE_MENU: "toggle_menu",
  TOGGLE_CHARACTER: "toggle_character",
  TOGGLE_INVENTORY: "toggle_inventory",
  TOGGLE_WORLD_MAP: "toggle_world_map",
  TOGGLE_COLLECTION: "toggle_collection",
  TOGGLE_GACHA: "toggle_gacha",
  CLOSE_OR_BACK: "close_or_back",
  MAP_LEFT: "map_left",
  MAP_RIGHT: "map_right",
  MAP_CONFIRM: "map_confirm",
  MENU_TAB_1: "menu_tab_1",
  MENU_TAB_2: "menu_tab_2",
  MENU_TAB_3: "menu_tab_3",
  MENU_LEFT: "menu_left",
  MENU_RIGHT: "menu_right",
  MENU_CONFIRM: "menu_confirm",
};

const ACTION_MAP = [
  [ACTIONS.TOGGLE_MENU, ["KeyM"]],
  [ACTIONS.TOGGLE_CHARACTER, ["KeyP"]],
  [ACTIONS.TOGGLE_INVENTORY, ["KeyI"]],
  [ACTIONS.TOGGLE_WORLD_MAP, ["Tab"]],
  [ACTIONS.TOGGLE_COLLECTION, ["KeyC"]],
  [ACTIONS.TOGGLE_GACHA, ["KeyG"]],
  [ACTIONS.CLOSE_OR_BACK, ["Escape"]],
  [ACTIONS.MAP_LEFT, ["ArrowLeft", "KeyA"]],
  [ACTIONS.MAP_RIGHT, ["ArrowRight", "KeyD"]],
  [ACTIONS.MAP_CONFIRM, ["Enter", "KeyE"]],
  [ACTIONS.MENU_TAB_1, ["Digit1"]],
  [ACTIONS.MENU_TAB_2, ["Digit2"]],
  [ACTIONS.MENU_TAB_3, ["Digit3"]],
  [ACTIONS.MENU_LEFT, ["ArrowLeft", "KeyA"]],
  [ACTIONS.MENU_RIGHT, ["ArrowRight", "KeyD"]],
  [ACTIONS.MENU_CONFIRM, ["Enter", "KeyE"]],
];

export function consumeAction(consumeKey, action) {
  const match = ACTION_MAP.find(([name]) => name === action);
  if (!match) return false;
  return consumeKey(match[1]);
}

export function getModePriority(state) {
  if (state.dialogue) return "dialogue";
  if (state.registration.active) return "registration";
  if (state.skillChoice.active) return "skill_choice";
  if (state.ui.mode && state.ui.mode !== "gameplay") return state.ui.mode;
  return "gameplay";
}
