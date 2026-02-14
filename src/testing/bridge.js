(function bridgeModule(rootFactory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = rootFactory();
    return;
  }

  const api = rootFactory();
  if (typeof window !== "undefined") {
    window.attachTestBridge = api.attachTestBridge;
  }
})(function buildBridgeApi() {
  function toPayload(state, chapterNames, round) {
    const visibleCollectibles = state.collectibles
      .filter((item) => !item.collected)
      .map((item) => ({ type: item.type, name: item.name, x: round(item.x), y: round(item.y) }));

    const activeBreakables = state.breakables
      .filter((item) => item.chapter === state.chapter)
      .map((item) => ({
        id: item.id,
        name: item.name,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
        broken: item.broken,
      }));

    const obstacles = state.obstacles.map((item) => ({
      id: item.id,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
    }));

    const savePoints = state.savePoints.map((point) => ({
      id: point.id,
      x: round(point.x),
      y: round(point.y),
      activated: Boolean(point.activated),
    }));

    const enemies = [];
    if (state.wolf && state.wolf.alive) {
      enemies.push({
        type: "old_forest_wolf",
        x: round(state.wolf.x),
        y: round(state.wolf.y),
        hp: state.wolf.hp,
      });
    }

    for (const enemy of state.enemies) {
      if (!enemy.alive) continue;
      enemies.push({
        type: enemy.kind,
        x: round(enemy.x),
        y: round(enemy.y),
        hp: round(enemy.hp),
        dot_timer: round(enemy.dotTimer || 0),
      });
    }

    const drops = state.drops.map((drop) => ({
      type: drop.type,
      x: round(drop.x),
      y: round(drop.y),
    }));

    return {
      coordinate_system: "origin top-left; x increases right; y increases down; world units are canvas pixels on 320x180",
      mode: state.mode,
      chapter: state.chapter,
      chapter_name: chapterNames[state.chapter] || "Эпилог",
      objective: state.objective,
      story_line: state.storyLine,
      player: {
        x: round(state.player.x),
        y: round(state.player.y),
        vx: round(state.player.vx),
        vy: round(state.player.vy),
        hp: state.player.hp,
        max_hp: state.player.maxHp,
        mana: round(state.player.mana),
        max_mana: state.player.maxMana,
        level: state.player.level,
        invulnerable: state.player.invuln > 0,
        cooldowns: {
          dodge: round(state.player.dodgeCooldown),
          basic: round(state.player.basicCooldown),
          wind_gust: round(state.player.windCooldown),
          leaf_fall: round(state.player.leafCooldown),
          bridge_sprint: round(state.player.bridgeSprint),
        },
      },
      progress: {
        grandma_talked: state.flags.grandmaTalked,
        village_passed: state.chapter >= 2,
        gathered_resources: `${state.gathered}/${state.gatherGoal}`,
        wolf_defeated: state.flags.wolfDefeated,
        leaf_fall_unlocked: state.flags.leafFallUnlocked,
        healer_found: state.flags.healerFound,
        healer_rescued: state.flags.rescuedHealer,
        lake_quest_done: state.flags.lakeQuestDone,
        bridge_passed: state.flags.bridgePassed,
        organizer_talked: state.flags.organizerTalked,
        registration_complete: state.flags.registrationComplete,
        bats_defeated: state.flags.batsDefeated,
        skill_choice_made: state.flags.skillChoiceMade,
        recipe_read: state.recipeBook.learnedHealingPotion,
      },
      skills: {
        wind_gust: state.skills.windGust,
        leaf_fall: state.skills.leafFall,
        direct_burst: state.skills.directBurst,
        poison_bloom: state.skills.poisonBloom,
      },
      inventory: {
        mint: state.inventory.mint,
        glass_stone: state.inventory.glassStone,
        wet_frog: state.inventory.wetFrog,
        firefly: state.inventory.firefly,
        dense_reed: state.inventory.denseReed,
        flax_seed: state.inventory.flaxSeed,
        fish_oil: state.inventory.fishOil,
        magic_fang: state.inventory.magicFang,
        healing_potion: state.inventory.healingPotion,
        healing_recipe_scroll: state.inventory.healingRecipeScroll,
      },
      recipe_book: {
        has_healing_recipe: state.recipeBook.hasHealingRecipe,
        learned_healing_potion: state.recipeBook.learnedHealingPotion,
        open: state.recipeBook.open,
      },
      enemies,
      drops,
      lakes: state.lakes.map((lake) => ({ x: round(lake.x), y: round(lake.y), r: round(lake.r) })),
      collectibles: visibleCollectibles,
      static_obstacles: obstacles,
      breakable_obstacles: activeBreakables,
      save_points: savePoints,
      checkpoint: {
        id: state.checkpointMeta.id,
        chapter: state.checkpointMeta.chapter,
        saved_at: state.checkpointMeta.savedAt || null,
      },
      quests: {
        fish_oil: `${state.lakeQuest.fishOilCollected}/${state.lakeQuest.fishOilGoal}`,
        bridge_elapsed: round(state.bridgeChallenge.elapsed),
      },
      registration: {
        active: state.registration.active,
        index: state.registration.index,
        score: state.registration.score,
      },
      skill_choice: {
        active: state.skillChoice.active,
        selected: state.skillChoice.selected,
      },
      gacha: {
        wish_tokens: state.gacha.wishTokens,
        spins: state.gacha.spins,
        last_pull: state.gacha.lastPull,
        history: state.gacha.lastResults,
        collection: state.gacha.collection,
        active_banner_id: state.gacha.activeBannerId,
        menu_open: state.ui.menuOpen,
        banner_open: state.ui.gachaOpen,
        character_menu_open: state.ui.characterMenuOpen,
        world_map_open: state.ui.worldMapOpen,
      },
      party: {
        leader: state.party.leader,
        members: state.party.members,
      },
      combat_mods: {
        bonus_damage: state.combatMods.bonusDamage,
        dot_damage: state.combatMods.dotDamage,
        damage_reduction: state.combatMods.damageReduction,
        ally_regen: state.combatMods.allyRegen,
      },
      healer:
        state.chapter === 4
          ? {
              x: round(state.healer.x),
              y: round(state.healer.y),
              rescued: state.flags.rescuedHealer,
            }
          : null,
      source_npcs:
        state.chapter >= 7
          ? {
              organizer: { x: round(state.organizer.x), y: round(state.organizer.y) },
              registrar: { x: round(state.registrar.x), y: round(state.registrar.y) },
            }
          : null,
      dialogue: state.dialogue ? state.dialogue.lines[state.dialogue.index] : null,
    };
  }

  function attachTestBridge(targetWindow, gameApi) {
    const renderGameToText = () => {
      const state = gameApi.getState();
      const payload = toPayload(state, gameApi.chapterNames, gameApi.round);
      return JSON.stringify(payload);
    };

    const advanceTime = (ms) => {
      gameApi.setManualStepping(true);
      const steps = Math.max(1, Math.round(ms / (1000 / 60)));
      for (let i = 0; i < steps; i += 1) {
        gameApi.update(gameApi.step);
      }
      gameApi.render();
    };

    targetWindow.render_game_to_text = renderGameToText;
    targetWindow.advanceTime = advanceTime;

    return { renderGameToText, advanceTime };
  }

  return { attachTestBridge };
});
