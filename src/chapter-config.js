export const CHAPTER_NAMES = {
  0: "Единая долина • Дом",
  1: "Единая долина • Поселение",
  2: "Единая долина • Лесная тропа",
  3: "Единая долина • Логово волка",
  4: "Единая долина • Чаща травницы",
  5: "Единая долина • Озёрный край",
  6: "Единая долина • Старый мост",
  7: "Единая долина • Площадь Снупа",
  8: "Единая долина • Налёт летучих мышей",
  9: "Единая долина • Источник",
};

export const CHAPTER_MAP_NODES = {
  0: { name: "Дом", x: 40, y: 112, status: "safe" },
  1: { name: "Деревня", x: 70, y: 92, status: "safe" },
  2: { name: "Тропа", x: 102, y: 78, status: "travel" },
  3: { name: "Волк", x: 132, y: 86, status: "danger" },
  4: { name: "Чаща", x: 162, y: 98, status: "danger" },
  5: { name: "Озёра", x: 194, y: 88, status: "danger" },
  6: { name: "Мост", x: 222, y: 76, status: "travel" },
  7: { name: "Аллея", x: 252, y: 88, status: "quest" },
  8: { name: "Оборона", x: 280, y: 98, status: "danger" },
  9: { name: "Штаб", x: 294, y: 116, status: "quest" },
};

export const WORLD_ROUTE = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const CHAPTER_SAVEPOINTS = {
  1: [{ id: "village_well", chapter: 1, x: 170, y: 96, radius: 14, activated: false }],
  2: [{ id: "trail_crystal", chapter: 2, x: 148, y: 96, radius: 14, activated: false }],
  3: [{ id: "wolf_watch", chapter: 3, x: 62, y: 96, radius: 14, activated: false }],
  4: [{ id: "deep_circle", chapter: 4, x: 108, y: 104, radius: 14, activated: false }],
  5: [{ id: "lake_stone", chapter: 5, x: 38, y: 94, radius: 14, activated: false }],
  6: [{ id: "bridge_gate", chapter: 6, x: 30, y: 94, radius: 14, activated: false }],
  7: [{ id: "mush_ring", chapter: 7, x: 78, y: 102, radius: 14, activated: false }],
  8: [{ id: "source_plaza", chapter: 8, x: 86, y: 102, radius: 14, activated: false }],
};

export function getChapterSavePoints(chapter) {
  const points = CHAPTER_SAVEPOINTS[chapter] || [];
  return points.map((point) => ({ ...point }));
}
