(function initInput(global) {
  const map = global.ResonaInputMap || {};
  const ACTION_KEYS = map.ACTION_KEYS || {};

  let keysPressedRef = null;

  function bindInputState({ keysPressed }) {
    keysPressedRef = keysPressed;
  }

  function actionKeys(action) {
    return ACTION_KEYS[action] || [];
  }

  function isActionPressed(action) {
    if (!keysPressedRef) return false;
    const codes = actionKeys(action);
    return codes.some((code) => keysPressedRef.has(code));
  }

  function consumeAction(action) {
    if (!keysPressedRef) return false;
    const codes = actionKeys(action);
    for (const code of codes) {
      if (keysPressedRef.has(code)) {
        keysPressedRef.delete(code);
        return true;
      }
    }
    return false;
  }

  global.ResonaInput = { bindInputState, isActionPressed, consumeAction };
})(window);
