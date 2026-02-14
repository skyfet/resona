export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function roundToTenth(value) {
  return Math.round(value * 10) / 10;
}

export function formatStatValue(value) {
  const rounded = roundToTenth(value);
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

export function randomInt(min, max) {
  return Math.floor(randomRange(min, max + 1));
}

export function distance(aX, aY, bX, bY) {
  return Math.hypot(aX - bX, aY - bY);
}

export function seededRandom(seed) {
  const value = Math.sin(seed * 999.91) * 43758.5453;
  return value - Math.floor(value);
}

export function deepCopyJson(data) {
  return JSON.parse(JSON.stringify(data));
}

export function withLocalStorage(callback, storageRef = null) {
  try {
    const storage = storageRef || globalThis.localStorage;
    return callback(storage);
  } catch {
    return null;
  }
}
