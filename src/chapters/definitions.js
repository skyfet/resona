(function () {
  const definitions = [
    {
      id: 0,
      name: "Единая долина • Дом",
      nextChapter: 1,
      prevChapter: null,
      setup(state) {
        state.worldBounds = { x: 24, y: 34, w: 272, h: 134 };
        state.player.x = 64;
        state.player.y = 124;
        state.collectibles = [];
        state.obstacles = [];
        state.breakables = [];
        state.lakes = [];
        state.enemies = [];
        state.drops = [];
        state.wolf = null;
        state.savePoints = [];
        setObjective("Поговорите с бабушкой Нурсой (E). ");
        setHint("Подойдите к Нурсе у очага.", 3);
        setStoryLine("Листи весь день чувствует нестабильность энергии источника и не может найти себе места.");
      },
      onUpdate(state, dt) {},
    },
    {
      id: 1,
      name: "Единая долина • Поселение",
      nextChapter: 2,
      prevChapter: null,
      setup(state) {
        state.worldBounds = { x: 8, y: 18, w: 304, h: 154 };
        state.player.x = 24;
        state.player.y = 98;
        state.collectibles = [];
        state.obstacles = [
          { id: "village_cart", x: 118, y: 62, w: 16, h: 12, colorDark: "#5c3f29", colorLight: "#7a5335" },
          { id: "village_barrel", x: 206, y: 108, w: 12, h: 12, colorDark: "#5c3f29", colorLight: "#7a5335" },
        ];
        state.breakables = [];
        state.lakes = [];
        state.enemies = [];
        state.drops = [];
        state.wolf = null;
        state.savePoints = [{ id: "village_well", chapter: 1, x: 170, y: 96, radius: 14, activated: false }];
        setupAmbientSpawner(false);
        setObjective("Пройдите через маленькую деревню и выйдите на тропу.");
        setHint("Двигайтесь вправо по дороге.", 2.6);
        setStoryLine("Листи выбежала из дома и прошла через сонную деревню, прислушиваясь к дрожи в воздухе.");
      },
      onUpdate(state, dt) {
        if (state.player.x > 306) {
          tryTransition("next");
        }
      },
    },
    {
      id: 2,
      name: "Единая долина • Лесная тропа",
      nextChapter: 3,
      prevChapter: 1,
      setup(state) {
        state.worldBounds = { x: 8, y: 16, w: 304, h: 158 };
        state.player.x = 24;
        state.player.y = 96;
        state.collectibles = trailCollectibles();
        state.obstacles = [
          { id: "trail_stone_1", x: 106, y: 56, w: 14, h: 10, colorDark: "#434d58", colorLight: "#687382" },
          { id: "trail_stone_2", x: 198, y: 120, w: 14, h: 10, colorDark: "#434d58", colorLight: "#687382" },
        ];
        state.breakables = [];
        state.lakes = [];
        state.enemies = [];
        state.drops = [];
        state.wolf = null;
        state.savePoints = [{ id: "trail_crystal", chapter: 2, x: 148, y: 96, radius: 14, activated: false }];
        setupAmbientSpawner(false);
        setObjective(`Соберите ресурсы на тропе (${state.gathered}/${state.gatherGoal}).`);
        setHint("Ищите мяту, стеклянные камни и влажных лягушек.", 3);
        setStoryLine("На тропе блестят стеклянные камни и шуршит мята.");
      },
      onUpdate(state, dt) {
        collectNearbyResources();
        if (state.player.x < 10 && !tryTransition("prev")) return;
        if (state.player.x > 306) {
          if (state.gathered < state.gatherGoal) {
            setHint(`Вы можете идти дальше, но для квеста нужно собрать ещё ${state.gatherGoal - state.gathered}.`, 2.1);
          }
          tryTransition("next");
        }
      },
    },
    {
      id: 3,
      name: "Единая долина • Логово волка",
      nextChapter: 4,
      prevChapter: 2,
      setup(state) {
        state.worldBounds = { x: 8, y: 16, w: 304, h: 158 };
        state.player.x = 34;
        state.player.y = 96;
        state.obstacles = [];
        state.lakes = [];
        state.enemies = [];
        state.drops = [];
        state.wolf = {
          x: 246,
          y: 96,
          hp: 84,
          maxHp: 84,
          speed: 24,
          attackCooldown: 0,
          hitFlash: 0,
          alive: true,
        };
        state.collectibles = [];
        state.breakables = wolfPassBreakables();
        state.savePoints = [{ id: "wolf_watch", chapter: 3, x: 62, y: 96, radius: 14, activated: false }];
        setupAmbientSpawner(false);
        setObjective("Победите волка: J/B - удар, K/A - «Порыв ветра», Space - уворот.");
        setHint("Магия тратит ману. Следите за флаконом справа.", 3.2);
        setStoryLine("Старый волк с большими лапами преградил путь и рычанием заглушил ветер в кронах.");
      },
      onUpdate(state, dt) {
        updateWolf(dt);
        if (state.player.x < 10 && !tryTransition("prev")) return;
        if (state.player.x > 306) {
          if (!state.flags.wolfDefeated || !isBreakableBroken("wolf_barrier")) {
            setHint("Босс и завал ещё активны, но в открытом мире проход в чащу не блокируется.", 2.2);
          }
          tryTransition("next");
        }
      },
    },
    {
      id: 4,
      name: "Единая долина • Чаща травницы",
      nextChapter: 5,
      prevChapter: 3,
      setup(state) {
        state.worldBounds = { x: 8, y: 16, w: 304, h: 158 };
        state.player.x = 24;
        state.player.y = 104;
        state.wolf = null;
        state.lakes = [];
        state.enemies = [];
        state.drops = [];
        state.collectibles = deepForestCollectibles();
        state.obstacles = [
          { id: "deep_stump", x: 94, y: 72, w: 20, h: 14, colorDark: "#4e3525", colorLight: "#6d4a31" },
          { id: "deep_rock", x: 168, y: 132, w: 18, h: 12, colorDark: "#38404a", colorLight: "#596474" },
        ];
        state.breakables = deepForestBreakables();
        state.savePoints = [{ id: "deep_circle", chapter: 4, x: 108, y: 104, radius: 14, activated: false }];
        setupAmbientSpawner(false);
        setObjective("Осмотрите заваленное дерево рядом с одеждой (E). ");
        setHint("Найдите травницу в правой части леса.", 3);
        setStoryLine("В чаще лежит разорванная одежда, а под деревом слышен слабый голос, зовущий о помощи.");
      },
      onUpdate(state, dt) {
        collectNearbyResources();
        if (state.player.x < 10 && !tryTransition("prev")) return;
        if (state.player.x > 306) {
          if (!state.flags.rescuedHealer) {
            setHint("Травница ещё ждёт помощи в чаще, но карта остаётся свободной.", 2.2);
          }
          tryTransition("next");
        }
      },
    },
    {
      id: 5,
      name: "Единая долина • Озёрный край",
      nextChapter: 6,
      prevChapter: 4,
      setup(state) {
        state.worldBounds = { x: 8, y: 16, w: 304, h: 158 };
        state.player.x = 24;
        state.player.y = 94;
        state.wolf = null;
        state.lakes = lakeSpawnPoints();
        state.enemies = [];
        state.drops = [];
        state.collectibles = chapterFiveResources();
        state.obstacles = lakeObstacleLayout();
        state.breakables = [];
        state.savePoints = [{ id: "lake_stone", chapter: 5, x: 38, y: 94, radius: 14, activated: false }];
        state.lakeQuest.fishOilCollected = 0;
        setupAmbientSpawner(true);
        setObjective("У озёр победите монстров и соберите рыбий жир (0/3).");
        setHint("Новые ресурсы появляются с разной частотой: светлячки, камыш, семена льна.", 3.4);
        setStoryLine("Из озёр поднимаются твари, и каждая волна приносит новую угрозу. Рыбий жир пригодится для укрепления маны.");
      },
      onUpdate(state, dt) {
        collectNearbyResources();
        collectNearbyDrops();
        updateLakeMonsterSpawns(dt);
        updateEnemies(dt);

        if (state.player.hp <= 0) {
          if (tryRespawnFromCheckpoint()) {
            return;
          }
          state.player.hp = Math.round(state.player.maxHp * 0.6);
          state.player.mana = Math.round(state.player.maxMana * 0.55);
          state.player.x = 24;
          state.player.y = 94;
          setHint("Эльфийка отступила от озёр и восстановилась.", 2.2);
        }

        if (state.player.x < 10 && !tryTransition("prev")) return;
        if (state.player.x > 306) {
          if (!state.flags.lakeQuestDone) {
            setHint("Озёрный квест ещё не завершён, но путь по карте открыт.", 2.1);
          }
          tryTransition("next");
        }
      },
    },
    {
      id: 6,
      name: "Единая долина • Старый мост",
      nextChapter: 7,
      prevChapter: 5,
      setup(state) {
        state.worldBounds = { x: 8, y: 34, w: 304, h: 108 };
        state.player.x = 22;
        state.player.y = 94;
        state.wolf = null;
        state.lakes = [];
        state.enemies = [];
        state.drops = [];
        state.collectibles = [];
        state.obstacles = [];
        state.breakables = [];
        state.savePoints = [{ id: "bridge_gate", chapter: 6, x: 30, y: 94, radius: 14, activated: false }];
        state.bridgeChallenge.active = true;
        state.bridgeChallenge.elapsed = 0;
        state.bridgeChallenge.sprintCooldown = 0;
        state.bridgeChallenge.planks = buildBridgePlanks();
        setupAmbientSpawner(false);
        setObjective("Перейдите старый мост. Если упали — попытка начнётся заново.");
        setHint("Space даёт рывок. После провала мост перестраивается и даёт ещё шанс.", 3.2);
        setStoryLine("Старый мост трещит под шагами, но Листи замечает, что можно пробовать снова, пока не найдёшь ритм.");
      },
      onUpdate(state, dt) {
        updateBridgeChallenge(dt);
        if (state.player.x < 10 && !tryTransition("prev")) return;
        if (state.flags.bridgePassed && state.player.x > 306) {
          tryTransition("next");
        }
      },
    },
    {
      id: 7,
      name: "Единая долина • Площадь Снупа",
      nextChapter: 8,
      prevChapter: 6,
      setup(state) {
        state.worldBounds = { x: 8, y: 16, w: 304, h: 158 };
        state.player.x = 22;
        state.player.y = 104;
        state.wolf = null;
        state.lakes = [];
        state.enemies = [];
        state.drops = [];
        state.collectibles = chapterSevenResources();
        if (!state.flags.snoopGlassTaken) {
          state.collectibles.push({
            x: state.registrar.x - 10,
            y: state.registrar.y + 9,
            type: "table_glass",
            name: "Стеклянный камешек со стола Снупа",
            collected: false,
          });
        }
        state.obstacles = mushroomObstacleLayout();
        state.breakables = [];
        state.savePoints = [{ id: "mush_ring", chapter: 7, x: 78, y: 102, radius: 14, activated: false }];
        state.flags.organizerTalked = false;
        state.flags.registrationComplete = false;
        setupAmbientSpawner(true);
        setObjective("Поговорите с организатором Кэри (E).");
        setHint("Это грибная аллея: светящиеся грибы у магического источника.", 3.3);
        setStoryLine("У источника собирают отряд для расследования кражи силы: впереди сложный разговор и непростой выбор.");
      },
      onUpdate(state, dt) {
        collectNearbyResources();
        if (state.player.x < 10 && !tryTransition("prev")) return;
        if (state.player.x > 306) {
          if (!state.flags.registrationComplete) {
            setHint("Регистрация не завершена, но проход к источнику открыт.", 2.1);
          }
          tryTransition("next");
        }
      },
    },
    {
      id: 8,
      name: "Единая долина • Налёт летучих мышей",
      nextChapter: 9,
      prevChapter: 7,
      setup(state) {
        state.worldBounds = { x: 8, y: 16, w: 304, h: 158 };
        state.player.x = 74;
        state.player.y = 104;
        state.wolf = null;
        state.lakes = [];
        state.collectibles = chapterSevenResources();
        state.obstacles = mushroomObstacleLayout();
        state.breakables = [];
        state.drops = [];
        state.enemies = spawnBatSwarm();
        state.savePoints = [{ id: "source_plaza", chapter: 8, x: 86, y: 102, radius: 14, activated: false }];
        setupAmbientSpawner(true);
        setObjective("Отразите налёт летучих мышей.");
        setHint("После победы выберите новый навык (A или B).", 3.2);
        setStoryLine("Пока Листи записывали в отряд, стая летучих мышей вырвалась из тени и пошла в атаку.");
      },
      onUpdate(state, dt) {
        collectNearbyResources();
        updateEnemies(dt);
        if (state.player.hp <= 0) {
          if (tryRespawnFromCheckpoint()) {
            return;
          }
          state.player.hp = Math.round(state.player.maxHp * 0.6);
          state.player.mana = Math.round(state.player.maxMana * 0.55);
          state.player.x = 74;
          state.player.y = 104;
          setHint("Эльфийка перехватила дыхание и снова вступила в бой.", 2.2);
        }

        if (state.player.x < 10 && !tryTransition("prev")) return;
        if (state.player.x > 306) {
          if (!state.flags.skillChoiceMade) setHint("Навык не выбран, но вы можете вернуться к событию позже.", 2.1);
          tryTransition("next");
        }
      },
    },
    {
      id: 9,
      name: "Единая долина • Источник",
      nextChapter: null,
      prevChapter: 8,
      setup(state) {
        state.worldBounds = { x: 8, y: 16, w: 304, h: 158 };
        state.player.x = 150;
        state.player.y = 104;
        state.wolf = null;
        state.lakes = [];
        state.enemies = [];
        state.drops = [];
        state.collectibles = chapterSevenResources();
        state.obstacles = mushroomObstacleLayout();
        state.breakables = [];
        state.savePoints = [];
        setupAmbientSpawner(true);
        setObjective("Откройте меню (M) и используйте гачу-баннер (G, A, B).");
        setHint("Валюту дают уровни и задания. Крутка: стоимость 2.", 3.2);
        setStoryLine("Листи вступила в защиту источника и готовится к большому расследованию вместе с новым отрядом.");
      },
      onUpdate(state, dt) {
        collectNearbyResources();
        if (state.player.x < 10) {
          tryTransition("prev");
        }
      },
    },
  ];

  window.ChapterDefinitions = definitions;
})();
