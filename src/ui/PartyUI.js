// ============================================
// PARTY UI — Painel do time (usado em InventoryScene)
// ============================================

class PartyUI {
    static createPartyList(scene, party, x, y, onSelect = null) {
        const container = scene.add.container(x, y);
        
        party.forEach((creature, i) => {
            const cy = i * 75;
            
            // Background
            const bg = scene.add.rectangle(175, cy + 30, 350, 65, 0x1a1a2e, 0.9);
            bg.setStrokeStyle(1, creature.isAlive() ? 0x3498db : 0xe74c3c);
            
            if (onSelect) {
                bg.setInteractive({ useHandCursor: true });
                bg.on('pointerdown', () => onSelect(creature, i));
                bg.on('pointerover', () => bg.setStrokeStyle(2, 0xf1c40f));
                bg.on('pointerout', () => bg.setStrokeStyle(1, creature.isAlive() ? 0x3498db : 0xe74c3c));
            }

            // Sprite mini
            const sprite = scene.add.rectangle(30, cy + 30, 40, 40, creature.spriteColor);
            sprite.setStrokeStyle(1, 0xffffff);

            // Name
            const shiny = creature.isShiny ? '✨' : '';
            const nameText = scene.add.text(60, cy + 8, `${shiny}${creature.name} Lv.${creature.level}`, {
                fontFamily: 'Courier New',
                fontSize: '13px',
                color: '#ffffff',
                fontStyle: 'bold'
            });

            // Info
            const elemColor = CONST.ELEMENT_COLORS[creature.element] || '#ffffff';
            const infoText = scene.add.text(60, cy + 26, 
                `${ElementTable.names[creature.element]} | ${Helpers.geneticStars(creature.genetics)} | T${creature.tier}`, {
                fontFamily: 'Courier New',
                fontSize: '10px',
                color: elemColor
            });

            // HP bar
            const hpRatio = creature.currentHp / creature.getMaxHp();
            const hpColor = hpRatio > 0.5 ? 0x2ecc71 : hpRatio > 0.25 ? 0xf1c40f : 0xe74c3c;
            const hpBg = scene.add.rectangle(275, cy + 20, 120, 10, 0x333333);
            const hpFill = scene.add.rectangle(275 - 60 + (120 * hpRatio) / 2, cy + 20, 120 * hpRatio, 10, hpColor);
            hpFill.setOrigin(0, 0.5);
            hpFill.x = 215;
            
            const hpLabel = scene.add.text(275, cy + 20, `${creature.currentHp}/${creature.getMaxHp()}`, {
                fontFamily: 'Courier New',
                fontSize: '9px',
                color: '#ffffff'
            }).setOrigin(0.5);

            // Stats mini
            const statsText = scene.add.text(215, cy + 36, 
                `ATK:${creature.getEffectiveStat('attack')} DEF:${creature.getEffectiveStat('defense')} SPD:${creature.getEffectiveStat('speed')}`, {
                fontFamily: 'Courier New',
                fontSize: '9px',
                color: '#aaaaaa'
            });

            container.add([bg, sprite, nameText, infoText, hpBg, hpFill, hpLabel, statsText]);
        });

        return container;
    }
}