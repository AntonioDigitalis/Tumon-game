// ============================================
// INVENTORY SCENE — Menu principal do jogador
// ============================================

class InventoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'InventoryScene' });
    }

    init(data) {
        this.playerData = data.playerData;
        this.achievementSystem = data.achievementSystem;
        this.onClose = data.onClose;
        this.currentTab = data.currentTab || 'party';
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
        const w = CONST.GAME_WIDTH;
        const h = CONST.GAME_HEIGHT;

        this.add.rectangle(w / 2, h / 2, w, h, 0x0a0a1e, 0.95);

        this.add.text(w / 2, 20, '📋 MENU DO DOMADOR', {
            fontFamily: 'Courier New', fontSize: '18px', color: '#f1c40f', fontStyle: 'bold'
        }).setOrigin(0.5);

        const tabs = [
            { key: 'party', label: '🐾 Time' },
            { key: 'items', label: '🎒 Itens' },
            { key: 'fusion', label: '🔮 Fusão' },
            { key: 'breed', label: '🧬 Breeding' },
            { key: 'achievements', label: '🏆 Conquistas' },
            { key: 'stats', label: '📊 Stats' },
            { key: 'map', label: '🗺️ Mapa' }
        ];

        tabs.forEach((tab, i) => {
            const tx = 8 + i * 113;
            const btn = this.add.text(tx, 48, tab.label, {
                fontFamily: 'Courier New',
                fontSize: '11px',
                color: this.currentTab === tab.key ? '#f1c40f' : '#888888',
                backgroundColor: this.currentTab === tab.key ? '#2c3e50' : '#1a1a2e',
                padding: { x: 5, y: 3 }
            }).setInteractive({ useHandCursor: true });

            btn.on('pointerdown', () => {
                if (tab.key === 'fusion') {
                    this.openFusion();
                } else if (tab.key === 'breed') {
                    this.openBreeding();
                } else {
                    this.currentTab = tab.key;
                    this.scene.restart({
                        playerData: this.playerData,
                        achievementSystem: this.achievementSystem,
                        onClose: this.onClose,
                        currentTab: tab.key
                    });
                }
            });
        });

        const contentY = 80;
        switch (this.currentTab) {
            case 'party': this.renderParty(contentY); break;
            case 'items': this.renderItems(contentY); break;
            case 'achievements': this.renderAchievements(contentY); break;
            case 'stats': this.renderStats(contentY); break;
            case 'map': this.renderWorldMap(contentY); break;
        }

        const closeBtn = this.add.text(w / 2, h - 20, '[ Fechar - ESC ]', {
            fontFamily: 'Courier New', fontSize: '14px', color: '#e74c3c',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        closeBtn.on('pointerdown', () => this.close());
        this.input.keyboard.on('keydown-ESC', () => this.close());
    }

    renderParty(startY) {
        const w = CONST.GAME_WIDTH;

        if (this.playerData.party.length === 0) {
            this.add.text(w / 2, startY + 50, 'Nenhuma criatura no time.', {
                fontFamily: 'Courier New', fontSize: '14px', color: '#888888'
            }).setOrigin(0.5);
            return;
        }

        PartyUI.createPartyList(this, this.playerData.party, 20, startY, (creature, index) => {
            this.showCreatureDetail(creature);
        });

        // Storage count
        this.add.text(20, startY + this.playerData.party.length * 75 + 15,
            `📦 Armazém: ${this.playerData.storage.length} criatura(s)`, {
            fontFamily: 'Courier New', fontSize: '11px', color: '#888888'
        });

        // Storage list (compact)
        this.playerData.storage.slice(0, 5).forEach((creature, i) => {
            const sy = startY + this.playerData.party.length * 75 + 40 + i * 22;
            this.add.text(30, sy,
                `${creature.isShiny ? '✨' : ''}${creature.name} Lv.${creature.level} ${Helpers.geneticStars(creature.genetics)}`, {
                fontFamily: 'Courier New', fontSize: '10px', color: '#666666'
            });
        });
    }

    showCreatureDetail(creature) {
        const w = CONST.GAME_WIDTH;
        const h = CONST.GAME_HEIGHT;

        const overlay = this.add.container(0, 0).setDepth(500);
        const bg = this.add.rectangle(w / 2, h / 2, 400, 420, 0x0a0a1e, 0.98);
        bg.setStrokeStyle(2, 0x3498db);
        overlay.add(bg);

        const cx = w / 2;
        let cy = h / 2 - 180;

        // Sprite
        const procKey = `proc_${creature.templateId}${creature.isShiny ? '_shiny' : ''}`;
        const sprite = this.textures.exists(procKey)
            ? this.add.image(cx, cy + 20, procKey).setDisplaySize(64, 64)
            : this.add.rectangle(cx, cy + 20, 50, 50, creature.spriteColor).setStrokeStyle(2, 0xffffff);
        overlay.add(sprite);

        cy += 60;

        const shiny = creature.isShiny ? ' ✨ SHINY' : '';
        const titleText = this.add.text(cx, cy, `${creature.name}${shiny}`, {
            fontFamily: 'Courier New', fontSize: '16px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);
        overlay.add(titleText);

        cy += 20;

        const elemColor = CONST.ELEMENT_COLORS[creature.element] || '#ffffff';
        const infoLines = [
            `Elemento: ${ElementTable.names[creature.element]}`,
            `Nível: ${creature.level} | XP: ${creature.xp}/${EvolutionSystem.xpForLevel(creature.level)}`,
            `Genética: ${Helpers.geneticStars(creature.genetics)} | Tier: ${creature.tier}`,
            `Raridade: ${creature.rarity}`,
            ``,
            `HP: ${creature.currentHp}/${creature.getMaxHp()}`,
            `Ataque: ${creature.getEffectiveStat('attack')}`,
            `Defesa: ${creature.getEffectiveStat('defense')}`,
            `Velocidade: ${creature.getEffectiveStat('speed')}`,
            `Chance Crítica: ${(creature.getEffectiveCritChance() * 100).toFixed(1)}%`,
            ``,
            `Ataques: ${creature.moves.map(m => MovesDB[m]?.name || m).join(', ')}`,
            `Traits: ${creature.traits.length > 0 ? creature.traits.join(', ') : 'nenhum'}`,
        ];

        infoLines.forEach((line, i) => {
            const text = this.add.text(cx - 170, cy + 5 + i * 18, line, {
                fontFamily: 'Courier New', fontSize: '11px', color: line.startsWith('Elemento') ? elemColor : '#cccccc'
            });
            overlay.add(text);
        });

        // Close
        const closeBtn = this.add.text(cx, h / 2 + 190, '[ Fechar ]', {
            fontFamily: 'Courier New', fontSize: '14px', color: '#e74c3c',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        closeBtn.on('pointerdown', () => overlay.destroy());
        overlay.add(closeBtn);
    }

    renderItems(startY) {
        InventoryUI.createItemList(this, this.playerData.inventory, 20, startY);

        this.add.text(CONST.GAME_WIDTH / 2, CONST.GAME_HEIGHT - 50,
            `💰 Ouro: ${Helpers.formatNumber(this.playerData.gold)} | 🏦 Banco: ${Helpers.formatNumber(this.playerData.bankGold)}`, {
            fontFamily: 'Courier New', fontSize: '13px', color: '#f1c40f'
        }).setOrigin(0.5);
    }

    renderAchievements(startY) {
        const achievements = this.achievementSystem.achievements;
        let y = startY;

        Object.values(achievements).forEach(ach => {
            const icon = ach.unlocked ? '✅' : '🔒';
            const color = ach.unlocked ? '#2ecc71' : '#666666';

            this.add.text(30, y, `${icon} ${ach.name}`, {
                fontFamily: 'Courier New', fontSize: '12px', color: color, fontStyle: 'bold'
            });

            this.add.text(30, y + 16, ach.description, {
                fontFamily: 'Courier New', fontSize: '10px', color: '#888888'
            });

            if (ach.unlocked && ach.bonus) {
                const bonusStr = Object.entries(ach.bonus)
                    .map(([k, v]) => `+${(v * 100).toFixed(0)}% ${k}`)
                    .join(', ');
                this.add.text(30, y + 30, `Bônus: ${bonusStr}`, {
                    fontFamily: 'Courier New', fontSize: '9px', color: '#f1c40f'
                });
            }

            y += 50;
        });
    }

    renderStats(startY) {
        const stats = this.playerData.stats;
        const cx = CONST.GAME_WIDTH / 2;

        const lines = [
            `👤 ${this.playerData.name}`,
            `💰 Ouro: ${Helpers.formatNumber(this.playerData.gold)} | Banco: ${Helpers.formatNumber(this.playerData.bankGold)}`,
            `🏅 Badges: ${this.playerData.badges.length > 0 ? this.playerData.badges.join(', ') : 'Nenhum'}`,
            ``,
            `📊 ESTATÍSTICAS`,
            `Batalhas vencidas: ${stats.battlesWon}`,
            `Batalhas perdidas: ${stats.battlesLost}`,
            `Capturas: ${stats.captures}`,
            `Evoluções: ${stats.evolutions}`,
            `Fusões (sucesso): ${stats.fusions}`,
            `Fusões (falha): ${stats.fusionsFailed}`,
            `Breeding: ${stats.breeds}`,
            `Shinies encontrados: ${stats.shiniesFound}`,
            `Ouro total ganho: ${Helpers.formatNumber(stats.totalGoldEarned)}`,
            ``,
            `🐾 Time: ${this.playerData.party.length}/${CONST.MAX_PARTY_SIZE}`,
            `📦 Armazém: ${this.playerData.storage.length} criaturas`,
        ];

        lines.forEach((line, i) => {
            const isBold = line.startsWith('📊') || line.startsWith('👤');
            this.add.text(cx, startY + i * 22, line, {
                fontFamily: 'Courier New',
                fontSize: isBold ? '14px' : '12px',
                color: isBold ? '#f1c40f' : '#cccccc',
                fontStyle: isBold ? 'bold' : 'normal'
            }).setOrigin(0.5);
        });

        // Achievement bonuses
        const bonuses = this.achievementSystem.getTotalBonuses();
        this.add.text(cx, startY + lines.length * 22 + 10,
            `🎯 Bônus: Captura +${(bonuses.captureRate * 100).toFixed(0)}% | Crit +${(bonuses.critRate * 100).toFixed(0)}% | Loot +${(bonuses.lootRate * 100).toFixed(0)}%`, {
            fontFamily: 'Courier New', fontSize: '10px', color: '#9b59b6'
        }).setOrigin(0.5);
    }

    renderWorldMap(startY) {
        const w = CONST.GAME_WIDTH;
        const currentMapId = this.playerData.currentMap || 'town';

        this.add.text(w / 2, startY + 8, '🗺️ MAPA MUNDIAL', {
            fontFamily: 'Courier New', fontSize: '14px', color: '#f1c40f', fontStyle: 'bold'
        }).setOrigin(0.5);

        const currentMap = MapsDB[currentMapId];
        this.add.text(w / 2, startY + 26, `📍 Localização atual: ${currentMap ? currentMap.name : '?'}`, {
            fontFamily: 'Courier New', fontSize: '11px', color: '#2ecc71'
        }).setOrigin(0.5);

        const nodes = [
            { id: 'ilha_misteriosa', label: 'Ilha\nMisteriosa',    x: 140, y: startY + 70,  color: 0x1a5276 },
            { id: 'porto_costa',     label: 'Porto da\nCosta',      x: 140, y: startY + 160, color: 0x2471a3 },
            { id: 'route2',          label: 'Rota 2\nCosta Azul',   x: 310, y: startY + 160, color: 0x239b56 },
            { id: 'route1',          label: 'Rota 1\nTrilha Verde', x: 490, y: startY + 160, color: 0x1e8449 },
            { id: 'town',            label: 'Vila\nAurora',         x: 655, y: startY + 160, color: 0x7d3c98 },
            { id: 'route3',          label: 'Rota 3\nPico Sombrio', x: 310, y: startY + 255, color: 0x5d6d7e },
            { id: 'cave',            label: 'Caverna\ndas Sombras', x: 490, y: startY + 255, color: 0x4a235a },
            { id: 'floresta_sombria',label: 'Floresta\nSombria',    x: 490, y: startY + 350, color: 0x145a32 },
            { id: 'templo_antigo',   label: 'Templo\nAntigo',       x: 490, y: startY + 440, color: 0x512e5f },
        ];

        const connections = [
            ['ilha_misteriosa', 'porto_costa'],
            ['porto_costa',     'route2'],
            ['route2',          'route1'],
            ['route1',          'town'],
            ['route2',          'route3'],
            ['route1',          'cave'],
            ['cave',            'floresta_sombria'],
            ['floresta_sombria','templo_antigo'],
        ];

        const nodeMap = {};
        nodes.forEach(n => { nodeMap[n.id] = n; });

        const gfx = this.add.graphics();
        connections.forEach(([a, b]) => {
            const na = nodeMap[a];
            const nb = nodeMap[b];
            if (!na || !nb) return;
            gfx.lineStyle(2, 0x666666, 1);
            gfx.beginPath();
            gfx.moveTo(na.x, na.y);
            gfx.lineTo(nb.x, nb.y);
            gfx.strokePath();
        });

        const nw = 98, nh = 40;
        nodes.forEach(node => {
            const isCurrent = node.id === currentMapId;

            const rect = this.add.rectangle(node.x, node.y, nw, nh, node.color, 1);
            rect.setStrokeStyle(isCurrent ? 3 : 1, isCurrent ? 0xf1c40f : 0x888888);

            this.add.text(node.x, node.y, node.label, {
                fontFamily: 'Courier New',
                fontSize: '9px',
                color: isCurrent ? '#f1c40f' : '#dddddd',
                align: 'center'
            }).setOrigin(0.5);

            if (isCurrent) {
                this.add.text(node.x, node.y - nh / 2 - 12, '📍', { fontSize: '14px' }).setOrigin(0.5);
            }
        });

        // Arenas annotation on Route 3
        this.add.text(310, startY + 295, '🔥 🧊 Líderes', {
            fontFamily: 'Courier New', fontSize: '9px', color: '#aaaaaa', align: 'center'
        }).setOrigin(0.5);

        // Legend
        const lx = 655, ly = startY + 270;
        this.add.rectangle(lx, ly + 60, 130, 120, 0x0a0a1e, 0.9)
            .setStrokeStyle(1, 0x444444);
        const legend = [
            { color: '#27ae60', label: '  Rota (encontros)' },
            { color: '#7d3c98', label: '  Cidade / Vila' },
            { color: '#2471a3', label: '  Costa / Porto' },
            { color: '#4a235a', label: '  Caverna / Dungeon' },
            { color: '#512e5f', label: '  Templo / Especial' },
        ];
        legend.forEach((item, i) => {
            this.add.rectangle(lx - 52, ly + 20 + i * 20, 10, 10, parseInt(item.color.replace('#', '0x')));
            this.add.text(lx - 45, ly + 14 + i * 20, item.label, {
                fontFamily: 'Courier New', fontSize: '9px', color: item.color
            });
        });
    }

    openFusion() {
        this.scene.launch('FusionScene', {
            playerData: this.playerData,
            onClose: () => {
                this.scene.resume();
            }
        });
        this.scene.pause();
    }

    openBreeding() {
        this.scene.launch('BreedingScene', {
            playerData: this.playerData,
            onClose: () => {
                this.scene.resume();
            }
        });
        this.scene.pause();
    }

    close() {
        this.scene.stop();
        if (this.onClose) this.onClose();
    }
}