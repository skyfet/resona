# Testing bridge JSON contract

`window.render_game_to_text()` returns a JSON string with the payload below.

## Root payload

- `coordinate_system: string`
- `mode: "menu" | "playing" | "dialogue" | string`
- `chapter: number`
- `chapter_name: string`
- `objective: string`
- `story_line: string`
- `player: PlayerPayload`
- `progress: ProgressPayload`
- `skills: SkillsPayload`
- `inventory: InventoryPayload`
- `recipe_book: RecipeBookPayload`
- `enemies: EnemyPayload[]`
- `drops: DropPayload[]`
- `lakes: LakePayload[]`
- `collectibles: CollectiblePayload[]`
- `static_obstacles: ObstaclePayload[]`
- `breakable_obstacles: BreakableObstaclePayload[]`
- `save_points: SavePointPayload[]`
- `checkpoint: CheckpointPayload`
- `quests: QuestsPayload`
- `registration: RegistrationPayload`
- `skill_choice: SkillChoicePayload`
- `gacha: GachaPayload`
- `party: PartyPayload`
- `combat_mods: CombatModsPayload`
- `healer: HealerPayload | null`
- `source_npcs: SourceNpcsPayload | null`
- `dialogue: string | null`

## Nested payloads

### `player`
- `x, y, vx, vy: number`
- `hp, max_hp, level: number`
- `mana, max_mana: number`
- `invulnerable: boolean`
- `cooldowns: { dodge, basic, wind_gust, leaf_fall, bridge_sprint: number }`

### `progress`
- `grandma_talked, village_passed, wolf_defeated, leaf_fall_unlocked, healer_found, healer_rescued, lake_quest_done, bridge_passed, organizer_talked, registration_complete, bats_defeated, skill_choice_made, recipe_read: boolean`
- `gathered_resources: string` (format `current/goal`)

### `skills`
- `wind_gust, leaf_fall, direct_burst, poison_bloom: boolean`

### `inventory`
- `mint, glass_stone, wet_frog, firefly, dense_reed, flax_seed, fish_oil, magic_fang, healing_potion, healing_recipe_scroll: number`

### `recipe_book`
- `has_healing_recipe, learned_healing_potion, open: boolean`

### `EnemyPayload`
- `type: string`
- `x, y, hp: number`
- `dot_timer?: number`

### `DropPayload`
- `type: string`
- `x, y: number`

### `LakePayload`
- `x, y, r: number`

### `CollectiblePayload`
- `type, name: string`
- `x, y: number`

### `ObstaclePayload`
- `id: string`
- `x, y, w, h: number`

### `BreakableObstaclePayload`
- `id, name: string`
- `x, y, w, h: number`
- `broken: boolean`

### `SavePointPayload`
- `id: string`
- `x, y: number`
- `activated: boolean`

### `CheckpointPayload`
- `id: string`
- `chapter: number`
- `saved_at: string | null`

### `QuestsPayload`
- `fish_oil: string` (format `current/goal`)
- `bridge_elapsed: number`

### `RegistrationPayload`
- `active: boolean`
- `index, score: number`

### `SkillChoicePayload`
- `active: boolean`
- `selected: string | null`

### `GachaPayload`
- `wish_tokens, spins: number`
- `last_pull: string | null`
- `history: string[]`
- `collection: Record<string, number>`
- `active_banner_id: string | null`
- `menu_open, banner_open, character_menu_open, world_map_open: boolean`

### `PartyPayload`
- `leader: string`
- `members: string[]`

### `CombatModsPayload`
- `bonus_damage, dot_damage, damage_reduction, ally_regen: number`

### `HealerPayload`
- `x, y: number`
- `rescued: boolean`

### `SourceNpcsPayload`
- `organizer: { x, y: number }`
- `registrar: { x, y: number }`

## Time control

`window.advanceTime(ms: number)` advances simulation in fixed 60 FPS steps and forces one render call.
