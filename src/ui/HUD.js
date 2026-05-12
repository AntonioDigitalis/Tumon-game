// ============================================
// HUD — Interface principal durante exploração
// ============================================

class HUD {
    constructor(scene) {
        this.scene = scene;
        this.container = null;
    }

    create(playerData) {
        this.container = this.scene.add.container(0, 0).setDepth(900).setScrollFactor(0);

        // Top bar
        const topBar = this.scene.add.rectangle(CONST.GAME_WIDTH / 2, 16, CONST.GAME_WIDTH, 32, 0x000000, 0.7);
        topBar.setScrollFactor(0);

        // Map name
        this.mapName = this.scene.add.text(10, 6, '', {
            fontFamily: 'Courier New',
            fontSize: '13px',
            color: '#f1c40f'
        }).setScrollFactor(0);

        // Gold
        this.goldText = this.scene.add.text(CONST.GAME_WIDTH - 10, 6, '', {
            fontFamily: 'Courier New',
            fontSize: '13px',
            color: '#f1c40f'
        }).setScrollFactor(0).setOrigin(1, 0);

        // Party indicators
        this.partyIcons = [];
        for (let i = 0; i < CONST.MAX_PARTY_SIZE; i++) {
            const icon = this.scene.add.circle(CONST.GAME_WIDTH / 2 - 50 + i * 20, 16, 6, 0x333333);
            icon.setScrollFactor(0);
            this.partyIcons.push(icon);
        }

        this.container.add([topBar, this.mapName, this.goldText, ...this.partyIcons]);
    }

    update(playerData, mapName) {
        if (this.mapName) this.mapName.setText(`📍 ${mapName}`);
        if (this.goldText) this.goldText.setText(`💰 ${Helpers.formatNumber(playerData.gold)}`);

        // Update party icons
        this.partyIcons.forEach((icon, i) => {
            if (i < playerData.party.length) {
                const c = playerData.party[i];
                const color = Helpers.hexToInt(CONST.ELEMENT_COLORS[c.element] || '#bdc3c7');
                icon.setFillStyle(c.isAlive() ? color : 0x666666);
                icon.setAlpha(c.isAlive() ? 1 : 0.4);
            } else {
                icon.setFillStyle(0x333333);
                icon.setAlpha(0.3);
            }
        });
    }

    showNotification(text, color = '#ffffff') {
        const notif = this.scene.add.text(CONST.GAME_WIDTH / 2, 50, text, {
            fontFamily: 'Courier New',
            fontSize: '14px',
            color: color,
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(950);

        this.scene.tweens.add({
            targets: notif,
            y: 30,
            alpha: 0,
            duration: 2500,
            ease: 'Power2',
            onComplete: () => notif.destroy()
        });
    }

    destroy() {
        if (this.container) this.container.destroy();
    }
}