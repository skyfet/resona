import test from "node:test";
import assert from "node:assert/strict";
import { createMainMenuController } from "../src/ui/main-menu-controller.js";

function createFakeButton() {
  const handlers = new Map();
  return {
    tabIndex: -1,
    classList: {
      set: new Set(),
      add(name) {
        this.set.add(name);
      },
      remove(name) {
        this.set.delete(name);
      },
    },
    addEventListener(event, callback) {
      handlers.set(event, callback);
    },
    dispatch(event) {
      const callback = handlers.get(event);
      if (callback) callback();
    },
  };
}

test("main menu controller moves selection and runs selected action", () => {
  const startButton = createFakeButton();
  const helpButton = createFakeButton();
  const titleNode = { textContent: "" };
  const textNode = { textContent: "" };

  const calls = [];
  const controller = createMainMenuController({
    menuEntries: [
      { id: "start", button: startButton, title: "Start", text: "Start text", action: () => calls.push("start") },
      { id: "help", button: helpButton, title: "Help", text: "Help text", action: () => calls.push("help") },
    ],
    menuPanelTitle: titleNode,
    menuPanelText: textNode,
  });

  controller.setupInteractions();
  controller.refreshFocus();
  assert.equal(titleNode.textContent, "Start");

  controller.moveSelection(1);
  assert.equal(titleNode.textContent, "Help");
  controller.runSelectedAction();
  assert.deepEqual(calls, ["help"]);
});

test("main menu controller wires banner and collection callbacks", () => {
  const bannerButton = createFakeButton();
  const collectionButton = createFakeButton();
  const events = [];

  const controller = createMainMenuController({
    menuEntries: [],
    menuPanelTitle: { textContent: "" },
    menuPanelText: { textContent: "" },
    bannerBtn: bannerButton,
    collectionBtn: collectionButton,
    onOpenBanner: () => events.push("banner"),
    onOpenCollection: () => events.push("collection"),
  });

  controller.setupInteractions();
  bannerButton.dispatch("click");
  collectionButton.dispatch("click");
  assert.deepEqual(events, ["banner", "collection"]);
});

test("main menu controller toggles help/lore panels", () => {
  const controlsPanel = { hidden: true };
  const titleNode = { textContent: "" };
  const textNode = { textContent: "" };
  const controller = createMainMenuController({
    menuEntries: [],
    menuPanelTitle: titleNode,
    menuPanelText: textNode,
    controlsPanel,
  });

  controller.showControlsPanel("Help", "How to play");
  assert.equal(controlsPanel.hidden, false);
  assert.equal(titleNode.textContent, "Help");

  controller.showLorePanel("Lore", "World story");
  assert.equal(controlsPanel.hidden, true);
  assert.equal(titleNode.textContent, "Lore");
});
