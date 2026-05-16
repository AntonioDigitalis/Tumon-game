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
            { key: 'stats', label: '📊 Stats' }
        ];

        tabs.forEach((tab, i) => {
            const tx = 30 + i * 130;
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

        const overlay = this.add.container(w / 2, h / 2).setDepth(500);

        // BACKGROUND
        const bg = this.add.rectangle(0, 0, 420, 440, 0x0a0a1e, 0.98);
        bg.setStrokeStyle(2, 0x3498db);
        overlay.add(bg);

        let y = -170;

        // SPRITE
        const spriteKeyRaw = creature.isShiny ? creature.spriteShinyKey : creature.spriteKey;
        const sprite = this.add.image(0, y, getSpriteKey(this, spriteKeyRaw)).setDisplaySize(64, 64);
        sprite.setScale(0.1);
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