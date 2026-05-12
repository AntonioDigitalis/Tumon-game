// ============================================
// BREEDING SCENE — Interface de reprodução
// ============================================

class BreedingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BreedingScene' });
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

        this.add.text(w / 2, 25, '🧬 BREEDING / REPRODUÇÃO', {
            fontFamily: 'Courier New', fontSize: '20px', color: '#2ecc71', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(w / 2, 50, 'Duas criaturas Lv.10+ geram um filhote com genética herdada', {
            fontFamily: 'Courier New', fontSize: '11px', color: '#888888'
        }).setOrigin(0.5);

        const allCreatures = [...this.playerData.party, ...this.playerData.storage];
        this.createCreatureList(allCreatures);

        this.sel1Text = this.add.text(150, h - 140, 'Pai/Mãe 1: ---', {
            fontFamily: 'Courier New', fontSize: '12px', color: '#3498db'
        });
        this.sel2Text = this.add.text(400, h - 140, 'Pai/Mãe 2: ---', {
            fontFamily: 'Courier New', fontSize: '12px', color: '#e74c3c'
        });

        this.statusText = this.add.text(w / 2, h - 100, '', {
            fontFamily: 'Courier New', fontSize: '14px', color: '#f1c40f'
        }).setOrigin(0.5);

        const breedBtn = this.add.text(w / 2, h - 60, '[ REPRODUZIR ]', {
            fontFamily: 'Courier New', fontSize: '18px', color: '#2ecc71',
            backgroundColor: '#2c3e50', padding: { x: 20, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        breedBtn.on('pointerdown', () => this.attemptBreeding());

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
            if (y > CONST.GAME_HEIGHT - 180) return;

            const bg = this.add.rectangle(CONST.GAME_WIDTH / 2, y + 12, CONST.GAME_WIDTH - 40, 30, 0x1a1a2e, 0.8);
            bg.setStrokeStyle(1, 0x444444);
            bg.setInteractive({ useHandCursor: true });

            const text = this.add.text(30, y + 4,
                `${creature.isShiny ? '✨' : ''} ${creature.name} Lv.${creature.level} | ${Helpers.geneticStars(creature.genetics)} | ${ElementTable.names[creature.element]}`,
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
            this.sel1Text.setText(`Pai/Mãe 1: ${creature.name} Lv.${creature.level}`);
        } else if (!this.selected2 && creature.uid !== this.selected1.uid) {
            this.selected2 = creature;
            this.sel2Text.setText(`Pai/Mãe 2: ${creature.name} Lv.${creature.level}`);

            const check = BreedingSystem.canBreed(this.selected1, this.selected2);
            this.statusText.setText(check.reason);
            this.statusText.setColor(check.can ? '#2ecc71' : '#e74c3c');
        } else {
            this.selected1 = creature;
            this.selected2 = null;
            this.sel1Text.setText(`Pai/Mãe 1: ${creature.name} Lv.${creature.level}`);
            this.sel2Text.setText('Pai/Mãe 2: ---');
            this.statusText.setText('');
        }
    }

    attemptBreeding() {
        const result = BreedingSystem.breed(this.selected1, this.selected2);

        if (!result.success) {
            this.statusText.setText(result.reason);
            this.statusText.setColor('#e74c3c');
            return;
        }

        const child = result.child;
        const where = this.playerData.addCreature(child);
        this.playerData.stats.breeds++;

        const shinyText = child.isShiny ? ' ✨SHINY!' : '';
        this.statusText.setText(
            `🎉 ${child.name} nasceu! ${Helpers.geneticStars(child.genetics)}${shinyText} (${where === 'party' ? 'Time' : 'Armazém'})`
        );
        this.statusText.setColor('#2ecc71');

        this.cameras.main.flash(500, 46, 204, 113);

        // Reset
        this.selected1 = null;
        this.selected2 = null;
        this.sel1Text.setText('Pai/Mãe 1: ---');
        this.sel2Text.setText('Pai/Mãe 2: ---');

        this.time.delayedCall(2000, () => {
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