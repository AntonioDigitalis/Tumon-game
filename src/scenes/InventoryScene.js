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
        this._reorderSelected = null;
        this._partyStartY = startY;
        this._buildPartyList();
    }

    _buildPartyList() {
        const w = CONST.GAME_WIDTH;
        const startY = this._partyStartY;

        if (this._partyContainer) this._partyContainer.destroy();
        this._partyContainer = this.add.container(0, 0);

        if (this.playerData.party.length === 0) {
            this._partyContainer.add(
                this.add.text(w / 2, startY + 50, 'Nenhuma criatura no time.', {
                    fontFamily: 'Courier New', fontSize: '14px', color: '#888888'
                }).setOrigin(0.5)
            );
            return;
        }

        // Dica quando uma criatura está selecionada para reordenar
        if (this._reorderSelected !== null) {
            const tip = this.add.text(w / 2, startY - 8,
                'Clique em outra criatura para trocar a posicao', {
                fontFamily: 'Courier New', fontSize: '10px', color: '#f1c40f'
            }).setOrigin(0.5);
            this._partyContainer.add(tip);
        }

        this.playerData.party.forEach((creature, i) => {
            const isSelected = this._reorderSelected === i;
            const cy = startY + i * 75;

            const bg = this.add.rectangle(195, cy + 30, 350, 65, 0x1a1a2e);
            bg.setStrokeStyle(isSelected ? 3 : 1, isSelected ? 0xf1c40f : (creature.isAlive() ? 0x3498db : 0xe74c3c));
            bg.setInteractive({ useHandCursor: true });
            bg.on('pointerover', () => { if (!isSelected) bg.setStrokeStyle(2, 0xf1c40f); });
            bg.on('pointerout', () => { if (!isSelected) bg.setStrokeStyle(1, creature.isAlive() ? 0x3498db : 0xe74c3c); });
            bg.on('pointerdown', () => {
                if (this._reorderSelected === null) {
                    this._showCreatureOptions(creature, i);
                } else if (this._reorderSelected === i) {
                    this._reorderSelected = null;
                    this._buildPartyList();
                } else {
                    const a = this._reorderSelected, b = i;
                    [this.playerData.party[a], this.playerData.party[b]] =
                        [this.playerData.party[b], this.playerData.party[a]];
                    this._reorderSelected = null;
                    this._buildPartyList();
                }
            });

            // SPRITE
            const spriteKeyRaw = creature.isShiny ? creature.spriteShinyKey : creature.spriteKey;
            const sprite = this.add.image(40, cy+30, getSpriteKey(this, spriteKeyRaw)).setDisplaySize(32, 32);

            const shiny = creature.isShiny ? '✨' : '';
            const nameText = this.add.text(60, cy + 8,
                `${shiny}${creature.name} Lv.${creature.level}${isSelected ? '  ◄' : ''}`, {
                fontFamily: 'Courier New', fontSize: '13px',
                color: isSelected ? '#f1c40f' : '#ffffff', fontStyle: 'bold'
            });

            const elemColor = CONST.ELEMENT_COLORS[creature.element] || '#ffffff';
            const infoText = this.add.text(60, cy + 26,
                `${ElementTable.names[creature.element]} | ${Helpers.geneticStars(creature.genetics)} | T${creature.tier}`, {
                fontFamily: 'Courier New', fontSize: '10px', color: elemColor
            });

            const hpRatio = creature.currentHp / creature.getMaxHp();
            const hpColor = hpRatio > 0.5 ? 0x2ecc71 : hpRatio > 0.25 ? 0xf1c40f : 0xe74c3c;
            const hpBg   = this.add.rectangle(275, cy + 20, 120, 10, 0x333333);
            const hpFill = this.add.rectangle(215, cy + 20, 120 * hpRatio, 10, hpColor).setOrigin(0, 0.5);
            const hpLabel = this.add.text(275, cy + 20,
                `${creature.currentHp}/${creature.getMaxHp()}`, {
                fontFamily: 'Courier New', fontSize: '9px', color: '#ffffff'
            }).setOrigin(0.5);

            const statsText = this.add.text(215, cy + 36,
                `ATK:${creature.getEffectiveStat('attack')} DEF:${creature.getEffectiveStat('defense')} SPD:${creature.getEffectiveStat('speed')}`, {
                fontFamily: 'Courier New', fontSize: '9px', color: '#aaaaaa'
            });

            this._partyContainer.add([bg, sprite, nameText, infoText, hpBg, hpFill, hpLabel, statsText]);
        });

        // Storage count + lista compacta
        const storageLabel = this.add.text(20, startY + this.playerData.party.length * 75 + 15,
            `Armazem: ${this.playerData.storage.length} criatura(s)`, {
            fontFamily: 'Courier New', fontSize: '11px', color: '#888888'
        });
        this._partyContainer.add(storageLabel);

        this.playerData.storage.slice(0, 5).forEach((creature, i) => {
            const sy = startY + this.playerData.party.length * 75 + 40 + i * 22;
            const t = this.add.text(30, sy,
                `${creature.isShiny ? '✨' : ''}${creature.name} Lv.${creature.level} ${Helpers.geneticStars(creature.genetics)}`, {
                fontFamily: 'Courier New', fontSize: '10px', color: '#666666'
            });
            this._partyContainer.add(t);
        });
    }

    _showCreatureOptions(creature, index) {
        const w = CONST.GAME_WIDTH;
        const h = CONST.GAME_HEIGHT;
        const popup = this.add.container(0, 0).setDepth(600);

        const blocker = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.45)
            .setInteractive();
        blocker.on('pointerdown', () => popup.destroy());
        popup.add(blocker);

        const bx = w / 2, by = h / 2;
        const box = this.add.rectangle(bx, by, 260, 170, 0x0d1b2a)
            .setStrokeStyle(2, 0x3498db);
        popup.add(box);

        const shiny = creature.isShiny ? '✨' : '';
        popup.add(this.add.text(bx, by - 60, `${shiny}${creature.name} Lv.${creature.level}`, {
            fontFamily: 'Courier New', fontSize: '14px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5));

        const makeBtn = (label, color, y, action) => {
            const btn = this.add.text(bx, y, label, {
                fontFamily: 'Courier New', fontSize: '13px', color,
                backgroundColor: '#1a2a3a', padding: { x: 18, y: 8 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            btn.on('pointerover', () => btn.setColor('#f1c40f'));
            btn.on('pointerout', () => btn.setColor(color));
            btn.on('pointerdown', action);
            popup.add(btn);
        };

        makeBtn('Ver Status', '#ffffff', by - 20, () => {
            popup.destroy();
            this.showCreatureDetail(creature);
        });
        makeBtn('Reordenar', '#3498db', by + 22, () => {
            popup.destroy();
            this._reorderSelected = index;
            this._buildPartyList();
        });
        makeBtn('Cancelar', '#666666', by + 64, () => popup.destroy());
    }

    showCreatureDetail(creature) {
        const w = CONST.GAME_WIDTH;
        const h = CONST.GAME_HEIGHT;

        const overlay = this.add.container(w / 2, h / 2).setDepth(500);

        // BACKGROUND
        const bg = this.add.rectangle(0, 0, 420, 440, 0x0a0a1e, 0.98);
        bg.setStrokeStyle(2, 0x3498db);
        overlay.add(bg);

        let y = -170;

        // SPRITE
        const spriteKeyRaw = creature.isShiny ? creature.spriteShinyKey : creature.spriteKey;
        const sprite = this.add.image(0, y, getSpriteKey(this, spriteKeyRaw)).setDisplaySize(96, 96);
        overlay.add(sprite);

        y += 60;

        // TITLE
        const title = this.add.text(0, y,`${creature.name}${creature.isShiny ? ' ✨' : ''}`,
            {
                fontFamily: 'Courier New',
                fontSize: '18px',
                color: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        overlay.add(title);

        y += 30;

        // ELEMENT COLOR
        const elemColor = CONST.ELEMENT_COLORS[creature.element] || '#ffffff';

        // INFO
        const infoLines = [
            `Elemento: ${ElementTable.names?.[creature.element] || creature.element}`,
            `Nível: ${creature.level} | XP: ${creature.xp}/${EvolutionSystem.xpForLevel(creature.level)}`,
            `Genética: ${Helpers.geneticStars(creature.genetics)} | Tier: ${creature.tier}`,
            `Raridade: ${creature.rarity}`,
            ``,
            `HP: ${creature.currentHp}/${creature.getMaxHp()}`,
            `Ataque: ${creature.getEffectiveStat('attack')}`,
            `Defesa: ${creature.getEffectiveStat('defense')}`,
            `Velocidade: ${creature.getEffectiveStat('speed')}`,
            `Crítico: ${(creature.getEffectiveCritChance() * 100).toFixed(1)}%`,
            ``,
            `Ataques:`,
            ...(creature.moves || []).map(m => `  • ${MovesDB[m]?.name || m}`),
            `Traits: ${creature.traits?.length ? creature.traits.join(', ') : 'nenhum'}`
        ];

        infoLines.forEach((line) => {
            const txt = this.add.text(-190, y, line, {
                fontFamily: 'Courier New',
                fontSize: '11px',
                color: line.startsWith('Elemento') ? elemColor : '#cccccc'
            });

            overlay.add(txt);
            y += 16;
        });

        // CLOSE BUTTON
        const closeBtn = this.add.text(0, y + 20, '[ Fechar ]', {
            fontFamily: 'Courier New',
            fontSize: '14px',
            color: '#e74c3c',
            backgroundColor: '#1a1a2e',
            padding: { x: 10, y: 5 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

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