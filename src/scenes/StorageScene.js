// ============================================
// STORAGE SCENE — Mover criaturas entre time e armazém
// ============================================

class StorageScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StorageScene' });
    }

    init(data) {
        this.playerData = data.playerData;
        this.onClose = data.onClose;
    }

    create() {
        this.buildPanel();
    }

    buildPanel() {
        this.children.removeAll(true);

        const W = CONST.GAME_WIDTH;
        const H = CONST.GAME_HEIGHT;

        // Fundo
        this.add.rectangle(W / 2, H / 2, W, H, 0x0a0a1e, 0.98)
            .setStrokeStyle(2, 0x3498db);

        // Título
        this.add.text(W / 2, 30, '📦 MOVER CRIATURAS', {
            fontFamily: 'Courier New', fontSize: '16px', color: '#f1c40f', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Cabeçalhos
        this.add.text(210, 58, `TIME (${this.playerData.party.length}/${CONST.MAX_PARTY_SIZE})`, {
            fontFamily: 'Courier New', fontSize: '12px', color: '#2ecc71', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add.text(590, 58, `ARMAZÉM (${this.playerData.storage.length})`, {
            fontFamily: 'Courier New', fontSize: '12px', color: '#e67e22', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Divisor vertical
        const div = this.add.graphics();
        div.lineStyle(1, 0x444444, 1);
        div.beginPath(); div.moveTo(400, 48); div.lineTo(400, H - 50); div.strokePath();

        // Instrução
        this.add.text(W / 2, H - 38, 'Clique em uma criatura para mover de lado', {
            fontFamily: 'Courier New', fontSize: '10px', color: '#888888'
        }).setOrigin(0.5);

        // Botão fechar
        const closeBtn = this.add.text(W / 2, H - 18, '[ Fechar ]', {
            fontFamily: 'Courier New', fontSize: '13px', color: '#e74c3c',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => {
            this.scene.stop();
            if (this.onClose) this.onClose();
        });

        // --- TIME (esquerda) ---
        if (this.playerData.party.length === 0) {
            this.add.text(210, 110, 'Time vazio', {
                fontFamily: 'Courier New', fontSize: '11px', color: '#666666'
            }).setOrigin(0.5);
        }

        this.playerData.party.forEach((creature, i) => {
            const cx = 210, cy = 88 + i * 72;
            const row = this.add.rectangle(cx, cy, 370, 64, 0x1a1a2e)
                .setStrokeStyle(1, 0x2ecc71)
                .setInteractive({ useHandCursor: true });

            row.on('pointerover', () => row.setStrokeStyle(2, 0xf1c40f));
            row.on('pointerout', () => row.setStrokeStyle(1, 0x2ecc71));
            row.on('pointerdown', () => {
                if (this.playerData.party.length <= 1) {
                    this._notify('O time precisa ter ao menos 1 criatura!', '#e74c3c');
                    return;
                }
                this.playerData.party.splice(i, 1);
                this.playerData.storage.push(creature);
                this.buildPanel();
            });

            const hpRatio = creature.currentHp / creature.getMaxHp();
            const hpColor = hpRatio > 0.5 ? '#2ecc71' : hpRatio > 0.25 ? '#f1c40f' : '#e74c3c';
            const shiny = creature.isShiny ? '✨' : '';
            const elemColor = CONST.ELEMENT_COLORS[creature.element] || '#aaaaaa';

            this.add.text(cx - 170, cy - 22, `${shiny}${creature.name} Lv.${creature.level}`, {
                fontFamily: 'Courier New', fontSize: '13px', color: '#ffffff', fontStyle: 'bold'
            });
            this.add.text(cx - 170, cy - 6, `${ElementTable.names[creature.element]} | ${Helpers.geneticStars(creature.genetics)} | T${creature.tier}`, {
                fontFamily: 'Courier New', fontSize: '10px', color: elemColor
            });
            this.add.text(cx - 170, cy + 10, `HP: ${creature.currentHp}/${creature.getMaxHp()}`, {
                fontFamily: 'Courier New', fontSize: '10px', color: hpColor
            });
            this.add.text(cx + 155, cy, '→', {
                fontFamily: 'Courier New', fontSize: '20px', color: '#555555'
            }).setOrigin(0.5);
        });

        // --- ARMAZÉM (direita) ---
        const maxVisible = 7;
        if (this.playerData.storage.length === 0) {
            this.add.text(590, 110, 'Armazém vazio', {
                fontFamily: 'Courier New', fontSize: '11px', color: '#666666'
            }).setOrigin(0.5);
        } else if (this.playerData.storage.length > maxVisible) {
            this.add.text(590, 68, `(primeiras ${maxVisible} de ${this.playerData.storage.length})`, {
                fontFamily: 'Courier New', fontSize: '9px', color: '#888888'
            }).setOrigin(0.5);
        }

        const canAdd = this.playerData.party.length < CONST.MAX_PARTY_SIZE;

        this.playerData.storage.slice(0, maxVisible).forEach((creature, i) => {
            const cx = 590, cy = 88 + i * 72;
            const row = this.add.rectangle(cx, cy, 370, 64, 0x1a1a2e)
                .setStrokeStyle(1, canAdd ? 0xe67e22 : 0x444444)
                .setInteractive({ useHandCursor: canAdd });

            if (canAdd) {
                row.on('pointerover', () => row.setStrokeStyle(2, 0xf1c40f));
                row.on('pointerout', () => row.setStrokeStyle(1, 0xe67e22));
            }
            row.on('pointerdown', () => {
                if (!canAdd) {
                    this._notify('Time está cheio! (máx. 6)', '#e74c3c');
                    return;
                }
                this.playerData.storage.splice(i, 1);
                this.playerData.party.push(creature);
                this.buildPanel();
            });

            const shiny = creature.isShiny ? '✨' : '';
            const elemColor = CONST.ELEMENT_COLORS[creature.element] || '#aaaaaa';
            const nameColor = canAdd ? '#ffffff' : '#777777';

            this.add.text(cx - 170, cy - 22, `${shiny}${creature.name} Lv.${creature.level}`, {
                fontFamily: 'Courier New', fontSize: '13px', color: nameColor, fontStyle: 'bold'
            });
            this.add.text(cx - 170, cy - 6, `${ElementTable.names[creature.element]} | ${Helpers.geneticStars(creature.genetics)} | T${creature.tier}`, {
                fontFamily: 'Courier New', fontSize: '10px', color: elemColor
            });
            this.add.text(cx - 170, cy + 10, `HP: ${creature.currentHp}/${creature.getMaxHp()}`, {
                fontFamily: 'Courier New', fontSize: '10px', color: '#aaaaaa'
            });
            this.add.text(cx - 180, cy, '←', {
                fontFamily: 'Courier New', fontSize: '20px', color: '#555555'
            }).setOrigin(0.5);
        });
    }

    _notify(msg, color = '#ffffff') {
        const W = CONST.GAME_WIDTH;
        const notif = this.add.text(W / 2, 80, msg, {
            fontFamily: 'Courier New', fontSize: '13px', color,
            backgroundColor: '#000000', padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setDepth(999);

        this.tweens.add({
            targets: notif, y: 60, alpha: 0, duration: 2000, ease: 'Power2',
            onComplete: () => notif.destroy()
        });
    }
}
