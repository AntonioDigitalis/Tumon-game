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
    }

    create() {
        // Carrega save
        this.loadGame();

        // Renderiza mapa
        this.renderMap(this.playerData.currentMap);

        // Cria player sprite
        this.createPlayer();

        // Cria NPCs
        this.createNPCs();

        // HUD
        this.hud = new HUD(this);
        this.hud.create(this.playerData);

        // Dialog
        this.dialog = new DialogBox(this);
        this.dialog.create();

        // Inputs
        this.setupInput();

        // Camera
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
            // Compatibilidade: se party está no root
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
            // Novo jogo fallback
            this.playerData = new PlayerData();
            const starter = new Creature('embrill', 5, 1);
            this.playerData.addCreature(starter);
        }
    }

    renderMap(mapId) {
        // Limpa tiles antigos
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
            6: 'tile_grass', // NPC positions show as grass
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

        // Transition markers (subtle)
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

        this.playerSprite = this.add.image(
            spawnX * ts + ts / 2,
            spawnY * ts + ts / 2,
            'player'
        ).setDepth(100).setDisplaySize(ts * 0.8, ts * 1);
    }

    createNPCs() {
        // Limpa NPCs antigos
        Object.values(this.npcSprites).forEach(s => { if (s.sprite) s.sprite.destroy(); if (s.nameText) s.nameText.destroy(); });
        this.npcSprites = {};

        const ts = CONST.TILE_SIZE;
        const mapNpcs = this.currentMap.npcs || [];

        mapNpcs.forEach(npcId => {
            const npcData = NPCsDB[npcId];
            if (!npcData) return;

            const sprite = this.add.rectangle(
                npcData.x * ts + ts / 2,
                npcData.y * ts + ts / 2,
                ts * 0.7, ts * 0.7,
                npcData.color
            ).setDepth(99);

            sprite.setStrokeStyle(1, 0xffffff);

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
            if (Phaser.Input.Keyboard.JustDown(this.interactKey) ||
                Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
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
        else return;

        if (this.isMoving) return;

        const newX = this.gridX + dx;
        const newY = this.gridY + dy;

        // Bounds check
        if (newX < 0 || newX >= this.currentMap.width || newY < 0 || newY >= this.currentMap.height) {
            return;
        }

        // Collision check
        const tileId = this.currentMap.tiles[newY * this.currentMap.width + newX];
        const blocked = [1, 3, 7, 9]; // wall, water, building, rock
        if (blocked.includes(tileId)) return;

        // Check NPC collision
        for (const [npcId, npc] of Object.entries(this.npcSprites)) {
            if (npc.data.x === newX && npc.data.y === newY) return; // Can't walk on NPCs
        }

        // Move
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

                // Check transitions
                this.checkTransition(newX, newY);

                // Check encounter (tall grass)
                if (tileId === 2) {
                    this.checkEncounter();
                }

                // Update HUD
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
            this.handleDoorInteraction(transition.target);
        }
    }

    transitionToMap(mapId, spawn) {
        this.inputLocked = true;

        // Fade out
        this.cameras.main.fade(300, 0, 0, 0);
        this.time.delayedCall(300, () => {
            // Limpa NPCs
            Object.values(this.npcSprites).forEach(s => {
                if (s.sprite) s.sprite.destroy();
                if (s.nameText) s.nameText.destroy();
            });
            this.npcSprites = {};

            // Atualiza dados
            this.playerData.currentMap = mapId;
            if (spawn) {
                this.playerData.x = spawn.x;
                this.playerData.y = spawn.y;
            }

            // Renderiza novo mapa
            this.renderMap(mapId);
            this.createNPCs();

            // Reposiciona player
            const ts = CONST.TILE_SIZE;
            const sx = spawn ? spawn.x : this.currentMap.playerSpawn.x;
            const sy = spawn ? spawn.y : this.currentMap.playerSpawn.y;
            this.gridX = sx;
            this.gridY = sy;
            this.playerSprite.setPosition(sx * ts + ts / 2, sy * ts + ts / 2);

            // Atualiza camera bg
            this.cameras.main.setBackgroundColor(this.currentMap.backgroundColor || 0x2d4a3e);

            // Fade in
            this.cameras.main.fadeIn(300);
            this.hud.update(this.playerData, this.currentMap.name);
            this.hud.showNotification(`📍 ${this.currentMap.name}`, '#f1c40f');

            this.time.delayedCall(350, () => {
                this.inputLocked = false;
            });

            // Autosave
            this.saveGame();
        });
    }

    handleDoorInteraction(target) {
        switch (target) {
            case 'player_house':
                this.dialog.show([
                    'Sua casa. Tudo está como você deixou.',
                    'Que boas memórias...'
                ]);
                break;
            case 'heal_center':
                this.playerData.healAll();
                this.dialog.show([
                    '♥ Suas criaturas foram completamente curadas!',
                    'Boa sorte nas suas aventuras!'
                ]);
                this.hud.showNotification('♥ Time curado!', '#2ecc71');
                break;
            case 'shop':
                this.openShop();
                break;
            case 'leader_fire':
                this.startLeaderBattle('leader_fire');
                break;
            case 'leader_ice':
                this.startLeaderBattle('leader_ice');
                break;
        }
    }

    checkEncounter() {
        if (!this.currentMap.encounters) return;
        
        const creature = EncounterSystem.checkEncounter(this.currentMap.id);
        if (!creature) return;

        // Verifica se jogador tem criaturas vivas
        if (!this.playerData.hasAliveCreatures()) {
            this.hud.showNotification('Todas suas criaturas estão desmaiadas!', '#e74c3c');
            return;
        }

        this.inputLocked = true;

        // Flash effect
        this.cameras.main.flash(300, 255, 255, 255);

        this.time.delayedCall(400, () => {
            // Track shiny
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
            this.dialog.advance();
            return;
        }

        // Encontra NPC adjacente
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
        // Simples: deposita/saca 100 de cada vez
        this.dialog.show([
            `${npcData.name}: Olá querido!`,
            `Seu ouro: ${this.playerData.gold} | No banco: ${this.playerData.bankGold}`,
            'Vou guardar 100 de ouro para você, ok?'
        ], () => {
            if (this.playerData.depositGold(100)) {
                this.hud.showNotification('💰 100 ouro depositado!', '#f1c40f');
            } else {
                this.hud.showNotification('Ouro insuficiente!', '#e74c3c');
            }
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
            // Cria time do trainer
            const enemyParty = npcData.party.map(p => {
                const c = new Creature(p.creatureId, p.level, p.genetics);
                return c;
            });

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
            if (result.gold) this.playerData.addGold(result.gold);
            if (result.xp) {
                const first = this.playerData.getFirstAlive();
                if (first) {
                    const levelResults = EvolutionSystem.addXP(first, result.xp);
                    levelResults.forEach(r => {
                        if (r.levelUp) this.hud.showNotification(`⬆ ${first.name} subiu para Lv.${r.newLevel}!`, '#f1c40f');
                        if (r.evolved) {
                            this.playerData.stats.evolutions++;
                            this.hud.showNotification(`✨ ${first.name} evoluiu para ${r.evolvedTo}!`, '#9b59b6');
                        }
                        if (r.mutated) this.hud.showNotification(`🧬 ${first.name} sofreu uma mutação!`, '#e74c3c');
                    });
                }
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

        // Check achievements
        const newAch = this.achievementSystem.check(this.playerData.stats, this.playerData);
        newAch.forEach(ach => {
            this.hud.showNotification(`🏆 Achievement: ${ach.name}!`, '#f1c40f');
        });

        this.hud.update(this.playerData, this.currentMap.name);
        this.saveGame();
    }

    onTrainerBattleEnd(result, npcData) {
        this.scene.resume();
        this.inputLocked = false;

        if (result.won) {
            this.playerData.stats.battlesWon++;
            this.playerData.defeatedTrainers.push(npcData.id);
            this.playerData.addGold(npcData.reward);

            // Give XP to all party
            this.playerData.party.forEach(c => {
                if (c.isAlive()) {
                    const levelResults = EvolutionSystem.addXP(c, result.xp || 50);
                    levelResults.forEach(r => {
                        if (r.levelUp) this.hud.showNotification(`⬆ ${c.name} Lv.${r.newLevel}!`, '#f1c40f');
                        if (r.evolved) {
                            this.playerData.stats.evolutions++;
                            this.hud.showNotification(`✨ Evolução!`, '#9b59b6');
                        }
                    });
                }
            });

            this.hud.showNotification(`💰 +${npcData.reward} ouro!`, '#f1c40f');

            // Update NPC sprite
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
            this.playerData.defeatedLeaders.push(leader.id);
            this.playerData.badges.push(leader.badge);
            this.playerData.addGold(leader.reward);

            // XP para todo o time
            this.playerData.party.forEach(c => {
                if (c.isAlive()) EvolutionSystem.addXP(c, 200);
            });

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
        const items = ShopInventory.town || [];
        const messages = ['Bem-vindo à loja! O que deseja comprar?'];
        
        items.forEach(itemId => {
            const item = ItemsDB[itemId];
            if (item) {
                messages.push(`${item.name} - ${item.price}💰 : ${item.description}`);
            }
        });

        messages.push('(Para comprar, clique nos botões que aparecerão)');

        // Loja simplificada: compra direta via dialog
        this.dialog.show(messages, () => {
            this.showShopMenu(items);
        });
    }

    showShopMenu(items) {
        // Cria botões temporários de compra
        const container = this.add.container(CONST.GAME_WIDTH / 2, CONST.GAME_HEIGHT / 2).setDepth(1100).setScrollFactor(0);
        
        const bg = this.add.rectangle(0, 0, 350, 300, 0x000000, 0.9).setScrollFactor(0);
        bg.setStrokeStyle(2, 0xf1c40f);
        container.add(bg);

        const title = this.add.text(0, -130, `💰 Ouro: ${this.playerData.gold}`, {
            fontFamily: 'Courier New', fontSize: '14px', color: '#f1c40f'
        }).setOrigin(0.5).setScrollFactor(0);
        container.add(title);

        items.forEach((itemId, i) => {
            const item = ItemsDB[itemId];
            if (!item) return;

            const by = -90 + i * 32;
            const btnBg = this.add.rectangle(0, by, 300, 28, 0x2c3e50).setScrollFactor(0);
            btnBg.setInteractive({ useHandCursor: true });

            const btnText = this.add.text(0, by, `${item.name} - ${item.price}💰`, {
                fontFamily: 'Courier New', fontSize: '11px', color: '#ecf0f1'
            }).setOrigin(0.5).setScrollFactor(0);

            btnBg.on('pointerover', () => btnBg.setFillStyle(0x34495e));
            btnBg.on('pointerout', () => btnBg.setFillStyle(0x2c3e50));
            btnBg.on('pointerdown', () => {
                if (this.playerData.spendGold(item.price)) {
                    this.playerData.addItem(itemId);
                    this.hud.showNotification(`✅ Comprou ${item.name}!`, '#2ecc71');
                    title.setText(`💰 Ouro: ${this.playerData.gold}`);
                } else {
                    this.hud.showNotification('Ouro insuficiente!', '#e74c3c');
                }
            });

            container.add([btnBg, btnText]);
        });

        // Botão fechar
        const closeBtn = this.add.text(0, 130, '[ Fechar ]', {
            fontFamily: 'Courier New', fontSize: '14px', color: '#e74c3c',
            backgroundColor: '#1a1a2e', padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setScrollFactor(0).setInteractive({ useHandCursor: true });

        closeBtn.on('pointerdown', () => container.destroy());
        container.add(closeBtn);
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