export function advanceTime(update, render, step, ms) {
  const steps = Math.max(1, Math.round(ms / (1000 / 60)));
  for (let i = 0; i < steps; i += 1) {
    update(step);
  }
  render();
}

export function registerTestBridge(globalScope, contract) {
  const { renderGameToText, advanceTimeMs } = contract;
  globalScope.render_game_to_text = renderGameToText;
  globalScope.advanceTime = advanceTimeMs;
}
