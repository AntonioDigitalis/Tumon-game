// ============================================
// BATTLE UI — Interface de combate
// ============================================

class BattleUI {
    constructor(scene) {
        this.scene = scene;
        this.elements = {};

        // Dimensões reais do canvas (independente do zoom)
        this.W = CONST.GAME_WIDTH;
        this.H = CONST.GAME_HEIGHT;
    }

    create(playerCreature, enemyCreature) {
        const W = this.W;
        const H = this.H;

        // Background
        this.elements.bg = this.scene.add.rectangle(W / 2, H / 2, W, H, 0x2d4a3e);

        // Enemy side (top-right)
        this.createCreaturePanel('enemy', enemyCreature, W - 260, 20);
        this.createCreatureSprite('enemy', enemyCreature, W - 170, 160);

        // Player side (bottom-left)
        this.createCreaturePanel('player', playerCreature, 20, H - 240);
        this.createCreatureSprite('player', playerCreature, 130, H - 290);

        // Log area — faixa horizontal na parte inferior
        // Fica ABAIXO do menu de ação, ocupa toda a largura
        const logH = 50;
        const logY = H - logH / 2 - 4;
        this.elements.logBg = this.scene.add.rectangle(W / 2, logY, W - 8, logH, 0x000000, 0.85);
        this.elements.logBg.setStrokeStyle(1, 0x444444);
        this.elements.logText = this.scene.add.text(14, logY - logH / 2 + 8, '', {
            fontFamily: 'Courier New',
            fontSize: '13px',
            color: '#ffffff',
            wordWrap: { width: W - 28 }
        });

        // Menu de ação — fica centralizado na metade inferior da tela
        this.createActionMenu();
    }

    createCreaturePanel(key, creature, x, y) {
        const isPlayer = key === 'player';
        const panel = this.scene.add.container(x, y);

        const panelW = 240;
        const panelH = isPlayer ? 92 : 80;
        const bg = this.scene.add.rectangle(panelW / 2, panelH / 2, panelW, panelH, 0x000000, 0.78);
        bg.setStrokeStyle(1, 0x888888);
        panel.setDepth(3);

        // Nome + nível
        const shinyIcon = creature.isShiny ? '✨ ' : '';
        const name = this.scene.add.text(8, 6, `${shinyIcon}${creature.name} Lv.${creature.level}`, {
            fontFamily: 'Courier New',
            fontSize: '13px',
            color: '#ffffff',
            fontStyle: 'bold'
        });

        // Elemento + genética + tier
        const elementColor = CONST.ELEMENT_COLORS[creature.element] || '#ffffff';
        const info = this.scene.add.text(8, 24, `${ElementTable.names[creature.element]}  ${Helpers.geneticStars(creature.genetics)}  T${creature.tier}`, {
            fontFamily: 'Courier New',
            fontSize: '10px',
            color: elementColor
        });

        // Barra de HP
        const barW = panelW - 16;
        const barX = 8 + barW / 2;
        const hpBarY = isPlayer ? 46 : 50;
        const hpRatio = creature.currentHp / creature.getMaxHp();
        const hpColor = hpRatio > 0.5 ? 0x2ecc71 : hpRatio > 0.25 ? 0xf1c40f : 0xe74c3c;

        const hpBarBg = this.scene.add.rectangle(barX, hpBarY, barW, 12, 0x333333);
        const hpBar = this.scene.add.rectangle(8, hpBarY, barW * hpRatio, 12, hpColor).setOrigin(0, 0.5);

        const hpText = this.scene.add.text(barX, hpBarY, `${creature.currentHp}/${creature.getMaxHp()}`, {
            fontFamily: 'Courier New',
            fontSize: '9px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Status (burn, stun etc.)
        const statusText = this.scene.add.text(panelW - 8, 6, '', {
            fontFamily: 'Courier New',
            fontSize: '9px',
            color: '#ff6b6b'
        }).setOrigin(1, 0);

        const toAdd = [bg, name, info, hpBarBg, hpBar, hpText, statusText];

        // Barra de XP — apenas no painel do jogador
        if (isPlayer) {
            const xpBarY = 70;
            const xpBarH = 6;
            const needed = EvolutionSystem.xpForLevel(creature.level);
            const xpRatio = needed > 0 ? Math.min(1, creature.xp / needed) : 0;

            const xpBarBg = this.scene.add.rectangle(barX, xpBarY, barW, xpBarH, 0x111122);
            xpBarBg.setStrokeStyle(1, 0x334455);
            const xpBar = this.scene.add.rectangle(8, xpBarY, barW * xpRatio, xpBarH, 0x3498db).setOrigin(0, 0.5);

            toAdd.push(xpBarBg, xpBar);

            this.elements[`${key}XpBar`]  = xpBar;
            this.elements[`${key}XpBarW`] = barW;
        }

        panel.add(toAdd);

        this.elements[`${key}Panel`]    = panel;
        this.elements[`${key}HpBar`]    = hpBar;
        this.elements[`${key}HpText`]   = hpText;
        this.elements[`${key}HpBarBg`]  = hpBarBg;
        this.elements[`${key}HpBarW`]   = barW;
        this.elements[`${key}Name`]     = name;
        this.elements[`${key}Status`]   = statusText;
    }

    createCreatureSprite(key, creature, x, y) {
        const size = key === 'player' ? 96 : 80;
        const sprite = this.scene.add.image(x, y, getSpriteKey(this.scene, creature.spriteKey));

        sprite.setScale(0.3);
        sprite.setDepth(2);
        
        // Ícone do elemento
        const elementSymbols = {
            fire: '🔥', water: '💧', plant: '🌿', electric: '⚡',
            earth: '🏔', ice: '❄', psychic: '🔮', dark: '🌑', normal: '⚪'
        };
        this.scene.add.text(x, y + size / 2 + 10, elementSymbols[creature.element] || '', {
            fontSize: '16px'
        }).setOrigin(0.5);

        // Brilho shiny
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

        // Animação idle
        this.scene.tweens.add({
            targets: sprite,
            y: y - 5,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createActionMenu() {
        const W = this.W;
        const H = this.H;

        // O menu ocupa a área central-inferior da tela.
        // Definimos dimensões fixas que cabem bem em 800x600:
        //   largura: 480px  altura: 160px
        //   posição: centralizado horizontalmente, acima do log (H - 54 - 160/2)
        const menuW = 480;
        const menuH = 160;
        const menuX = W - 280;
        const menuY = H - 54 - menuH / 2 - 8; // acima do log

        const menu = this.scene.add.container(menuX, menuY);
        menu.setDepth(999);
	const bg = this.scene.add.rectangle(0, 0, menuW, menuH, 0x1a1a2e, 0.96);
        bg.setStrokeStyle(2, 0x3498db);
        menu.add(bg);

        this.elements.actionMenu = menu;
        this.elements.actionMenuW = menuW;
        this.elements.actionMenuH = menuH;
        this.elements.actionButtons = [];
  }


    // -------------------------------------------------------
    // Layouts de botões — todos calculados dentro do container
    // -------------------------------------------------------

    // Grade genérica: distribui N botões em linhas de `cols` colunas
    // dentro do container de largura `menuW` x `menuH`.
    _layoutButtons(items, cols, btnW, btnH, onAdd) {
        this.clearActionButtons();

        const menuW = this.elements.actionMenuW;
        const menuH = this.elements.actionMenuH;
        const padX = 12;
        const padY = 10;

        const rows = Math.ceil(items.length / cols);
        const totalW = cols * btnW + (cols - 1) * padX;
        const totalH = rows * btnH + (rows - 1) * padY;

        // Origem do grid (canto superior esquerdo), centrado no container
        const startX = -totalW / 2 + btnW / 2;
        const startY = -totalH / 2 + btnH / 2;

        items.forEach((item, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const bx = startX + col * (btnW + padX);
            const by = startY + row * (btnH + padY);
            onAdd(item, bx, by, btnW, btnH);
        });
    }

    showMainActions(onAttack, onCapture, onSwitch, onFlee, onItem) {
        const actions = [
            { text: '⚔️ Atacar',   callback: onAttack,  color: 0xe74c3c },
            { text: '🔮 Capturar', callback: onCapture, color: 0x9b59b6 },
            { text: '🔄 Trocar',   callback: onSwitch,  color: 0x3498db },
            { text: '🎒 Item',     callback: onItem,    color: 0x2ecc71 },
            { text: '🏃 Fugir',    callback: onFlee,    color: 0x95a5a6 },
        ];

        // 3 colunas, 2 linhas (última linha terá 2 botões centralizados)
        // Botão: 140px x 52px
        this._layoutButtons(actions, 3, 140, 52, (action, bx, by) => {
            this.addButton(bx, by, action.text, action.callback, action.color, 140, 52);
        });
    }

    showMoveActions(creature, onSelect, onBack) {
        const validMoves = creature.moves.map(id => MovesDB[id]).filter(Boolean);
        const btnW = 200, btnH = 44;

        // 2 colunas; botão: 200px x 44px com PP
        this._layoutButtons(validMoves, 2, btnW, btnH, (move, bx, by) => {
            const currentPP = creature.getPP(move.id);
            const maxPP     = move.pp;
            const noPP      = currentPP <= 0;
            const lowPP     = !noPP && currentPP <= Math.floor(maxPP * 0.3);

            const baseColor = noPP
                ? 0x444444
                : Helpers.hexToInt(CONST.ELEMENT_COLORS[move.element] || '#ffffff');

            const btn = this.scene.add.container(bx, by);
            const bg  = this.scene.add.rectangle(0, 0, btnW, btnH, baseColor, noPP ? 0.35 : 0.85);
            bg.setStrokeStyle(1, noPP ? 0x666666 : 0xffffff);

            if (!noPP) {
                bg.setInteractive({ useHandCursor: true });
                bg.on('pointerover', () => bg.setFillStyle(baseColor, 1.0));
                bg.on('pointerout',  () => bg.setFillStyle(baseColor, 0.85));
                bg.on('pointerdown', () => onSelect(move.id));
            }

            const nameText = this.scene.add.text(0, -8,
                `${move.name}  (${move.power || '—'})`, {
                fontFamily: 'Courier New', fontSize: '11px',
                color: noPP ? '#666666' : '#ffffff'
            }).setOrigin(0.5);

            const ppColor = noPP ? '#555555' : (lowPP ? '#ff6060' : '#88ff88');
            const ppText  = this.scene.add.text(0, 9,
                `PP ${currentPP}/${maxPP}`, {
                fontFamily: 'Courier New', fontSize: '10px',
                color: ppColor
            }).setOrigin(0.5);

            btn.add([bg, nameText, ppText]);
            this.elements.actionMenu.add(btn);
            this.elements.actionButtons.push(btn);
        });

        // Botão Voltar centralizado na última linha
        const menuH = this.elements.actionMenuH;
        this.addButton(0, menuH / 2 - 22, '← Voltar', onBack, 0x555555, 140, 32);
    }

    showItemActions(inventory, onSelect, onBack) {
        const items = Object.entries(inventory)
            .filter(([id, qty]) => qty > 0 && ItemsDB[id])
            .slice(0, 4)
            .map(([id, qty]) => ({ id, qty, item: ItemsDB[id] }));

        // 2 colunas; botão: 200px x 44px
        this._layoutButtons(items, 2, 200, 44, ({ id, qty, item }, bx, by) => {
            this.addButton(bx, by, `${item.name} ×${qty}`, () => onSelect(id), 0x27ae60, 200, 44);
        });

        const menuH = this.elements.actionMenuH;
        this.addButton(0, menuH / 2 - 22, '← Voltar', onBack, 0x555555, 140, 32);
    }

    showSwitchActions(party, currentUid, onSelect, onBack) {
        const alive = party
            .filter(c => c.isAlive() && c.uid !== currentUid)
            .slice(0, 4);

        // 2 colunas; botão: 200px x 44px
        this._layoutButtons(alive, 2, 200, 44, (creature, bx, by) => {
            const color = Helpers.hexToInt(CONST.ELEMENT_COLORS[creature.element] || '#bdc3c7');
            this.addButton(bx, by, `${creature.name} Lv.${creature.level}`, () => onSelect(creature), color, 200, 44);
        });

        if (onBack) {
            const menuH = this.elements.actionMenuH;
            this.addButton(0, menuH / 2 - 22, '← Voltar', onBack, 0x555555, 140, 32);
        }
    }

    // btnW e btnH opcionais (padrão 160x36)
    addButton(x, y, label, callback, color = 0x333333, btnW = 160, btnH = 36) {
        const btn = this.scene.add.container(x, y);

        const bg = this.scene.add.rectangle(0, 0, btnW, btnH, color, 0.85);
        bg.setStrokeStyle(1, 0xffffff);
        bg.setInteractive({ useHandCursor: true });

        const text = this.scene.add.text(0, 0, label, {
            fontFamily: 'Courier New',
            fontSize: '11px',
            color: '#ffffff'
        }).setOrigin(0.5);

        bg.on('pointerover', () => bg.setFillStyle(color, 1.0));
        bg.on('pointerout',  () => bg.setFillStyle(color, 0.85));
        bg.on('pointerdown', callback);

        btn.add([bg, text]);
        this.elements.actionMenu.add(btn);
        this.elements.actionButtons.push(btn);
    }

    clearActionButtons() {
        this.elements.actionButtons.forEach(btn => btn.destroy());
        this.elements.actionButtons = [];
    }

    // -------------------------------------------------------
    // HP update
    // -------------------------------------------------------
    updateHP(key, creature) {
        const hpBar  = this.elements[`${key}HpBar`];
        const hpText = this.elements[`${key}HpText`];
        const barW   = this.elements[`${key}HpBarW`] || 224;

        if (hpBar && hpText) {
            const ratio    = Math.max(0, creature.currentHp / creature.getMaxHp());
            const hpColor  = ratio > 0.5 ? 0x2ecc71 : ratio > 0.25 ? 0xf1c40f : 0xe74c3c;
            const targetW  = barW * ratio;

            this.scene.tweens.add({
                targets: hpBar,
                displayWidth: targetW,
                duration: 350,
                onUpdate: () => hpBar.setFillStyle(hpColor)
            });

            hpText.setText(`${creature.currentHp}/${creature.getMaxHp()}`);
        }

        const statusEl = this.elements[`${key}Status`];
        if (statusEl) {
            const labels = { burn: '🔥BRN', poison: '☠PSN', freeze: '❄FRZ', stun: '⚡STN' };
            statusEl.setText(creature.status ? (labels[creature.status] || '') : '');
        }
    }

    // -------------------------------------------------------
    // Animação de ganho de XP (chamada ao vencer batalha)
    // -------------------------------------------------------
    showXPGain(creature, xpGained, callback) {
        const xpBar = this.elements.playerXpBar;
        const barW  = this.elements.playerXpBarW;
        const nameEl = this.elements.playerName;

        if (!xpBar || !barW) { callback(); return; }

        this.setLogText(`+${xpGained} XP!`);

        let simXp    = creature.xp;
        let simLevel = creature.level;
        let remaining = xpGained;

        const step = () => {
            const needed    = EvolutionSystem.xpForLevel(simLevel);
            const spaceLeft = needed - simXp;

            if (remaining >= spaceLeft) {
                // Vai subir de nível — enche a barra até 100%
                this.scene.tweens.add({
                    targets: xpBar,
                    displayWidth: barW,
                    duration: 400,
                    ease: 'Linear',
                    onComplete: () => {
                        remaining -= spaceLeft;
                        simXp = 0;
                        simLevel++;

                        const oldLevel = simLevel - 1;

                        xpBar.setFillStyle(0xf1c40f); // flash dourado no level-up
                        if (nameEl) {
                            const shinyIcon = creature.isShiny ? '✨ ' : '';
                            nameEl.setText(`${shinyIcon}${creature.name} Lv.${simLevel}`);
                        }
                        this.setLogText(`⬆ ${creature.name} subiu para Lv.${simLevel}!`);

                        this.showStatGains(creature, oldLevel, simLevel, () => {
                            xpBar.setFillStyle(0x3498db);
                            xpBar.displayWidth = 0;
                            this.scene.time.delayedCall(150, step);
                        });
                    }
                });
            } else {
                // Sem level-up — enche parcialmente
                simXp += remaining;
                const ratio = simXp / needed;
                this.scene.tweens.add({
                    targets: xpBar,
                    displayWidth: barW * ratio,
                    duration: 700,
                    ease: 'Linear',
                    onComplete: () => {
                        this.scene.time.delayedCall(500, callback);
                    }
                });
            }
        };

        step();
    }

    // -------------------------------------------------------
    // Box de ganho de status ao subir de nível
    // -------------------------------------------------------
    showStatGains(creature, oldLevel, newLevel, onClose) {
        const W = this.W;
        const H = this.H;

        const gm   = 1 + (creature.genetics - 1) * 0.1;
        const tm   = 1 + (creature.tier - 1) * 0.15;
        const calc = (base, lv) => Math.floor(base * gm * tm * (1 + lv * 0.05));

        const statDefs = [
            { name: 'HP',        fn: lv => calc(creature.baseStats.hp,      lv) + 10 },
            { name: 'Ataque',    fn: lv => calc(creature.baseStats.attack,   lv) },
            { name: 'Defesa',    fn: lv => calc(creature.baseStats.defense,  lv) },
            { name: 'Velocidade',fn: lv => calc(creature.baseStats.speed,    lv) }
        ];

        const panelW = 252;
        const panelH = 176;
        const box = this.scene.add.container(W / 2, H / 2).setDepth(2000);

        const bg = this.scene.add.rectangle(0, 0, panelW, panelH, 0x0a0a1e, 0.97);
        bg.setStrokeStyle(2, 0xf1c40f);
        box.add(bg);

        // Título
        box.add(this.scene.add.text(0, -panelH / 2 + 16,
            `⬆  Lv.${oldLevel}  →  Lv.${newLevel}`,
            { fontFamily: 'Courier New', fontSize: '14px', color: '#f1c40f', fontStyle: 'bold' }
        ).setOrigin(0.5));

        // Divisor
        box.add(this.scene.add.rectangle(0, -panelH / 2 + 30, panelW - 20, 1, 0x445566));

        // Linhas de stat
        statDefs.forEach((s, i) => {
            const oldVal = s.fn(oldLevel);
            const newVal = s.fn(newLevel);
            const delta  = newVal - oldVal;
            const y      = -panelH / 2 + 52 + i * 30;

            box.add(this.scene.add.text(-panelW / 2 + 14, y, s.name,
                { fontFamily: 'Courier New', fontSize: '11px', color: '#aaaaaa' }
            ).setOrigin(0, 0.5));

            box.add(this.scene.add.text(panelW / 2 - 14, y,
                `${oldVal}  →  ${newVal}   +${delta}`,
                { fontFamily: 'Courier New', fontSize: '11px', color: '#2ecc71' }
            ).setOrigin(1, 0.5));
        });

        this.elements.statGainBox = box;

        // Entrada com pop
        box.setAlpha(0).setScale(0.82);
        this.scene.tweens.add({
            targets: box,
            alpha: 1, scaleX: 1, scaleY: 1,
            duration: 180,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.scene.time.delayedCall(2400, () => {
                    this.scene.tweens.add({
                        targets: box,
                        alpha: 0,
                        duration: 180,
                        onComplete: () => {
                            box.destroy();
                            delete this.elements.statGainBox;
                            onClose();
                        }
                    });
                });
            }
        });
    }

    // -------------------------------------------------------
    // Log de batalha
    // -------------------------------------------------------
    setLogText(text) {
        if (this.elements.logText) {
            this.elements.logText.setText(text);
        }
    }

    // -------------------------------------------------------
    // Número de dano flutuante
    // -------------------------------------------------------
    showDamageNumber(key, amount, color = '#ffffff') {
        const sprite = this.elements[`${key}Sprite`];
        if (!sprite) return;

        const dmgText = this.scene.add.text(sprite.x, sprite.y - 40, `-${amount}`, {
            fontFamily: 'Courier New',
            fontSize: '20px',
            color,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        this.scene.tweens.add({
            targets: dmgText,
            y: dmgText.y - 35,
            alpha: 0,
            duration: 900,
            onComplete: () => dmgText.destroy()
        });
    }

    // -------------------------------------------------------
    // Flash no sprite ao receber dano
    // -------------------------------------------------------
    flashSprite(key, color = 0xffffff) {
        const sprite = this.elements[`${key}Sprite`];
        if (!sprite) return;

        sprite.setTint(color);

        this.scene.time.delayedCall(140, () => {
            sprite.clearTint();
        });
    }

    // -------------------------------------------------------
    // Destrói todos os elementos
    // -------------------------------------------------------
    destroy() {
        Object.values(this.elements).forEach(el => {
            if (el && typeof el.destroy === 'function') el.destroy();
        });
        this.elements = {};
    }
}