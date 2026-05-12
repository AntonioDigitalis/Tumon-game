// ============================================
// FUSION SCENE — Interface de fusão
// ============================================

class FusionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FusionScene' });
    }

    init(data) {
        this.playerData = data.playerData;
        this.onClose = data.onClose;
        this.selected1 = null;
        this.selected2 = null;
    }

    create() {
        const w = CONST.GAME_WIDTH;
        const h = CONST.GAME_HEIGHT;

        this.add.rectangle(w / 2, h / 2, w, h, 0x0a0a1e);

        this.add.text(w / 2, 25, '🔮 FUSÃO DE CRIATURAS', {
            fontFamily: 'Courier New', fontSize: '20px', color: '#9b59b6', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(w / 2, 50, 'Mesma Genética + Mesmo Tier | 50% chance de sucesso', {
            fontFamily: 'Courier New', fontSize: '11px', color: '#888888'
        }).setOrigin(0.5);

        // Creature list
        const allCreatures = [...this.playerData.party, ...this.playerData.storage];
        this.createCreatureList(allCreatures);

        // Selected panels
        this.sel1Text = this.add.text(150, h - 140, 'Slot 1: ---', {
            fontFamily: 'Courier New', fontSize: '12px', color: '#3498db'
        });
        this.sel2Text = this.add.text(400, h - 140, 'Slot 2: ---', {
            fontFamily: 'Courier New', fontSize: '12px', color: '#e74c3c'
        });

        this.statusText = this.add.text(w / 2, h - 100, '', {
            fontFamily: 'Courier New', fontSize: '14px', color: '#f1c40f'
        }).setOrigin(0.5);

        // Fuse button
        const fuseBtn = this.add.text(w / 2, h - 60, '[ FUNDIR ]', {
            fontFamily: 'Courier New', fontSize: '18px', color: '#9b59b6',
            backgroundColor: '#2c3e50', padding: { x: 20, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        fuseBtn.on('pointerdown', () => this.attemptFusion());

        // Close button
        const closeBtn = this.add.text(w / 2, h - 25, '[ Voltar ]', {
            fontFamily: 'Courier New', fontSize: '14px', color: '#e74c3c',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        closeBtn.on('pointerdown', () => this.close());

        this.input.keyboard.on('keydown-ESC', () => this.close());
    }

    createCreatureList(creatures) {
        const startY = 80;
        creatures.forEach((creature, i) => {
            const y = startY + i * 35;
            if (y > CONST.GAME_HEIGHT - 180) return; // Limit display

            const bg = this.add.rectangle(CONST.GAME_WIDTH / 2, y + 12, CONST.GAME_WIDTH - 40, 30, 0x1a1a2e, 0.8);
            bg.setStrokeStyle(1, 0x444444);
            bg.setInteractive({ useHandCursor: true });

            const text = this.add.text(30, y + 4,
                `${creature.isShiny ? '✨' : ''} ${creature.name} Lv.${creature.level} | ${Helpers.geneticStars(creature.genetics)} | T${creature.tier} | ${ElementTable.names[creature.element]}`,
                { fontFamily: 'Courier New', fontSize: '11px', color: '#ecf0f1' }
            );

            bg.on('pointerover', () => bg.setStrokeStyle(1, 0xf1c40f));
            bg.on('pointerout', () => bg.setStrokeStyle(1, 0x444444));
            bg.on('pointerdown', () => this.selectCreature(creature));
        });
    }

    selectCreature(creature) {
        if (!this.selected1) {
            this.selected1 = creature;
            this.sel1Text.setText(`Slot 1: ${creature.name} (${Helpers.geneticStars(creature.genetics)} T${creature.tier})`);
        } else if (!this.selected2 && creature.uid !== this.selected1.uid) {
            this.selected2 = creature;
            this.sel2Text.setText(`Slot 2: ${creature.name} (${Helpers.geneticStars(creature.genetics)} T${creature.tier})`);

            // Check compatibility
            const check = FusionSystem.canFuse(this.selected1, this.selected2);
            this.statusText.setText(check.reason);
            this.statusText.setColor(check.can ? '#2ecc71' : '#e74c3c');
        } else {
            // Reset selection
            this.selected1 = creature;
            this.selected2 = null;
            this.sel1Text.setText(`Slot 1: ${creature.name} (${Helpers.geneticStars(creature.genetics)} T${creature.tier})`);
            this.sel2Text.setText('Slot 2: ---');
            this.statusText.setText('');
        }
    }

    attemptFusion() {
        const check = FusionSystem.canFuse(this.selected1, this.selected2);
        if (!check.can) {
            this.statusText.setText(check.reason);
            this.statusText.setColor('#e74c3c');
            return;
        }

        const result = FusionSystem.fuse(this.selected1, this.selected2);

        if (result.success) {
            // Remove lost creature
            this.playerData.removeCreature(result.lostCreature.uid);
            this.playerData.stats.fusions++;

            this.statusText.setText(`✅ Fusão bem-sucedida! ${result.resultCreature.name} subiu para Tier ${result.newTier}!`);
            this.statusText.setColor('#2ecc71');

            // Flash
            this.cameras.main.flash(500, 155, 89, 182);
        } else {
            // Remove lost creature
            this.playerData.removeCreature(result.lostCreature.uid);
            this.playerData.stats.fusionsFailed++;

            this.statusText.setText(`❌ Fusão falhou! ${result.lostCreature.name} foi perdido...`);
            this.statusText.setColor('#e74c3c');

            this.cameras.main.shake(300, 0.01);
        }

        // Reset selection
        this.selected1 = null;
        this.selected2 = null;
        this.sel1Text.setText('Slot 1: ---');
        this.sel2Text.setText('Slot 2: ---');

        // Rebuild list
        this.time.delayedCall(1500, () => {
            this.scene.restart({
                playerData: this.playerData,
                onClose: this.onClose
            });
        });
    }

    close() {
        this.scene.stop();
        if (this.onClose) this.onClose();
    }
}