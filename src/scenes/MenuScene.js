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

        // Background
        this.add.rectangle(w / 2, h / 2, w, h, 0x0a0a1e);

        // Stars
        for (let i = 0; i < 50; i++) {
            const star = this.add.circle(
                Math.random() * w, Math.random() * h,
                Math.random() * 2 + 1, 0xffffff, Math.random() * 0.5 + 0.3
            );
            this.tweens.add({
                targets: star,
                alpha: 0.1,
                duration: 1000 + Math.random() * 2000,
                yoyo: true,
                repeat: -1
            });
        }

        // Title
        const title = this.add.text(w / 2, h * 0.25, 'TUMON', {
            fontFamily: 'Courier New',
            fontSize: '52px',
            color: '#f1c40f',
            fontStyle: 'bold',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.tweens.add({
            targets: title,
            y: title.y - 5,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Subtitle
        this.add.text(w / 2, h * 0.45, 'Capture • Evolua • Funda • Domine', {
            fontFamily: 'Courier New',
            fontSize: '14px',
            color: '#3498db'
        }).setOrigin(0.5);

        // Buttons
        const hasSave = saveSystem.hasSave();

        if (hasSave) {
            this.createButton(w / 2, h * 0.6, 'Continuar Jogo', () => this.continueGame());
            this.createButton(w / 2, h * 0.68, 'Novo Jogo', () => this.newGame());
        } else {
            this.createButton(w / 2, h * 0.6, 'Novo Jogo', () => this.newGame());
        }

        // Version
        this.add.text(w - 10, h - 15, 'MVP v0.1', {
            fontFamily: 'Courier New',
            fontSize: '10px',
            color: '#555555'
        }).setOrigin(1);

        // Controls info
        this.add.text(w / 2, h * 0.85, 'Controles: WASD/Setas = Mover | E = Interagir | I = Inventário | ESC = Menu', {
            fontFamily: 'Courier New',
            fontSize: '10px',
            color: '#666666'
        }).setOrigin(0.5);
    }

    createButton(x, y, text, callback) {
        const btn = this.add.text(x, y, `[ ${text} ]`, {
            fontFamily: 'Courier New',
            fontSize: '18px',
            color: '#ecf0f1',
            backgroundColor: '#2c3e50',
            padding: { x: 20, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => btn.setColor('#f1c40f'));
        btn.on('pointerout', () => btn.setColor('#ecf0f1'));
        btn.on('pointerdown', callback);
    }

    newGame() {
        saveSystem.deleteSave();
        const defaultData = saveSystem.getDefaultSaveData();
        
        // Dar criatura inicial ao jogador
        const starterChoices = ['embrill', 'aquafen', 'thornvine'];
        // Por simplicidade no MVP, dá um aleatório
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