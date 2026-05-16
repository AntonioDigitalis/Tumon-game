// ============================================
// MENU SCENE — Tela título
// ============================================

class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const w = CONST.GAME_WIDTH;
        const h = CONST.GAME_HEIGHT;

        if (this.textures.exists('title_bg')) {
            this.add.image(w / 2, h / 2, 'title_bg').setDisplaySize(w, h);
        } else {
            this.add.rectangle(w / 2, h / 2, w, h, 0x0a0a1e);
            for (let i = 0; i < 50; i++) {
                const star = this.add.circle(
                    Math.random() * w, Math.random() * h,
                    Math.random() * 2 + 1, 0xffffff, Math.random() * 0.5 + 0.3
                );
                this.tweens.add({ targets: star, alpha: 0.1, duration: 1000 + Math.random() * 2000, yoyo: true, repeat: -1 });
            }
            const title = this.add.text(w / 2, h * 0.25, 'TUMON', {
                fontFamily: 'Courier New', fontSize: '52px', color: '#f1c40f',
                fontStyle: 'bold', stroke: '#000000', strokeThickness: 6
            }).setOrigin(0.5);
            this.tweens.add({ targets: title, y: title.y - 5, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
            this.add.text(w / 2, h * 0.45, 'Capture • Evolua • Funda • Domine', {
                fontFamily: 'Courier New', fontSize: '14px', color: '#3498db'
            }).setOrigin(0.5);
        }

        const hasSave = saveSystem.hasSave();
        const panelH = hasSave ? 120 : 70;
        this.add.rectangle(w / 2, h * 0.685, 310, panelH, 0x000000, 0.6).setDepth(1);

        if (hasSave) {
            this.createButton(w / 2, h * 0.625, 'Continuar Jogo', '#ecf0f1', () => this.continueGame());
            this.createButton(w / 2, h * 0.745, 'Reiniciar Jogo', '#e74c3c', () => this.confirmRestart());
        } else {
            this.createButton(w / 2, h * 0.685, 'Novo Jogo', '#ecf0f1', () => this.newGame());
        }

        this.add.text(w - 10, h - 15, 'MVP v0.1', {
            fontFamily: 'Courier New', fontSize: '10px', color: '#aaaaaa',
            stroke: '#000000', strokeThickness: 3
        }).setOrigin(1).setDepth(1);

        this.add.text(w / 2, 12, 'Controles: WASD/Setas = Mover | E = Interagir | I = Inventário | ESC = Menu', {
            fontFamily: 'Courier New', fontSize: '10px', color: '#cccccc',
            stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5, 0).setDepth(1);
    }

    createButton(x, y, text, color, callback) {
        const btn = this.add.text(x, y, `[ ${text} ]`, {
            fontFamily: 'Courier New',
            fontSize: '18px',
            color: color,
            backgroundColor: '#1a1a2e',
            padding: { x: 20, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(2);

        btn.on('pointerover', () => btn.setColor('#f1c40f'));
        btn.on('pointerout', () => btn.setColor(color));
        btn.on('pointerdown', callback);
        return btn;
    }

    confirmRestart() {
        const w = CONST.GAME_WIDTH;
        const h = CONST.GAME_HEIGHT;
        const els = [];

        const overlay = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.78).setDepth(20);
        els.push(overlay);

        els.push(this.add.rectangle(w / 2, h / 2, 430, 200, 0x0d0d1e).setDepth(21));
        els.push(this.add.rectangle(w / 2, h / 2, 430, 200).setStrokeStyle(2, 0xe74c3c).setDepth(21));

        els.push(this.add.text(w / 2, h / 2 - 68, 'REINICIAR O JOGO?', {
            fontFamily: 'Courier New', fontSize: '20px', color: '#e74c3c', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5).setDepth(22));

        els.push(this.add.text(w / 2, h / 2 - 22, 'Todo o seu progresso será perdido!\nEsta ação não pode ser desfeita.', {
            fontFamily: 'Courier New', fontSize: '13px', color: '#ecf0f1', align: 'center'
        }).setOrigin(0.5).setDepth(22));

        const confirmBtn = this.add.text(w / 2 - 95, h / 2 + 60, '[ Sim, reiniciar ]', {
            fontFamily: 'Courier New', fontSize: '15px', color: '#e74c3c',
            backgroundColor: '#2d0f0f', padding: { x: 14, y: 7 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(22);
        els.push(confirmBtn);

        const cancelBtn = this.add.text(w / 2 + 85, h / 2 + 60, '[ Cancelar ]', {
            fontFamily: 'Courier New', fontSize: '15px', color: '#ecf0f1',
            backgroundColor: '#0f1a0f', padding: { x: 14, y: 7 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(22);
        els.push(cancelBtn);

        const closeDialog = () => els.forEach(e => e.destroy());

        confirmBtn.on('pointerover', () => confirmBtn.setColor('#ff6b6b'));
        confirmBtn.on('pointerout', () => confirmBtn.setColor('#e74c3c'));
        confirmBtn.on('pointerdown', () => this.newGame());

        cancelBtn.on('pointerover', () => cancelBtn.setColor('#f1c40f'));
        cancelBtn.on('pointerout', () => cancelBtn.setColor('#ecf0f1'));
        cancelBtn.on('pointerdown', closeDialog);
    }

    newGame() {
        saveSystem.deleteSave();
        const defaultData = saveSystem.getDefaultSaveData();
        const starterChoices = ['embrill', 'aquafen', 'thornvine'];
        const starterId = Helpers.randomPick(starterChoices);
        const starter = new Creature(starterId, 5, 1);
        defaultData.party = [starter.serialize()];
        saveSystem.save(defaultData);
        this.scene.start('WorldScene');
    }

    continueGame() {
        this.scene.start('WorldScene');
    }
}
