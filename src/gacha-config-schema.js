function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeText(value, fallback) {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function normalizeRate(value, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(1, Math.max(0, number));
}

function normalizeCost(value, fallback = 1) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(1, Math.floor(number));
}

function normalizeWeight(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, number);
}

function normalizeEntries(list, fallbackPrefix) {
  if (!Array.isArray(list)) return [];
  const deduped = [];
  const seen = new Set();

  for (const item of list) {
    if (!isPlainObject(item)) continue;
    const id = normalizeText(item.id, "");
    if (!id || seen.has(id)) continue;
    seen.add(id);
    deduped.push({
      id,
      name: normalizeText(item.name, `${fallbackPrefix} ${deduped.length + 1}`),
      icon_path: normalizeText(item.icon_path, `placeholder://${id}`),
    });
  }
  return deduped;
}

function normalizePool(pool, validIds) {
  if (!Array.isArray(pool)) return [];
  const normalized = [];
  const seen = new Set();
  for (const entry of pool) {
    if (!isPlainObject(entry)) continue;
    const id = normalizeText(entry.id, "");
    if (!id || seen.has(id) || !validIds.has(id)) continue;
    const weight = normalizeWeight(entry.weight);
    if (weight <= 0) continue;
    seen.add(id);
    normalized.push({ id, weight });
  }
  return normalized;
}

export function normalizeGachaConfig(rawConfig) {
  const issues = [];
  const source = isPlainObject(rawConfig) ? rawConfig : {};

  const currencies = normalizeEntries(source.currencies, "Currency");
  const currencyIds = new Set(currencies.map((item) => item.id));
  if (currencies.length === 0) {
    currencies.push({
      id: "wish_token",
      name: "WishToken",
      icon_path: "placeholder://wish-token",
    });
    currencyIds.add("wish_token");
    issues.push("currencies_missing");
  }

  const weapons = normalizeEntries(source.weapons, "Weapon");
  const characters = normalizeEntries(source.characters, "Character");
  const weaponIds = new Set(weapons.map((item) => item.id));
  const characterIds = new Set(characters.map((item) => item.id));

  const banners = [];
  const seenBannerIds = new Set();
  const sourceBanners = Array.isArray(source.banners) ? source.banners : [];
  for (const banner of sourceBanners) {
    if (!isPlainObject(banner)) continue;
    const bannerId = normalizeText(banner.banner_id, "");
    if (!bannerId || seenBannerIds.has(bannerId)) continue;

    const costCurrencyId = normalizeText(banner.cost_currency_id, "wish_token");
    const weaponPool = normalizePool(banner.weapon_pool, weaponIds);
    const characterPool = normalizePool(banner.character_pool, characterIds);
    if (weaponPool.length === 0 && characterPool.length === 0) {
      issues.push(`banner_empty_pool:${bannerId}`);
      continue;
    }

    seenBannerIds.add(bannerId);
    banners.push({
      banner_id: bannerId,
      title: normalizeText(banner.title, `Баннер ${bannerId}`),
      description: normalizeText(banner.description, "Описание недоступно."),
      art_path: normalizeText(banner.art_path, `placeholder://${bannerId}`),
      cost_currency_id: currencyIds.has(costCurrencyId) ? costCurrencyId : currencies[0].id,
      cost_amount: normalizeCost(banner.cost_amount, 1),
      character_chance: normalizeRate(banner.character_chance, 0.1),
      weapon_pool: weaponPool,
      character_pool: characterPool,
    });
  }

  if (banners.length === 0) {
    issues.push("banners_missing_or_invalid");
  }

  return {
    config: {
      currencies,
      weapons,
      characters,
      banners,
    },
    issues,
    isUsable: banners.length > 0,
  };
}
