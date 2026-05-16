// ============================================
// WORLD SCENE — Exploração do mundo
// ============================================

class WorldScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WorldScene' });
    }

    init() {
        this.playerData = null;
        this.achievementSystem = new AchievementSystem();
        this.playerSprite = null;
        this.npcSprites = {};
        this.mapTiles = [];
        this.hud = null;
        this.dialog = null;
        this.currentMap = null;
        this.isMoving = false;
        this.canMove = true;
        this.gridX = 0;
        this.gridY = 0;
        this.lastGrassTile = null;
        this.inputLocked = false;
        this.playerDirection = 'down';
    }

    preload() {
        Log.info("Iniciando preload...");

        ItemAssetLoader.loadAll(this);

        this.load.on('complete', () => {
            Log.ok("Preload concluído com sucesso!");
        });

        this.load.on('loaderror', (file) => {
            Log.error(`Erro ao carregar asset: ${file.key}`);
        });
    }

    create() {
        // FIX: captura as dimensões reais do canvas ANTES de aplicar zoom.
        // this.scale.width/height retorna o tamanho do elemento canvas no DOM,
        // que é o que queremos para posicionar UI. A câmera com zoom não afeta isso.
        const W = this.scale.width;
        const H = this.scale.height;

        // Carrega save
        this.loadGame();

        // Renderiza mapa
        this.renderMap(this.playerData.currentMap);

        // Cria player sprite
        this.createPlayer();

        // Cria NPCs
        this.createNPCs();

        // HUD — passa dimensões reais
        this.hud = new HUD(this, W, H);
        this.hud.create(this.playerData);

        // Dialog — passa dimensões reais
        this.dialog = new DialogBox(this, W, H);
        this.dialog.create();

        // Inputs
        this.setupInput();

        // Camera — zoom aplicado DEPOIS de criar a UI
        this.cameras.main.startFollow(this.playerSprite, true, 0.1, 0.1);
        this.cameras.main.setZoom(1.5);
        this.cameras.main.setBackgroundColor(this.currentMap.backgroundColor || 0x2d4a3e);

        // Autosave
        saveSystem.startAutosave(() => this.getGameState());

        // Check inicial
        this.hud.update(this.playerData, this.currentMap.name);

        // Starter message
        if (!this.playerData.flags.intro_done) {
            this.time.delayedCall(500, () => {
                this.dialog.show([
                    'Bem-vindo ao mundo de Tumon!',
                    'Use WASD ou setas para se mover.',
                    'Pressione E para interagir com NPCs.',
                    'Pressione I para abrir o inventário.',
                    'Explore a grama alta para encontrar criaturas!',
                    'Boa sorte, Domador!'
                ], () => {
                    this.playerData.flags.intro_done = true;
                });
            });
        }
    }

    loadGame() {
        const data = saveSystem.load();
        if (data) {
            this.playerData = PlayerData.deserialize(data.player || data);
            if (data.party && this.playerData.party.length === 0) {
                this.playerData.party = data.party.map(c => Creature.deserialize(c));
            }
            if (data.storage) {
                this.playerData.storage = data.storage.map(c => Creature.deserialize(c));
            }
            if (data.inventory) this.playerData.inventory = data.inventory;
            if (data.achievements) this.achievementSystem.loadState(data.achievements);
            if (data.defeatedTrainers) this.playerData.defeatedTrainers = data.defeatedTrainers;
            if (data.defeatedLeaders) this.playerData.defeatedLeaders = data.defeatedLeaders;
        } else {
            this.playerData = new PlayerData();
            const starter = new Creature('embrill', 5, 1);
            this.playerData.addCreature(starter);
        }
    }

    renderMap(mapId) {
        this.mapTiles.forEach(t => t.destroy());
        this.mapTiles = [];

        this.currentMap = MapsDB[mapId] || MapsDB.town;
        const ts = CONST.TILE_SIZE;

        const tileTextures = {
            0: 'tile_grass',
            1: 'tile_wall',
            2: 'tile_tall_grass',
            3: 'tile_water',
            4: 'tile_path',
            5: 'tile_door',
            6: 'tile_grass',
            7: 'tile_building',
            8: 'tile_sand',
            9: 'tile_rock'
        };

        for (let y = 0; y < this.currentMap.height; y++) {
            for (let x = 0; x < this.currentMap.width; x++) {
                const tileId = this.currentMap.tiles[y * this.currentMap.width + x];
                const texKey = tileTextures[tileId] || 'tile_grass';
                const tile = this.add.image(x * ts + ts / 2, y * ts + ts / 2, texKey);
                tile.setDisplaySize(ts, ts);
                this.mapTiles.push(tile);
            }
        }

        if (this.currentMap.transitions) {
            this.currentMap.transitions.forEach(t => {
                if (t.type === 'map') {
                    const marker = this.add.rectangle(
                        t.x * ts + ts / 2, t.y * ts + ts / 2,
                        ts, ts, 0xf1c40f, 0.2
                    );
                    this.mapTiles.push(marker);
                }
            });
        }
    }

    createPlayer() {
        const ts = CONST.TILE_SIZE;
        const spawnX = this.playerData.x || this.currentMap.playerSpawn.x;
        const spawnY = this.playerData.y || this.currentMap.playerSpawn.y;

        this.gridX = spawnX;
        this.gridY = spawnY;

        this.playerSprite = this.add.sprite(
            spawnX * ts + ts / 2,
            spawnY * ts + ts / 2,
            'playerSheet',
            0
        ).setDepth(100).setDisplaySize(ts * 0.8, ts * 1);

        this.createPlayerAnimations();
    }

    createPlayerAnimations() {
        const S = 'playerSheet';
        const mk = (key, frames, rate) => {
            if (!this.anims.exists(key)) {
                this.anims.create({
                    key,
                    frames: frames.map(f => ({ key: S, frame: f })),
                    frameRate: rate,
                    repeat: -1
                });
            }
        };
        mk('walk_down', [1, 2], 8);
        mk('walk_up',   [4, 5], 8);
        mk('walk_side', [7, 8], 8);
    }

    createNPCs() {
    // Limpa NPCs antigos
    Object.values(this.npcSprites).forEach(s => { if (s.sprite) s.sprite.destroy(); if (s.nameText) s.nameText.destroy(); });
    this.npcSprites = {};

    const ts = CONST.TILE_SIZE;
    const mapNpcs = this.currentMap.npcs || [];

    // Mapa de textura por npcId
    const npcTextureMap = {
        mom_npc:          'npc_mom',
        healer_npc:       'npc_healer',
        shop_npc:         'npc_merchant',
        trainer_npc_1:    'npc_trainer',
        trainer_npc_2:    'npc_trainer',
        guide_npc:        'npc_guide',
        leader_fire_npc:  'npc_trainer',
        leader_ice_npc:   'npc_trainer',
        barqueiro_npc:    'npc_guide',
        trainer_ilha:     'npc_trainer',
        trainer_floresta: 'npc_trainer',
        boss_templo:      'npc_trainer'
    };

    mapNpcs.forEach(npcId => {
        const npcData = NPCsDB[npcId];
        if (!npcData) return;

        const texKey = npcTextureMap[npcId];
        let sprite;

        if (texKey) {
            sprite = this.add.image(
                npcData.x * ts + ts / 2,
                npcData.y * ts + ts / 2,
                texKey
            ).setDepth(99).setDisplaySize(ts * 0.8, ts * 1);
        } else {
            // fallback: retângulo colorido para NPCs sem textura
            sprite = this.add.rectangle(
                npcData.x * ts + ts / 2,
                npcData.y * ts + ts / 2,
                ts * 0.7, ts * 0.7,
                npcData.color
            ).setDepth(99);
            sprite.setStrokeStyle(1, 0xffffff);
        }

        const nameText = this.add.text(
            npcData.x * ts + ts / 2,
            npcData.y * ts - 5,
            npcData.name,
            { fontFamily: 'Courier New', fontSize: '9px', color: '#ffffff', stroke: '#000', strokeThickness: 2 }
        ).setOrigin(0.5).setDepth(99);

        // Defeated indicator for trainers
        if (npcData.type === 'trainer' && this.playerData.defeatedTrainers.includes(npcId)) {
            sprite.setAlpha(0.5);
        }

        this.npcSprites[npcId] = { sprite, nameText, data: npcData };
    });
}   
    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = {
            up: this.input.keyboard.addKey('W'),
            down: this.input.keyboard.addKey('S'),
            left: this.input.keyboard.addKey('A'),
            right: this.input.keyboard.addKey('D')
        };
        this.interactKey = this.input.keyboard.addKey('E');
        this.inventoryKey = this.input.keyboard.addKey('I');
        this.escKey = this.input.keyboard.addKey('ESC');

        this.interactKey.on('down', () => this.handleInteract());
        this.inventoryKey.on('down', () => this.openInventory());
    }

    update(time, delta) {
        if (this.dialog.isVisible) {
            if (this.dialog.choiceActive) {
                if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.wasd.up)) {
                    this.dialog.navigateChoice(-1);
                } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down) || Phaser.Input.Keyboard.JustDown(this.wasd.down)) {
                    this.dialog.navigateChoice(1);
                } else if (Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
                           Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('ENTER'))) {
                    this.dialog.confirmChoice();
                }
            } else if (Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
                       Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('ENTER'))) {
                this.dialog.advance();
            }
            return;
        }

        if (this.inputLocked || !this.canMove) return;
        this.handleMovement();
    }

    handleMovement() {
        let dx = 0, dy = 0;

        if (this.cursors.up.isDown || this.wasd.up.isDown) dy = -1;
        else if (this.cursors.down.isDown || this.wasd.down.isDown) dy = 1;
        else if (this.cursors.left.isDown || this.wasd.left.isDown) dx = -1;
        else if (this.cursors.right.isDown || this.wasd.right.isDown) dx = 1;
        else {
            // Nenhuma tecla pressionada e parado — volta ao frame idle
            if (!this.isMoving && this.playerSprite.anims.isPlaying) {
                this.playerSprite.anims.stop();
                const idleDir = (this.playerDirection === 'left' || this.playerDirection === 'right') ? 'side' : (this.playerDirection || 'down');
                this.playerSprite.setFrame({ down: 0, up: 3, side: 6 }[idleDir] ?? 0);
            }
            return;
        }

        if (this.isMoving) return;

        const newX = this.gridX + dx;
        const newY = this.gridY + dy;

        if (newX < 0 || newX >= this.currentMap.width || newY < 0 || newY >= this.currentMap.height) return;

        const tileId = this.currentMap.tiles[newY * this.currentMap.width + newX];
        const blocked = [1, 3, 7, 9];
        if (blocked.includes(tileId)) return;

        for (const [npcId, npc] of Object.entries(this.npcSprites)) {
            if (npc.data.x === newX && npc.data.y === newY) return;
        }

        // Atualiza direção e inicia animação de caminhada
        this.playerDirection = dx < 0 ? 'left' : dx > 0 ? 'right' : dy < 0 ? 'up' : 'down';
        const animDir = dx !== 0 ? 'side' : this.playerDirection;
        this.playerSprite.setFlipX(dx > 0);
        this.playerSprite.play('walk_' + animDir, true);

        this.isMoving = true;
        const ts = CONST.TILE_SIZE;

        this.tweens.add({
            targets: this.playerSprite,
            x: newX * ts + ts / 2,
            y: newY * ts + ts / 2,
            duration: 150,
            onComplete: () => {
                this.gridX = newX;
                this.gridY = newY;
                this.isMoving = false;
                this.checkTransition(newX, newY);
                if (tileId === 2) this.checkEncounter();
                this.hud.update(this.playerData, this.currentMap.name);
            }
        });
    }

    checkTransition(x, y) {
        if (!this.currentMap.transitions) return;

        const transition = this.currentMap.transitions.find(t => t.x === x && t.y === y);
        if (!transition) return;

        if (transition.type === 'map' && transition.target) {
            this.transitionToMap(transition.target, transition.targetSpawn);
        } else if (transition.type === 'door') {
            if (this.inputLocked) return;
            this.inputLocked = true;
            this.handleDoorInteraction(transition.target);
        }
    }

    transitionToMap(mapId, spawn) {
        this.inputLocked = true;

        this.cameras.main.fade(300, 0, 0, 0);
        this.time.delayedCall(300, () => {
            Object.values(this.npcSprites).forEach(s => {
                if (s.sprite) s.sprite.destroy();
                if (s.nameText) s.nameText.destroy();
            });
            this.npcSprites = {};

            this.playerData.currentMap = mapId;
            if (spawn) {
                this.playerData.x = spawn.x;
                this.playerData.y = spawn.y;
            }

            this.renderMap(mapId);
            this.createNPCs();

            const ts = CONST.TILE_SIZE;
            const sx = spawn ? spawn.x : this.currentMap.playerSpawn.x;
            const sy = spawn ? spawn.y : this.currentMap.playerSpawn.y;
            this.gridX = sx;
            this.gridY = sy;
            this.playerSprite.setPosition(sx * ts + ts / 2, sy * ts + ts / 2);

            this.cameras.main.setBackgroundColor(this.currentMap.backgroundColor || 0x2d4a3e);
            this.cameras.main.fadeIn(300);
            this.hud.update(this.playerData, this.currentMap.name);
            this.hud.showNotification(`📍 ${this.currentMap.name}`, '#f1c40f');

            this.time.delayedCall(350, () => { this.inputLocked = false; });

            this.saveGame();
        });
    }

    handleDoorInteraction(target) {
        switch (target) {
            case 'player_house':
                this.dialog.show([
                    'Sua casa. Tudo está como você deixou.',
                    'Que boas memórias...'
                ], () => { this.inputLocked = false; });
                break;

            case 'heal_center':
                this.playerData.healAll();
                this.dialog.show([
                    '♥ Suas criaturas foram completamente curadas!',
                    'Boa sorte nas suas aventuras!'
                ], () => {
                    this.hud.showNotification('♥ Time curado!', '#2ecc71');
                    this.inputLocked = false;
                });
                break;

            case 'shop':
                this.inputLocked = false;
                this.openShop();
                break;

            case 'leader_fire':
                this.inputLocked = false;
                this.startLeaderBattle('leader_fire');
                break;

            case 'leader_ice':
                this.inputLocked = false;
                this.startLeaderBattle('leader_ice');
                break;

            default:
                this.inputLocked = false;
        }
    }

    checkEncounter() {
        if (!this.currentMap.encounters) return;

        const creature = EncounterSystem.checkEncounter(this.currentMap.id);
        if (!creature) return;

        if (!this.playerData.hasAliveCreatures()) {
            this.hud.showNotification('Todas suas criaturas estão desmaiadas!', '#e74c3c');
            return;
        }

        this.inputLocked = true;
        this.cameras.main.flash(300, 255, 255, 255);

        this.time.delayedCall(400, () => {
            if (creature.isShiny) {
                this.playerData.stats.shiniesFound++;
                this.achievementSystem.check(this.playerData.stats, this.playerData);
            }

            this.scene.launch('BattleScene', {
                playerData: this.playerData,
                enemyCreature: creature,
                isWild: true,
                achievementBonuses: this.achievementSystem.getTotalBonuses(),
                onBattleEnd: (result) => this.onBattleEnd(result)
            });
            this.scene.pause();
        });
    }

    handleInteract() {
        if (this.dialog.isVisible) {
            if (this.dialog.choiceActive) {
                this.dialog.confirmChoice();
            } else {
                this.dialog.advance();
            }
            return;
        }

        const directions = [
            { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
            { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
        ];

        for (const dir of directions) {
            const checkX = this.gridX + dir.dx;
            const checkY = this.gridY + dir.dy;

            for (const [npcId, npc] of Object.entries(this.npcSprites)) {
                if (npc.data.x === checkX && npc.data.y === checkY) {
                    this.interactWithNPC(npc.data);
                    return;
                }
            }
        }
    }

    interactWithNPC(npcData) {
        switch (npcData.type) {
            case 'info':
                this.dialog.show(npcData.dialog);
                break;
            case 'healer':
                this.playerData.healAll();
                this.dialog.show(npcData.dialog, () => {
                    this.hud.showNotification('♥ Time curado!', '#2ecc71');
                });
                break;
            case 'bank':
                this.handleBankNPC(npcData);
                break;
            case 'shop':
                this.openShop();
                break;
            case 'trainer':
                this.handleTrainerNPC(npcData);
                break;
        }
    }

    handleBankNPC(npcData) {
        const gold = this.playerData.gold;
        const balance = this.playerData.bankGold;
        this.dialog.show([
            `${npcData.name}: Olá querido! Ouro em mãos: ${gold} | Guardado comigo: ${balance}.`
        ], () => {
            this.dialog.showChoice('O que deseja fazer?', ['Depositar', 'Sacar', 'Sair'], (choice) => {
                if (choice === 0) this._bankDeposit();
                else if (choice === 1) this._bankWithdraw();
            });
        });
    }

    _bankDeposit() {
        const gold = this.playerData.gold;
        if (gold <= 0) {
            this.dialog.show(['Você não tem ouro para depositar!']);
            return;
        }
        this.dialog.showChoice(`Depositar quanto? (${gold} disponível)`, ['Tudo', 'Metade', 'Cancelar'], (choice) => {
            if (choice === 2) return;
            const amount = choice === 0 ? gold : Math.floor(gold / 2);
            if (amount <= 0) { this.dialog.show(['Ouro insuficiente!']); return; }
            this.playerData.depositGold(amount);
            this.hud.showNotification(`+${amount} ouro guardado!`, '#f1c40f');
            this.hud.update(this.playerData, this.currentMap.name);
        });
    }

    _bankWithdraw() {
        const balance = this.playerData.bankGold;
        if (balance <= 0) {
            this.dialog.show(['Não há ouro guardado!']);
            return;
        }
        this.dialog.showChoice(`Sacar quanto? (${balance} guardado)`, ['Tudo', 'Metade', 'Cancelar'], (choice) => {
            if (choice === 2) return;
            const amount = choice === 0 ? balance : Math.floor(balance / 2);
            this.playerData.withdrawGold(amount);
            this.hud.showNotification(`${amount} ouro sacado!`, '#2ecc71');
            this.hud.update(this.playerData, this.currentMap.name);
        });
    }

    handleTrainerNPC(npcData) {
        if (this.playerData.defeatedTrainers.includes(npcData.id)) {
            this.dialog.show(['Você já me derrotou... Da próxima eu venço!']);
            return;
        }

        if (!this.playerData.hasAliveCreatures()) {
            this.dialog.show(['Suas criaturas estão desmaiadas. Vá se curar primeiro!']);
            return;
        }

        this.dialog.show(npcData.dialog, () => {
            const enemyParty = npcData.party.map(p => new Creature(p.creatureId, p.level, p.genetics));

            this.inputLocked = true;
            this.cameras.main.flash(300, 255, 255, 255);

            this.time.delayedCall(400, () => {
                this.scene.launch('BattleScene', {
                    playerData: this.playerData,
                    enemyCreature: enemyParty[0],
                    enemyParty: enemyParty,
                    isWild: false,
                    trainerName: npcData.name,
                    trainerId: npcData.id,
                    trainerReward: npcData.reward,
                    achievementBonuses: this.achievementSystem.getTotalBonuses(),
                    onBattleEnd: (result) => this.onTrainerBattleEnd(result, npcData)
                });
                this.scene.pause();
            });
        });
    }

    startLeaderBattle(leaderId) {
        const leader = LeadersDB[leaderId];
        if (!leader) return;

        if (this.playerData.defeatedLeaders.includes(leaderId)) {
            this.dialog.show([`${leader.name}: Você já possui meu badge. Continue forte!`]);
            return;
        }

        if (!this.playerData.hasAliveCreatures()) {
            this.dialog.show(['Suas criaturas estão desmaiadas!']);
            return;
        }

        this.dialog.show(leader.dialog.before, () => {
            const enemyParty = leader.party.map(p => new Creature(p.creatureId, p.level, p.genetics));

            this.inputLocked = true;
            this.cameras.main.flash(500, 255, 0, 0);

            this.time.delayedCall(500, () => {
                this.scene.launch('BattleScene', {
                    playerData: this.playerData,
                    enemyCreature: enemyParty[0],
                    enemyParty: enemyParty,
                    isWild: false,
                    trainerName: `${leader.name} - ${leader.title}`,
                    trainerId: leaderId,
                    trainerReward: leader.reward,
                    isLeader: true,
                    achievementBonuses: this.achievementSystem.getTotalBonuses(),
                    onBattleEnd: (result) => this.onLeaderBattleEnd(result, leader)
                });
                this.scene.pause();
            });
        });
    }

    onBattleEnd(result) {
        this.scene.resume();
        this.inputLocked = false;

        if (result.won) {
            this.playerData.stats.battlesWon++;
            if (this.playerData.bankGold > 0) {
                const interest = Math.max(1, Math.floor(this.playerData.bankGold * 0.01));
                this.playerData.bankGold += interest;
                this.hud.showNotification(`+${interest} ouro guardado com a mãe!`, '#f1c40f');
            }
            if (result.gold) this.playerData.addGold(result.gold);
            if (result.xp) {
                const uids     = result.participants || [];
                const eligible = uids.length > 0
                    ? this.playerData.party.filter(c => uids.includes(c.uid))
                    : [this.playerData.getFirstAlive()].filter(Boolean);
                const xpEach   = eligible.length > 0 ? Math.max(1, Math.floor(result.xp / eligible.length)) : 0;

                eligible.forEach(c => {
                    EvolutionSystem.addXP(c, xpEach).forEach(r => {
                        if (r.levelUp) this.hud.showNotification(`⬆ ${c.name} subiu para Lv.${r.newLevel}!`, '#f1c40f');
                        if (r.evolved) {
                            this.playerData.stats.evolutions++;
                            this.hud.showNotification(`✨ ${c.name} evoluiu para ${r.evolvedTo}!`, '#9b59b6');
                        }
                        if (r.mutated) this.hud.showNotification(`🧬 ${c.name} sofreu uma mutação!`, '#e74c3c');
                    });
                });
            }
            if (result.captured) {
                this.playerData.stats.captures++;
                const where = this.playerData.addCreature(result.captured);
                this.hud.showNotification(
                    `📦 ${result.captured.name} capturado! (${where === 'party' ? 'Time' : 'Armazém'})`,
                    '#2ecc71'
                );
            }
        } else {
            this.playerData.stats.battlesLost++;
        }

        const newAch = this.achievementSystem.check(this.playerData.stats, this.playerData);
        newAch.forEach(ach => this.hud.showNotification(`🏆 Achievement: ${ach.name}!`, '#f1c40f'));

        this.hud.update(this.playerData, this.currentMap.name);
        this.saveGame();
    }

    onTrainerBattleEnd(result, npcData) {
        this.scene.resume();
        this.inputLocked = false;

        if (result.won) {
            this.playerData.stats.battlesWon++;
            if (this.playerData.bankGold > 0) {
                const interest = Math.max(1, Math.floor(this.playerData.bankGold * 0.01));
                this.playerData.bankGold += interest;
                this.hud.showNotification(`+${interest} ouro guardado com a mãe!`, '#f1c40f');
            }
            this.playerData.defeatedTrainers.push(npcData.id);
            this.playerData.addGold(npcData.reward);

            const uids     = result.participants || [];
            const eligible = uids.length > 0
                ? this.playerData.party.filter(c => c.isAlive() && uids.includes(c.uid))
                : this.playerData.party.filter(c => c.isAlive());
            const xpEach   = eligible.length > 0 ? Math.max(1, Math.floor((result.xp || 50) / eligible.length)) : 0;

            eligible.forEach(c => {
                EvolutionSystem.addXP(c, xpEach).forEach(r => {
                    if (r.levelUp) this.hud.showNotification(`⬆ ${c.name} Lv.${r.newLevel}!`, '#f1c40f');
                    if (r.evolved) {
                        this.playerData.stats.evolutions++;
                        this.hud.showNotification(`✨ Evolução!`, '#9b59b6');
                    }
                });
            });

            this.hud.showNotification(`💰 +${npcData.reward} ouro!`, '#f1c40f');

            if (this.npcSprites[npcData.id]) {
                this.npcSprites[npcData.id].sprite.setAlpha(0.5);
            }
        } else {
            this.playerData.stats.battlesLost++;
        }

        const newAch = this.achievementSystem.check(this.playerData.stats, this.playerData);
        newAch.forEach(ach => this.hud.showNotification(`🏆 ${ach.name}!`, '#f1c40f'));

        this.hud.update(this.playerData, this.currentMap.name);
        this.saveGame();
    }

    onLeaderBattleEnd(result, leader) {
        this.scene.resume();
        this.inputLocked = false;

        if (result.won) {
            this.playerData.stats.battlesWon++;
            if (this.playerData.bankGold > 0) {
                const interest = Math.max(1, Math.floor(this.playerData.bankGold * 0.01));
                this.playerData.bankGold += interest;
                this.hud.showNotification(`+${interest} ouro guardado com a mãe!`, '#f1c40f');
            }
            this.playerData.defeatedLeaders.push(leader.id);
            this.playerData.badges.push(leader.badge);
            this.playerData.addGold(leader.reward);

            const uids     = result.participants || [];
            const eligible = uids.length > 0
                ? this.playerData.party.filter(c => c.isAlive() && uids.includes(c.uid))
                : this.playerData.party.filter(c => c.isAlive());
            const xpEach   = eligible.length > 0 ? Math.max(1, Math.floor(200 / eligible.length)) : 0;
            eligible.forEach(c => EvolutionSystem.addXP(c, xpEach));

            this.dialog.show(leader.dialog.after, () => {
                this.hud.showNotification(`🏅 ${leader.badge} obtido!`, '#f1c40f');
                this.hud.showNotification(`💰 +${leader.reward} ouro!`, '#f1c40f');
            });
        } else {
            this.playerData.stats.battlesLost++;
            this.dialog.show(['Você foi derrotado... Treine mais e volte!']);
        }

        const newAch = this.achievementSystem.check(this.playerData.stats, this.playerData);
        newAch.forEach(ach => this.hud.showNotification(`🏆 ${ach.name}!`, '#f1c40f'));

        this.hud.update(this.playerData, this.currentMap.name);
        this.saveGame();
    }

    openShop() {
        if (this.dialog.isVisible) return;
        const items = ShopInventory[this.currentMap.id] || ShopInventory.town || [];
        this.inputLocked = true;
        this.scene.launch('ShopScene', {
            playerData: this.playerData,
            items,
            onClose: () => {
                this.scene.resume();
                this.inputLocked = false;
                this.hud.update(this.playerData, this.currentMap.name);
                this.saveGame();
            }
        });
        this.scene.pause();
    }

    _shopMenuLegacy(items) {
        const W = this.scale.width;
        const H = this.scale.height;

        const container = this.add.container(CONST.GAME_WIDTH / 2, CONST.GAME_HEIGHT / 2).setDepth(1100).setScrollFactor(0);

        const bg = this.add.rectangle(0, 0, 380, 340, 0x000000, 0.92);
        bg.setStrokeStyle(2, 0xf1c40f);
        container.add(bg);

        const title = this.add.text(0, -150, `🛒 LOJA  |  💰 ${this.playerData.gold} ouro`, {
            fontFamily: 'Courier New', fontSize: '14px', color: '#f1c40f'
        }).setOrigin(0.5);
        container.add(title);

        const tooltip = this.add.text(0, 0, '', {
            fontFamily: 'Courier New',
            fontSize: '10px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 6, y: 4 }
        }).setVisible(false).setDepth(9999);

        items.slice(0, 8).forEach((itemId, i) => {
            const item = ItemsDB[itemId];
            if (!item) return;

            const y = -110 + i * 34;

            // fundo
            const btnBg = this.add.rectangle(0, y, 340, 28, 0x2c3e50)
                .setStrokeStyle(1, 0x555555)
                .setInteractive({ useHandCursor: true });

            // ícone (fixo à esquerda)
            const icon = this.add.image(-150, y, item.icon)
                .setDisplaySize(22, 22);

            // nome (alinhado ao lado do ícone)
            const btnText = this.add.text(-120, y - 8, item.name, {
                fontFamily: 'Courier New',
                fontSize: '11px',
                color: '#ecf0f1'
            });

            // preço (lado direito fixo)
            const priceText = this.add.text(120, y - 8, `${item.price} 💰`, {
                fontFamily: 'Courier New',
                fontSize: '11px',
                color: '#f1c40f'
            }).setOrigin(1, 0);


            btnBg.on('pointerover', (pointer) => {
                btnBg.setFillStyle(0x34495e);

                tooltip.setText(item.description);
                tooltip.setPosition(pointer.x + 10, pointer.y + 10);
                tooltip.setVisible(true);
            });

            btnBg.on('pointerout', () => {
                btnBg.setFillStyle(0x2c3e50);
                tooltip.setVisible(false);
            });

            btnBg.on('pointerdown', () => {
                if (this.playerData.spendGold(item.price)) {
                    this.playerData.addItem(itemId);
                    this.hud.showNotification(`✅ Comprou ${item.name}!`, '#2ecc71');
                } else {
                    this.hud.showNotification('💸 Ouro insuficiente!', '#e74c3c');
                }
            });

            container.add([btnBg, icon, btnText, priceText]);
        });

        const closeBtn = this.add.text(0, 148, '[ Fechar ]', {
            fontFamily: 'Courier New', fontSize: '14px', color: '#e74c3c',
            backgroundColor: '#1a1a2e', padding: { x: 14, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        closeBtn.on('pointerdown', () => container.destroy());
        container.add(closeBtn); closeBtn.setScrollFactor(0);
    }

    openInventory() {
        if (this.dialog.isVisible) return;

        this.inputLocked = true;
        this.scene.launch('InventoryScene', {
            playerData: this.playerData,
            achievementSystem: this.achievementSystem,
            onClose: () => {
                this.scene.resume();
                this.inputLocked = false;
                this.hud.update(this.playerData, this.currentMap.name);
                this.saveGame();
            }
        });
        this.scene.pause();
    }

    getGameState() {
        if (!this.playerData) return null;

        this.playerData.x = this.gridX;
        this.playerData.y = this.gridY;

        return {
            version: 1,
            player: this.playerData.serialize(),
            party: this.playerData.party.map(c => c.serialize()),
            storage: this.playerData.storage.map(c => c.serialize()),
            inventory: this.playerData.inventory,
            achievements: this.achievementSystem.exportState(),
            defeatedTrainers: this.playerData.defeatedTrainers,
            defeatedLeaders: this.playerData.defeatedLeaders,
            timestamp: Date.now()
        };
    }

    saveGame() {
        const state = this.getGameState();
        if (state) saveSystem.save(state);
    }
}