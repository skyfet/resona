function fallbackPickByWeight(pool, randomValue) {
  if (!Array.isArray(pool) || pool.length === 0) return null;
  const totalWeight = pool.reduce((sum, entry) => sum + Math.max(0, Number(entry?.weight) || 0), 0);
  if (totalWeight <= 0) return pool[0];

  let roll = randomValue() * totalWeight;
  for (const entry of pool) {
    roll -= Math.max(0, Number(entry?.weight) || 0);
    if (roll <= 0) return entry;
  }
  return pool[pool.length - 1];
}

export function getActiveBanner(gacha) {
  return gacha.config.banners.find((banner) => banner.banner_id === gacha.activeBannerId) || null;
}

export function getWeaponDefinition(gacha, id) {
  return gacha.config.weapons.find((item) => item.id === id) || null;
}

export function getCharacterDefinition(gacha, id) {
  return gacha.config.characters.find((item) => item.id === id) || null;
}

function makeGachaResult(category, itemId, itemName, now) {
  return {
    category,
    itemId,
    itemName,
    timestamp: now(),
  };
}

function pushGachaHistory(gacha, result) {
  gacha.lastResults.unshift(result);
  gacha.lastResults = gacha.lastResults.slice(0, 10);
}

function applyGachaReward(gacha, result, setHint) {
  if (result.category === "character") {
    const hasCharacter = gacha.collection.characters.includes(result.itemId);
    if (hasCharacter) {
      gacha.wishTokens += 1;
      setHint(`Дубликат персонажа: ${result.itemName}. Компенсация +1 WishToken.`, 2.8);
      return;
    }
    gacha.collection.characters.push(result.itemId);
    if (result.itemId === "char_liora") {
      setHint("Получена Травница Лиора. Нажмите T, чтобы выбрать её лидером.", 3);
    } else {
      setHint(`Получен персонаж: ${result.itemName}.`, 2.6);
    }
    return;
  }

  gacha.collection.weapons[result.itemId] = (gacha.collection.weapons[result.itemId] || 0) + 1;
  setHint(`Получено оружие: ${result.itemName}.`, 2.4);
}

function rollFromBanner({ gacha, banner, randomValue, pickByWeight, now }) {
  const picker = typeof pickByWeight === "function" ? pickByWeight : (pool) => fallbackPickByWeight(pool, randomValue);
  const isCharacter = randomValue() < banner.character_chance;

  if (isCharacter) {
    const picked = picker(banner.character_pool);
    if (!picked) return null;
    const def = getCharacterDefinition(gacha, picked.id);
    return makeGachaResult("character", picked.id, def ? def.name : picked.id, now);
  }

  const picked = picker(banner.weapon_pool);
  if (!picked) return null;
  const def = getWeaponDefinition(gacha, picked.id);
  return makeGachaResult("weapon", picked.id, def ? def.name : picked.id, now);
}

export function runGachaSpins({
  gacha,
  spins,
  setHint,
  pickByWeight,
  randomValue = Math.random,
  now = Date.now,
}) {
  const banner = getActiveBanner(gacha);
  if (!banner) {
    setHint("Конфиг баннера не загружен.", 2.2);
    return false;
  }

  let completed = 0;
  let failedByPool = false;
  for (let i = 0; i < spins; i += 1) {
    if (gacha.wishTokens < banner.cost_amount) break;
    gacha.wishTokens -= banner.cost_amount;

    const result = rollFromBanner({
      gacha,
      banner,
      randomValue,
      pickByWeight,
      now,
    });
    if (!result) {
      failedByPool = true;
      gacha.wishTokens += banner.cost_amount;
      break;
    }

    applyGachaReward(gacha, result, setHint);
    pushGachaHistory(gacha, result);
    gacha.lastPull = result;
    gacha.spins += 1;
    completed += 1;
  }

  if (completed === 0) {
    if (failedByPool) {
      setHint("Баннер настроен некорректно: не удалось выбрать награду.", 2.4);
    } else {
      setHint("Недостаточно WishToken для крутки.", 2);
    }
    return false;
  }
  return true;
}
