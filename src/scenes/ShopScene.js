// ============================================
// SHOP SCENE — Loja do mercador
// ============================================

class ShopScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ShopScene' });
    }

    init(data) {
        this.playerData = data.playerData;
        this.items = data.items || [];
        this.onClose = data.onClose;
    }

    create() {
        const W = CONST.GAME_WIDTH;
        const H = CONST.GAME_HEIGHT;

        // Fundo semitransparente
        this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.6);

        // Painel central
        const panelW = 380;
        const panelH = 340;
        const panelX = W / 2;
        const panelY = H / 2;

        this.add.rectangle(panelX, panelY, panelW, panelH, 0x000000, 0.92)
            .setStrokeStyle(2, 0xf1c40f);

        this.goldText = this.add.text(panelX, panelY - panelH / 2 + 18, `🛒 LOJA  |  💰 ${this.playerData.gold} ouro`, {
            fontFamily: 'Courier New', fontSize: '14px', color: '#f1c40f'
        }).setOrigin(0.5);

        this.items.slice(0, 8).forEach((itemId, i) => {
            const item = ItemsDB[itemId];
            if (!item) return;

            const rowY = panelY - 110 + i * 34;

            const btnBg = this.add.rectangle(panelX, rowY, 340, 28, 0x2c3e50)
                .setStrokeStyle(1, 0x555555)
                .setInteractive({ useHandCursor: true });

            const icon = this.add.image(panelX - 150, rowY, item.icon)
                .setDisplaySize(22, 22);

            const btnText = this.add.text(panelX - 120, rowY - 8, item.name, {
                fontFamily: 'Courier New', fontSize: '11px', color: '#ecf0f1'
            });

            const priceText = this.add.text(panelX + 120, rowY - 8, `${item.price} 💰`, {
                fontFamily: 'Courier New', fontSize: '11px', color: '#f1c40f'
            }).setOrigin(1, 0);

            btnBg.on('pointerover', () => btnBg.setFillStyle(0x34495e));
            btnBg.on('pointerout',  () => btnBg.setFillStyle(0x2c3e50));

            btnBg.on('pointerdown', () => {
                if (this.playerData.spendGold(item.price)) {
                    this.playerData.addItem(itemId);
                    this.goldText.setText(`🛒 LOJA  |  💰 ${this.playerData.gold} ouro`);
                    this.showFeedback(`✅ Comprou ${item.name}!`, '#2ecc71');
                } else {
                    this.showFeedback('💸 Ouro insuficiente!', '#e74c3c');
                }
            });
        });

        this.feedbackText = this.add.text(panelX, panelY + panelH / 2 - 45, '', {
            fontFamily: 'Courier New', fontSize: '12px', color: '#ffffff'
        }).setOrigin(0.5);

        const closeBtn = this.add.text(panelX, panelY + panelH / 2 - 18, '[ Fechar - ESC ]', {
            fontFamily: 'Courier New', fontSize: '14px', color: '#e74c3c',
            backgroundColor: '#1a1a2e', padding: { x: 14, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        closeBtn.on('pointerdown', () => this.close());
        this.input.keyboard.on('keydown-ESC', () => this.close());
    }

    showFeedback(msg, color) {
        this.feedbackText.setText(msg).setColor(color);
        this.time.delayedCall(1500, () => this.feedbackText.setText(''));
    }

    close() {
        this.scene.stop();
        if (this.onClose) this.onClose();
    }
}
