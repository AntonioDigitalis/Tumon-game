// ============================================
// FUSION SCENE — Interface de fusão
// ============================================

class FusionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FusionScene' });
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

        this.add.text(w / 2, 25, '🔮 FUSÃO DE CRIATURAS', {
            fontFamily: 'Courier New', fontSize: '20px', color: '#9b59b6', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(w / 2, 50, 'Mesma Genética + Mesmo Tier | 50% chance de sucesso', {
            fontFamily: 'Courier New', fontSize: '11px', color: '#888888'
        }).setOrigin(0.5);

        // Creature list
        const allCreatures = [...this.playerData.party, ...this.playerData.storage];
        this.createCreatureList(allCreatures);

        // Selected panels
        this.sel1Text = this.add.text(150, h - 140, 'Slot 1: ---', {
            fontFamily: 'Courier New', fontSize: '12px', color: '#3498db'
        });
        this.sel2Text = this.add.text(400, h - 140, 'Slot 2: ---', {
            fontFamily: 'Courier New', fontSize: '12px', color: '#e74c3c'
        });

        this.statusText = this.add.text(w / 2, h - 100, '', {
            fontFamily: 'Courier New', fontSize: '14px', color: '#f1c40f'
        }).setOrigin(0.5);

        // Fuse button
        const fuseBtn = this.add.text(w / 2, h - 60, '[ FUNDIR ]', {
            fontFamily: 'Courier New', fontSize: '18px', color: '#9b59b6',
            backgroundColor: '#2c3e50', padding: { x: 20, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        fuseBtn.on('pointerdown', () => this.attemptFusion());

        // Close button
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
            if (y > CONST.GAME_HEIGHT - 180) return; // Limit display

            const bg = this.add.rectangle(CONST.GAME_WIDTH / 2, y + 12, CONST.GAME_WIDTH - 40, 30, 0x1a1a2e, 0.8);
            bg.setStrokeStyle(1, 0x444444);
            bg.setInteractive({ useHandCursor: true });

            const text = this.add.text(30, y + 4,
                `${creature.isShiny ? '✨' : ''} ${creature.name} Lv.${creature.level} | ${Helpers.geneticStars(creature.genetics)} | T${creature.tier} | ${ElementTable.names[creature.element]}`,
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
            this.sel1Text.setText(`Slot 1: ${creature.name} (${Helpers.geneticStars(creature.genetics)} T${creature.tier})`);
        } else if (!this.selected2 && creature.uid !== this.selected1.uid) {
            this.selected2 = creature;
            this.sel2Text.setText(`Slot 2: ${creature.name} (${Helpers.geneticStars(creature.genetics)} T${creature.tier})`);

            // Check compatibility
            const check = FusionSystem.canFuse(this.selected1, this.selected2);
            this.statusText.setText(check.reason);
            this.statusText.setColor(check.can ? '#2ecc71' : '#e74c3c');
        } else {
            // Reset selection
            this.selected1 = creature;
            this.selected2 = null;
            this.sel1Text.setText(`Slot 1: ${creature.name} (${Helpers.geneticStars(creature.genetics)} T${creature.tier})`);
            this.sel2Text.setText('Slot 2: ---');
            this.statusText.setText('');
        }
    }

    attemptFusion() {
        const check = FusionSystem.canFuse(this.selected1, this.selected2);
        if (!check.can) {
            this.statusText.setText(check.reason);
            this.statusText.setColor('#e74c3c');
            return;
        }

        this.input.enabled = false;

        const result = FusionSystem.fuse(this.selected1, this.selected2);

        this._playFusionAnimation(this.selected1, this.selected2, result, () => {
            this.playerData.removeCreature(result.lostCreature.uid);
            if (result.success) {
                this.playerData.stats.fusions++;
            } else {
                this.playerData.stats.fusionsFailed++;
            }
            this.time.delayedCall(1000, () => {
                this.scene.restart({ playerData: this.playerData, onClose: this.onClose });
            });
        });
    }

    _playFusionAnimation(c1, c2, result, onDone) {
        const W = CONST.GAME_WIDTH;
        const H = CONST.GAME_HEIGHT;
        const cx = W / 2;
        const cy = H / 2 - 20;
        const SCALE = 3;

        const hexToNum = str => parseInt((str || '#ffffff').replace('#', ''), 16);

        // --- Overlay escuro ---
        const overlay = this.add.rectangle(cx, H / 2, W, H, 0x000011).setAlpha(0).setDepth(10);
        this.tweens.add({ targets: overlay, alpha: 0.9, duration: 200 });

        // --- Sprites das criaturas ---
        const key1 = `proc_${c1.templateId}${c1.isShiny ? '_shiny' : ''}`;
        const key2 = `proc_${c2.templateId}${c2.isShiny ? '_shiny' : ''}`;
        const elColor1 = hexToNum(CONST.ELEMENT_COLORS[c1.element] || '#ffffff');
        const elColor2 = hexToNum(CONST.ELEMENT_COLORS[c2.element] || '#ffffff');

        let sp1, sp2;
        if (this.textures.exists(key1)) {
            sp1 = this.add.image(130, cy, key1).setScale(SCALE);
        } else {
            sp1 = this.add.circle(130, cy, 32, elColor1);
        }
        sp1.setDepth(11).setAlpha(0);

        if (this.textures.exists(key2)) {
            sp2 = this.add.image(W - 130, cy, key2).setScale(SCALE).setFlipX(true);
        } else {
            sp2 = this.add.circle(W - 130, cy, 32, elColor2);
        }
        sp2.setDepth(11).setAlpha(0);

        const lbl1 = this.add.text(130, cy + 60, c1.name, {
            fontFamily: 'Courier New', fontSize: '12px', color: '#aaaaaa'
        }).setOrigin(0.5).setDepth(11).setAlpha(0);

        const lbl2 = this.add.text(W - 130, cy + 60, c2.name, {
            fontFamily: 'Courier New', fontSize: '12px', color: '#aaaaaa'
        }).setOrigin(0.5).setDepth(11).setAlpha(0);

        const title = this.add.text(cx, 45, '🔮 FUNDINDO...', {
            fontFamily: 'Courier New', fontSize: '20px', color: '#9b59b6', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(11).setAlpha(0);

        // FASE 1: sprites aparecem
        this.tweens.add({ targets: [sp1, sp2, lbl1, lbl2, title], alpha: 1, duration: 350 });

        // FASE 2: aproximação (t=700ms)
        this.time.delayedCall(700, () => {
            this.tweens.add({ targets: [lbl1, lbl2, title], alpha: 0, duration: 250 });

            this.tweens.add({
                targets: sp1,
                x: cx - 26, scaleX: SCALE * 1.2, scaleY: SCALE * 1.2,
                duration: 800, ease: 'Power2.easeIn'
            });
            this.tweens.add({
                targets: sp2,
                x: cx + 26, scaleX: SCALE * 1.2, scaleY: SCALE * 1.2,
                duration: 800, ease: 'Power2.easeIn'
            });

            // Tint piscando durante a aproximação
            if (sp1.setTint) {
                this.time.addEvent({ delay: 200, repeat: 3, callback: () => {
                    sp1.setTint(elColor1); sp2.setTint(elColor2);
                    this.time.delayedCall(100, () => { if (sp1.clearTint) { sp1.clearTint(); sp2.clearTint(); } });
                }});
            }

            // FASE 3: colisão (t=700+820=1520ms)
            this.time.delayedCall(820, () => {
                const flash = this.add.rectangle(cx, H / 2, W, H, 0xffffff, 0).setDepth(20);
                this.tweens.add({
                    targets: flash, alpha: 1, duration: 80, hold: 50, yoyo: true,
                    onComplete: () => {
                        flash.destroy();
                        sp1.setVisible(false);
                        sp2.setVisible(false);

                        // --- Orbe de energia ---
                        const orbColor = hexToNum(CONST.ELEMENT_COLORS[c1.element] || '#9b59b6');
                        const orb = this.add.circle(cx, cy, 11, orbColor).setScale(0).setDepth(12);
                        const glow = this.add.circle(cx, cy, 22, orbColor, 0.28).setScale(0).setDepth(11);

                        this.tweens.add({ targets: [orb, glow], scale: 1, duration: 260, ease: 'Back.easeOut' });

                        // Pulso do orbe
                        this.tweens.add({
                            targets: orb, scale: 1.7, duration: 520,
                            yoyo: true, repeat: 3, ease: 'Sine.easeInOut'
                        });

                        // --- Partículas orbitando ---
                        const particles = [];
                        for (let i = 0; i < 10; i++) {
                            const dot = this.add.circle(cx, cy, i % 3 === 0 ? 5 : 3, orbColor).setDepth(12);
                            particles.push({ circle: dot, offset: (i / 10) * Math.PI * 2 });
                        }

                        const proxy = { t: 0 };
                        this.tweens.add({
                            targets: proxy, t: Math.PI * 2,
                            duration: 1300, repeat: -1,
                            onUpdate: () => {
                                particles.forEach((pt, idx) => {
                                    const a = proxy.t + pt.offset;
                                    const r = 52 + Math.sin(proxy.t * 3 + idx) * 10;
                                    pt.circle.setPosition(
                                        cx + Math.cos(a) * r,
                                        cy + Math.sin(a) * r * 0.52
                                    );
                                });
                            }
                        });

                        // Texto de suspense piscando
                        let dotPhase = 0;
                        const suspText = this.add.text(cx, cy + 95, '···', {
                            fontFamily: 'Courier New', fontSize: '20px', color: '#f1c40f', fontStyle: 'bold'
                        }).setOrigin(0.5).setDepth(12);

                        const dotEvent = this.time.addEvent({
                            delay: 360, repeat: 8,
                            callback: () => {
                                dotPhase++;
                                const d = (dotPhase % 4) + 1;
                                suspText.setText('·'.repeat(d) + '  '.repeat(4 - d));
                            }
                        });

                        // FASE 4: revelação (t=1520+200+1900=3620ms do início)
                        this.time.delayedCall(1950, () => {
                            this.tweens.killTweensOf(proxy);
                            dotEvent.destroy();
                            suspText.destroy();

                            // Partículas saem em explosão ou colapso
                            particles.forEach(pt => {
                                const angle = Math.random() * Math.PI * 2;
                                const dist = result.success ? 160 + Math.random() * 70 : 40 + Math.random() * 30;
                                this.tweens.add({
                                    targets: pt.circle,
                                    x: cx + Math.cos(angle) * dist,
                                    y: cy + Math.sin(angle) * dist * (result.success ? 1 : 0.4),
                                    alpha: 0,
                                    duration: result.success ? 550 : 220,
                                    ease: result.success ? 'Power2.easeOut' : 'Power3.easeIn',
                                    onComplete: () => pt.circle.destroy()
                                });
                            });

                            if (result.success) {
                                // --- SUCESSO ---
                                orb.setFillStyle(0xf1c40f);
                                glow.setFillStyle(0xf1c40f);

                                this.tweens.add({
                                    targets: [orb, glow], scale: 6, alpha: 0,
                                    duration: 400, ease: 'Power3.easeOut',
                                    onComplete: () => { orb.destroy(); glow.destroy(); }
                                });

                                this.cameras.main.flash(700, 155, 89, 182);

                                const resKey = `proc_${result.resultCreature.templateId}${result.resultCreature.isShiny ? '_shiny' : ''}`;
                                const resSp = this.textures.exists(resKey)
                                    ? this.add.image(cx, cy + 50, resKey).setScale(0).setDepth(13)
                                    : this.add.circle(cx, cy + 50, 32, 0xf1c40f).setScale(0).setDepth(13);

                                this.tweens.add({
                                    targets: resSp, y: cy - 5, scale: SCALE + 0.5,
                                    duration: 520, ease: 'Back.easeOut'
                                });

                                // Anel dourado expandindo
                                const ring = this.add.circle(cx, cy - 5, 12, 0, 0).setDepth(12);
                                ring.setStrokeStyle(3, 0xf1c40f);
                                this.tweens.add({
                                    targets: ring, scale: 5.5, alpha: 0,
                                    duration: 650, ease: 'Power2.easeOut',
                                    onComplete: () => ring.destroy()
                                });

                                // Sparkles se shiny
                                if (result.resultCreature.isShiny) {
                                    for (let i = 0; i < 6; i++) {
                                        const a = (i / 6) * Math.PI * 2;
                                        const star = this.add.text(
                                            cx + Math.cos(a) * 48,
                                            cy - 5 + Math.sin(a) * 30,
                                            '✨', { fontSize: '13px' }
                                        ).setOrigin(0.5).setDepth(13).setAlpha(0);
                                        this.tweens.add({
                                            targets: star,
                                            x: cx + Math.cos(a) * 85,
                                            y: cy - 5 + Math.sin(a) * 55,
                                            alpha: { from: 0, to: 1 },
                                            scale: 1.4,
                                            duration: 600, delay: i * 70, yoyo: true,
                                            onComplete: () => star.destroy()
                                        });
                                    }
                                }

                                const okText = this.add.text(cx, cy + 80,
                                    `✅ ${result.resultCreature.name} → Tier ${result.newTier}!`, {
                                    fontFamily: 'Courier New', fontSize: '16px',
                                    color: '#2ecc71', fontStyle: 'bold'
                                }).setOrigin(0.5).setAlpha(0).setDepth(13);

                                this.tweens.add({
                                    targets: okText, alpha: 1, y: okText.y - 8,
                                    duration: 400, delay: 300
                                });

                                this.time.delayedCall(1500, onDone);

                            } else {
                                // --- FALHA ---
                                orb.setFillStyle(0xe74c3c);
                                glow.setFillStyle(0xe74c3c);

                                this.tweens.add({
                                    targets: [orb, glow], scale: 0, alpha: 0,
                                    duration: 260, ease: 'Power3.easeIn',
                                    onComplete: () => { orb.destroy(); glow.destroy(); }
                                });

                                this.cameras.main.shake(420, 0.018);

                                // Linhas de rachadura vermelhas
                                const gfx = this.add.graphics().setDepth(12);
                                gfx.lineStyle(2, 0xe74c3c, 0.85);
                                for (let i = 0; i < 6; i++) {
                                    const a = Math.random() * Math.PI * 2;
                                    const len = 25 + Math.random() * 55;
                                    gfx.beginPath();
                                    gfx.moveTo(cx, cy);
                                    gfx.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len);
                                    gfx.strokePath();
                                }
                                this.tweens.add({
                                    targets: gfx, alpha: 0, duration: 700, delay: 150,
                                    onComplete: () => gfx.destroy()
                                });

                                const failText = this.add.text(cx, cy,
                                    `❌ Fusão falhou!\n${result.lostCreature.name} foi perdido...`, {
                                    fontFamily: 'Courier New', fontSize: '15px',
                                    color: '#e74c3c', fontStyle: 'bold', align: 'center'
                                }).setOrigin(0.5).setAlpha(0).setDepth(13);

                                this.tweens.add({ targets: failText, alpha: 1, duration: 400 });

                                this.time.delayedCall(1300, onDone);
                            }
                        });
                    }
                });
            });
        });
    }

    close() {
        this.scene.stop();
        if (this.onClose) this.onClose();
    }
}