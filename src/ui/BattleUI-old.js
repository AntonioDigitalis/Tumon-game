// ============================================
// BATTLE UI — Interface de combate
// ============================================

class BattleUI {
    constructor(scene) {
        this.scene = scene;
        this.elements = {};
    }

    create(playerCreature, enemyCreature) {
        const w = CONST.GAME_WIDTH;
        const h = CONST.GAME_HEIGHT;

        // Background
        this.elements.bg = this.scene.add.rectangle(w / 2, h / 2, w, h, 0x2d4a3e);

        // Enemy side (top)
        this.createCreaturePanel('enemy', enemyCreature, w - 250, 30, false);
        this.createCreatureSprite('enemy', enemyCreature, w - 180, 180);

        // Player side (bottom)
        this.createCreaturePanel('player', playerCreature, 30, h - 230, true);
        this.createCreatureSprite('player', playerCreature, 150, h - 280);

        // Action menu
        this.createActionMenu();

        // Log area
        this.elements.logBg = this.scene.add.rectangle(w / 2, h - 70, w - 20, 80, 0x000000, 0.8);
        this.elements.logBg.setStrokeStyle(1, 0x444444);
        this.elements.logText = this.scene.add.text(20, h - 100, '', {
            fontFamily: 'Courier New',
            fontSize: '14px',
            color: '#ffffff',
            wordWrap: { width: w - 40 }
        });
    }

    createCreaturePanel(key, creature, x, y, showXP) {
        const panel = this.scene.add.container(x, y);

        const bg = this.scene.add.rectangle(110, 40, 220, 80, 0x000000, 0.7);
        bg.setStrokeStyle(1, 0x888888);

        // Nome + Level
        const shinyIcon = creature.isShiny ? '✨ ' : '';
        const name = this.scene.add.text(10, 8, `${shinyIcon}${creature.name} Lv.${creature.level}`, {
            fontFamily: 'Courier New',
            fontSize: '14px',
            color: '#ffffff',
            fontStyle: 'bold'
        });

        // Elemento + Genética
        const elementColor = CONST.ELEMENT_COLORS[creature.element] || '#ffffff';
        const info = this.scene.add.text(10, 28, `${ElementTable.names[creature.element]} ${Helpers.geneticStars(creature.genetics)} T${creature.tier}`, {
            fontFamily: 'Courier New',
            fontSize: '11px',
            color: elementColor
        });

        // HP bar
        const hpBarBg = this.scene.add.rectangle(110, 55, 200, 14, 0x333333);
        const hpRatio = creature.currentHp / creature.getMaxHp();
        const hpColor = hpRatio > 0.5 ? 0x2ecc71 : hpRatio > 0.25 ? 0xf1c40f : 0xe74c3c;
        const hpBar = this.scene.add.rectangle(10 + (200 * hpRatio) / 2, 55, 200 * hpRatio, 14, hpColor);
        hpBar.setOrigin(0, 0.5);
        hpBar.x = 10;

        const hpText = this.scene.add.text(110, 55, `${creature.currentHp}/${creature.getMaxHp()}`, {
            fontFamily: 'Courier New',
            fontSize: '10px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Status
        const statusText = this.scene.add.text(180, 8, '', {
            fontFamily: 'Courier New',
            fontSize: '10px',
            color: '#ff6b6b'
        });

        panel.add([bg, name, info, hpBarBg, hpBar, hpText, statusText]);

        this.elements[`${key}Panel`] = panel;
        this.elements[`${key}HpBar`] = hpBar;
        this.elements[`${key}HpText`] = hpText;
        this.elements[`${key}Name`] = name;
        this.elements[`${key}Status`] = statusText;
    }

    createCreatureSprite(key, creature, x, y) {
        const size = key === 'player' ? 64 : 56;
        const sprite = this.scene.add.rectangle(x, y, size, size, creature.spriteColor);
        sprite.setStrokeStyle(2, 0xffffff);

        // Olhos
        const eyeSize = size / 8;
        const eyeY = y - size / 6;
        const eye1 = this.scene.add.circle(x - size / 5, eyeY, eyeSize, 0xffffff);
        const eye2 = this.scene.add.circle(x + size / 5, eyeY, eyeSize, 0xffffff);
        const pupil1 = this.scene.add.circle(x - size / 5 + 1, eyeY, eyeSize / 2, 0x000000);
        const pupil2 = this.scene.add.circle(x + size / 5 + 1, eyeY, eyeSize / 2, 0x000000);

        // Element icon (text)
        const elementSymbols = {
            fire: '🔥', water: '💧', plant: '🌿', electric: '⚡',
            earth: '🏔', ice: '❄', psychic: '🔮', dark: '🌑', normal: '⚪'
        };
        const elemIcon = this.scene.add.text(x, y + size / 2 + 10, elementSymbols[creature.element] || '', {
            fontSize: '16px'
        }).setOrigin(0.5);

        // Shiny sparkle
        if (creature.isShiny) {
            const sparkle = this.scene.add.text(x + size / 2, y - size / 2, '✨', { fontSize: '20px' });
            this.scene.tweens.add({
                targets: sparkle,
                alpha: 0.3,
                duration: 600,
                yoyo: true,
                repeat: -1
            });
        }

        this.elements[`${key}Sprite`] = sprite;

        // Idle animation
        this.scene.tweens.add({
            targets: sprite,
            y: y - 4,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createActionMenu() {
        const w = CONST.GAME_WIDTH;
        const h = CONST.GAME_HEIGHT;
        const menuX = w / 2;
        const menuY = h / 2 + 50;

        this.elements.actionMenu = this.scene.add.container(menuX, menuY);

        const bg = this.scene.add.rectangle(0, 0, 350, 200, 0x1a1a2e, 0.95);
        bg.setStrokeStyle(2, 0x3498db);
        this.elements.actionMenu.add(bg);

        this.elements.actionButtons = [];
    }

    showMainActions(onAttack, onCapture, onSwitch, onFlee, onItem) {
        this.clearActionButtons();
        const actions = [
            { text: '⚔️ Atacar', callback: onAttack, color: 0xe74c3c },
            { text: '🔮 Capturar', callback: onCapture, color: 0x9b59b6 },
            { text: '🔄 Trocar', callback: onSwitch, color: 0x3498db },
            { text: '🎒 Item', callback: onItem, color: 0x2ecc71 },
            { text: '🏃 Fugir', callback: onFlee, color: 0x95a5a6 }
        ];

        actions.forEach((action, i) => {
            const bx = (i % 3 - 1) * 110;
            const by = Math.floor(i / 3) * 50 - 40;
            this.addButton(bx, by, action.text, action.callback, action.color);
        });
    }

    showMoveActions(moves, onSelect, onBack) {
        this.clearActionButtons();
        moves.forEach((moveId, i) => {
            const move = MovesDB[moveId];
            if (!move) return;
            const bx = (i % 2 === 0 ? -1 : 1) * 80;
            const by = Math.floor(i / 2) * 45 - 50;
            const elemColor = Helpers.hexToInt(CONST.ELEMENT_COLORS[move.element] || '#ffffff');
            this.addButton(bx, by, `${move.name} (${move.power || '-'})`, () => onSelect(moveId), elemColor);
        });

        this.addButton(0, 60, '← Voltar', onBack, 0x666666);
    }

    showItemActions(inventory, onSelect, onBack) {
        this.clearActionButtons();
        const items = Object.entries(inventory)
            .filter(([id, qty]) => qty > 0 && ItemsDB[id])
            .slice(0, 4);

        items.forEach(([itemId, qty], i) => {
            const item = ItemsDB[itemId];
            const bx = (i % 2 === 0 ? -1 : 1) * 80;
            const by = Math.floor(i / 2) * 45 - 30;
            this.addButton(bx, by, `${item.name} (${qty})`, () => onSelect(itemId), 0x2ecc71);
        });

        this.addButton(0, 60, '← Voltar', onBack, 0x666666);
    }

    showSwitchActions(party, currentUid, onSelect, onBack) {
        this.clearActionButtons();
        const alive = party.filter(c => c.isAlive() && c.uid !== currentUid);

        alive.slice(0, 4).forEach((creature, i) => {
            const bx = (i % 2 === 0 ? -1 : 1) * 80;
            const by = Math.floor(i / 2) * 45 - 30;
            const color = Helpers.hexToInt(CONST.ELEMENT_COLORS[creature.element] || '#ffffff');
            this.addButton(bx, by, `${creature.name} Lv.${creature.level}`, () => onSelect(creature), color);
        });

        this.addButton(0, 60, '← Voltar', onBack, 0x666666);
    }

    addButton(x, y, label, callback, color = 0x333333) {
        const btn = this.scene.add.container(x, y);
        
        const bg = this.scene.add.rectangle(0, 0, 160, 35, color, 0.8);
        bg.setStrokeStyle(1, 0xffffff);
        bg.setInteractive({ useHandCursor: true });

        const text = this.scene.add.text(0, 0, label, {
            fontFamily: 'Courier New',
            fontSize: '12px',
            color: '#ffffff'
        }).setOrigin(0.5);

        bg.on('pointerover', () => bg.setFillStyle(color, 1));
        bg.on('pointerout', () => bg.setFillStyle(color, 0.8));
        bg.on('pointerdown', callback);

        btn.add([bg, text]);
        this.elements.actionMenu.add(btn);
        this.elements.actionButtons.push(btn);
    }

    clearActionButtons() {
        this.elements.actionButtons.forEach(btn => btn.destroy());
        this.elements.actionButtons = [];
    }

    updateHP(key, creature) {
        const hpBar = this.elements[`${key}HpBar`];
        const hpText = this.elements[`${key}HpText`];

        if (hpBar && hpText) {
            const ratio = creature.currentHp / creature.getMaxHp();
            const hpColor = ratio > 0.5 ? 0x2ecc71 : ratio > 0.25 ? 0xf1c40f : 0xe74c3c;

            this.scene.tweens.add({
                targets: hpBar,
                displayWidth: 200 * Math.max(0, ratio),
                duration: 400,
                onUpdate: () => {
                    hpBar.setFillStyle(hpColor);
                }
            });

            hpText.setText(`${creature.currentHp}/${creature.getMaxHp()}`);
        }

        // Update status
        const statusEl = this.elements[`${key}Status`];
        if (statusEl) {
            const statusLabels = { burn: '🔥BRN', poison: '☠PSN', freeze: '❄FRZ', stun: '⚡STN' };
            statusEl.setText(creature.status ? statusLabels[creature.status] || '' : '');
        }
    }

    setLogText(text) {
        if (this.elements.logText) {
            this.elements.logText.setText(text);
        }
    }

    showDamageNumber(key, amount, color = '#ffffff') {
        const sprite = this.elements[`${key}Sprite`];
        if (!sprite) return;

        const dmgText = this.scene.add.text(sprite.x, sprite.y - 40, `-${amount}`, {
            fontFamily: 'Courier New',
            fontSize: '20px',
            color: color,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        this.scene.tweens.add({
            targets: dmgText,
            y: dmgText.y - 30,
            alpha: 0,
            duration: 1000,
            onComplete: () => dmgText.destroy()
        });
    }

    flashSprite(key, color = 0xffffff) {
        const sprite = this.elements[`${key}Sprite`];
        if (!sprite) return;

        const origColor = sprite.fillColor;
        sprite.setFillStyle(color);
        this.scene.time.delayedCall(150, () => {
            sprite.setFillStyle(origColor);
        });
    }

    destroy() {
        Object.values(this.elements).forEach(el => {
            if (el && el.destroy) el.destroy();
        });
        this.elements = {};
    }
}