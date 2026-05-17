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
        this._storagePage = 0;
    }

    create() {
        this.buildPanel();
    }

    buildPanel() {
        this.children.removeAll(true);

        const W = CONST.GAME_WIDTH;
        const H = CONST.GAME_HEIGHT;
        const PAGE = 6;
        const ROW_H = 72;
        const ROW_START_Y = 82;

        // Fundo
        this.add.rectangle(W / 2, H / 2, W, H, 0x0a0a1e, 0.98)
            .setStrokeStyle(2, 0x3498db);

        // Título
        this.add.text(W / 2, 22, '📦 MOVER CRIATURAS', {
            fontFamily: 'Courier New', fontSize: '16px', color: '#f1c40f', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Cabeçalhos
        this.add.text(210, 50, `TIME (${this.playerData.party.length}/${CONST.MAX_PARTY_SIZE})`, {
            fontFamily: 'Courier New', fontSize: '12px', color: '#2ecc71', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add.text(590, 50, `ARMAZÉM (${this.playerData.storage.length})`, {
            fontFamily: 'Courier New', fontSize: '12px', color: '#e67e22', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Divisor vertical
        const div = this.add.graphics();
        div.lineStyle(1, 0x444444, 1);
        div.beginPath(); div.moveTo(400, 42); div.lineTo(400, H - 46); div.strokePath();

        // Instrução + fechar
        this.add.text(W / 2, H - 30, 'Clique em uma criatura para mover de lado', {
            fontFamily: 'Courier New', fontSize: '10px', color: '#888888'
        }).setOrigin(0.5);

        const closeBtn = this.add.text(W / 2, H - 12, '[ Fechar ]', {
            fontFamily: 'Courier New', fontSize: '13px', color: '#e74c3c',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => {
            this.scene.stop();
            if (this.onClose) this.onClose();
        });

        // --- TIME (esquerda — sem scroll, máx 6) ---
        if (this.playerData.party.length === 0) {
            this.add.text(210, 140, 'Time vazio', {
                fontFamily: 'Courier New', fontSize: '11px', color: '#666666'
            }).setOrigin(0.5);
        }

        this.playerData.party.forEach((creature, i) => {
            const cx = 210, cy = ROW_START_Y + i * ROW_H;
            this._addCreatureRow(cx, cy, creature, true, () => {
                if (this.playerData.party.length <= 1) {
                    this._notify('O time precisa ter ao menos 1 criatura!', '#e74c3c');
                    return;
                }
                this.playerData.party.splice(i, 1);
                this.playerData.storage.unshift(creature);
                this.buildPanel();
            });
            this.add.text(cx + 155, cy, '→', {
                fontFamily: 'Courier New', fontSize: '20px', color: '#555555'
            }).setOrigin(0.5);
        });

        // --- ARMAZÉM (direita — com paginação) ---
        const total = this.playerData.storage.length;
        const maxPage = Math.max(0, Math.ceil(total / PAGE) - 1);
        if (this._storagePage > maxPage) this._storagePage = maxPage;

        const startIdx = this._storagePage * PAGE;
        const pageSlice = this.playerData.storage.slice(startIdx, startIdx + PAGE);
        const canAdd = this.playerData.party.length < CONST.MAX_PARTY_SIZE;

        if (total === 0) {
            this.add.text(590, 140, 'Armazém vazio', {
                fontFamily: 'Courier New', fontSize: '11px', color: '#666666'
            }).setOrigin(0.5);
        }

        pageSlice.forEach((creature, i) => {
            const realIdx = startIdx + i;
            const cx = 590, cy = ROW_START_Y + i * ROW_H;

            this._addCreatureRow(cx, cy, creature, canAdd, () => {
                if (!canAdd) {
                    this._notify('Time está cheio! (máx. 6)', '#e74c3c');
                    return;
                }
                this.playerData.storage.splice(realIdx, 1);
                this.playerData.party.push(creature);
                const newTotal = this.playerData.storage.length;
                const newMax = Math.max(0, Math.ceil(newTotal / PAGE) - 1);
                if (this._storagePage > newMax) this._storagePage = newMax;
                this.buildPanel();
            });
            this.add.text(cx - 180, cy, '←', {
                fontFamily: 'Courier New', fontSize: '20px', color: '#555555'
            }).setOrigin(0.5);
        });

        // Navegação de páginas (armazém)
        if (total > PAGE) {
            const navY = H - 52;

            // ◄ Anterior
            const prevBtn = this.add.text(430, navY, '◄ Ant.', {
                fontFamily: 'Courier New', fontSize: '13px',
                color: this._storagePage > 0 ? '#3498db' : '#333333',
                padding: { x: 6, y: 4 }
            }).setOrigin(0.5);
            if (this._storagePage > 0) {
                prevBtn.setInteractive({ useHandCursor: true });
                prevBtn.on('pointerdown', () => { this._storagePage--; this.buildPanel(); });
                prevBtn.on('pointerover', () => prevBtn.setColor('#7fc8f8'));
                prevBtn.on('pointerout',  () => prevBtn.setColor('#3498db'));
            }

            // Contador de página
            this.add.text(590, navY, `${startIdx + 1}–${Math.min(startIdx + PAGE, total)} / ${total}`, {
                fontFamily: 'Courier New', fontSize: '11px', color: '#aaaaaa'
            }).setOrigin(0.5);

            // Próx. ►
            const nextBtn = this.add.text(750, navY, 'Próx. ►', {
                fontFamily: 'Courier New', fontSize: '13px',
                color: startIdx + PAGE < total ? '#3498db' : '#333333',
                padding: { x: 6, y: 4 }
            }).setOrigin(0.5);
            if (startIdx + PAGE < total) {
                nextBtn.setInteractive({ useHandCursor: true });
                nextBtn.on('pointerdown', () => { this._storagePage++; this.buildPanel(); });
                nextBtn.on('pointerover', () => nextBtn.setColor('#7fc8f8'));
                nextBtn.on('pointerout',  () => nextBtn.setColor('#3498db'));
            }
        }

        // Scroll do mouse no armazém
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            if (pointer.x < 400) return; // só no lado direito
            if (deltaY > 0 && startIdx + PAGE < total) {
                this._storagePage++;
                this.buildPanel();
            } else if (deltaY < 0 && this._storagePage > 0) {
                this._storagePage--;
                this.buildPanel();
            }
        });
    }

    _addCreatureRow(cx, cy, creature, active, onClick) {
        const borderColor = cx < 400 ? 0x2ecc71 : (active ? 0xe67e22 : 0x444444);
        const row = this.add.rectangle(cx, cy, 370, 64, 0x1a1a2e)
            .setStrokeStyle(1, borderColor)
            .setInteractive({ useHandCursor: active });

        if (active) {
            row.on('pointerover', () => row.setStrokeStyle(2, 0xf1c40f));
            row.on('pointerout',  () => row.setStrokeStyle(1, borderColor));
        }
        row.on('pointerdown', onClick);

        const hpRatio = creature.currentHp / creature.getMaxHp();
        const hpColor = hpRatio > 0.5 ? '#2ecc71' : hpRatio > 0.25 ? '#f1c40f' : '#e74c3c';
        const shiny = creature.isShiny ? '✨' : '';
        const elemColor = CONST.ELEMENT_COLORS[creature.element] || '#aaaaaa';
        const nameColor = active ? '#ffffff' : '#777777';

        this.add.text(cx - 170, cy - 22, `${shiny}${creature.name} Lv.${creature.level}`, {
            fontFamily: 'Courier New', fontSize: '13px', color: nameColor, fontStyle: 'bold'
        });
        this.add.text(cx - 170, cy - 6, `${ElementTable.names[creature.element]} | ${Helpers.geneticStars(creature.genetics)} | T${creature.tier}`, {
            fontFamily: 'Courier New', fontSize: '10px', color: elemColor
        });
        this.add.text(cx - 170, cy + 10, `HP: ${creature.currentHp}/${creature.getMaxHp()}`, {
            fontFamily: 'Courier New', fontSize: '10px', color: hpColor
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
