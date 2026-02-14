function canUseButton(button) {
  return Boolean(button && typeof button.addEventListener === "function");
}

export function createMainMenuController({
  menuEntries,
  menuPanelTitle,
  menuPanelText,
  controlsPanel,
  bannerBtn,
  collectionBtn,
  onOpenBanner,
  onOpenCollection,
}) {
  const state = {
    selectedIndex: 0,
  };

  function visibleMenuEntries() {
    return menuEntries.filter((entry) => !entry.hidden || !entry.hidden());
  }

  function setMenuPanel(title, text) {
    if (menuPanelTitle) menuPanelTitle.textContent = title;
    if (menuPanelText) menuPanelText.textContent = text;
  }

  function updateFocus() {
    const visible = visibleMenuEntries();
    if (!visible.length) return;

    if (state.selectedIndex >= visible.length) {
      state.selectedIndex = 0;
    }

    for (const entry of menuEntries) {
      const button = entry.button;
      if (!button) continue;
      button.classList?.remove("is-focused");
      button.tabIndex = -1;
    }

    const selected = visible[state.selectedIndex];
    if (!selected?.button) return;
    selected.button.classList?.add("is-focused");
    selected.button.tabIndex = 0;
    setMenuPanel(selected.title, selected.text);
  }

  function moveSelection(direction) {
    const visible = visibleMenuEntries();
    if (!visible.length) return;
    state.selectedIndex = (state.selectedIndex + direction + visible.length) % visible.length;
    updateFocus();
  }

  function runSelectedAction() {
    const visible = visibleMenuEntries();
    const selected = visible[state.selectedIndex];
    if (selected && typeof selected.action === "function") {
      selected.action();
    }
  }

  function showControlsPanel(title, text) {
    if (controlsPanel) controlsPanel.hidden = false;
    setMenuPanel(title, text);
  }

  function showLorePanel(title, text) {
    if (controlsPanel) controlsPanel.hidden = true;
    setMenuPanel(title, text);
  }

  function setupInteractions() {
    for (const entry of menuEntries) {
      const button = entry.button;
      if (!canUseButton(button)) continue;
      button.addEventListener("mouseenter", () => {
        const visible = visibleMenuEntries();
        const visibleIndex = visible.findIndex((item) => item.id === entry.id);
        if (visibleIndex >= 0) {
          state.selectedIndex = visibleIndex;
          updateFocus();
        }
      });
      button.addEventListener("focus", () => {
        const visible = visibleMenuEntries();
        const visibleIndex = visible.findIndex((item) => item.id === entry.id);
        if (visibleIndex >= 0) {
          state.selectedIndex = visibleIndex;
          updateFocus();
        }
      });
      button.addEventListener("click", entry.action);
    }

    if (canUseButton(bannerBtn) && typeof onOpenBanner === "function") {
      bannerBtn.addEventListener("click", onOpenBanner);
    }
    if (canUseButton(collectionBtn) && typeof onOpenCollection === "function") {
      collectionBtn.addEventListener("click", onOpenCollection);
    }
  }

  return {
    moveSelection,
    runSelectedAction,
    showControlsPanel,
    showLorePanel,
    refreshFocus: updateFocus,
    setupInteractions,
  };
}
