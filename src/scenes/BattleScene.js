// ============================================
// BATTLE SCENE — Combate por turnos
// ============================================

class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BattleScene' });
    }

    init(data) {
        this.playerData = data.playerData;
        this.enemyCreature = data.enemyCreature;
        this.enemyParty = data.enemyParty || [data.enemyCreature];
        this.enemyPartyIndex = 0;
        this.isWild = data.isWild;
        this.trainerName = data.trainerName || '';
        this.trainerId = data.trainerId || '';
        this.trainerReward = data.trainerReward || 0;
        this.isLeader = data.isLeader || false;
        this.achievementBonuses = data.achievementBonuses || {};
        this.onBattleEnd = data.onBattleEnd;

        this.battleSystem = new BattleSystem();
        this.battleUI = null;
        this.currentPlayerCreature = this.playerData.getFirstAlive();
        this.battleActive = true;
        this.processingTurn = false;
        this.participants = new Set([this.currentPlayerCreature.uid]);
    }

    create() {
        // Init battle
        this.currentPlayerCreature.resetBattleBuffs();
        this.enemyCreature.resetBattleBuffs();
        this.battleSystem.init(this.currentPlayerCreature, this.enemyCreature);

        // UI
        this.battleUI = new BattleUI(this);
        this.battleUI.create(this.currentPlayerCreature, this.enemyCreature);

        // Title
        const titleText = this.isWild 
            ? `Criatura selvagem ${this.enemyCreature.name} apareceu!`
            : `${this.trainerName} quer batalhar!`;
        
        this.battleUI.setLogText(titleText);

        // Show actions after delay
        this.time.delayedCall(1000, () => {
            if (this.battleSystem.isPlayerTurn) {
                this.showMainMenu();
            } else {
                this.processEnemyTurn();
            }
        });

        // ESC para fechar (fugir)
        this.input.keyboard.on('keydown-ESC', () => {
            if (this.isWild && this.battleActive) {
                this.handleFlee();
            }
        });
    }

    showMainMenu() {
        if (!this.battleActive) return;

        this.battleUI.showMainActions(
            () => this.showAttackMenu(),
            () => this.handleCapture(),
            () => this.showSwitchMenu(),
            () => this.handleFlee(),
            () => this.showItemMenu()
        );
    }

    showAttackMenu() {
        this.battleUI.showMoveActions(
            this.currentPlayerCreature.moves,
            (moveId) => this.handleAttack(moveId),
            () => this.showMainMenu()
        );
    }

    showItemMenu() {
        this.battleUI.showItemActions(
            this.playerData.inventory,
            (itemId) => this.handleUseItem(itemId),
            () => this.showMainMenu()
        );
    }

    showSwitchMenu() {
        this.battleUI.showSwitchActions(
            this.playerData.party,
            this.currentPlayerCreature.uid,
            (creature) => this.handleSwitch(creature),
            () => this.showMainMenu()
        );
    }

    showForcedSwitchMenu() {
        this.processingTurn = false;
        this.battleUI.setLogText(`${this.currentPlayerCreature.name} desmaiou! Escolha a próxima criatura!`);
        this.battleUI.showSwitchActions(
            this.playerData.party,
            this.currentPlayerCreature.uid,
            (creature) => {
                this.processingTurn = true;
                this.switchCreature(creature, true);
            },
            null
        );
    }

    handleAttack(moveId) {
        if (this.processingTurn || !this.battleActive) return;
        this.processingTurn = true;

        const result = this.battleSystem.playerAttack(moveId);
        if (!result) { this.processingTurn = false; return; }

        this.animateAttackResult(result, 'enemy', () => {
            if (result.battleEnd) {
                this.handleBattleEnd(result.result);
                return;
            }
            // Enemy turn
            this.processEnemyTurn();
        });
    }

    processEnemyTurn() {
        if (!this.battleActive) return;

        this.time.delayedCall(700, () => {
            const result = this.battleSystem.enemyTurn();
            if (!result) {
                this.processingTurn = false;
                this.showMainMenu();
                return;
            }

            this.animateAttackResult(result, 'player', () => {
                if (result.battleEnd) {
                    if (result.result === 'lose') {
                        const hasAlive = this.playerData.party.some(
                            c => c.isAlive() && c.uid !== this.currentPlayerCreature.uid
                        );
                        if (hasAlive) {
                            this.showForcedSwitchMenu();
                            return;
                        }
                    }
                    this.handleBattleEnd(result.result);
                    return;
                }

                this.processingTurn = false;
                this.showMainMenu();
            });
        });
    }

    animateAttackResult(result, targetKey, callback) {
        const log = this.battleSystem.getLastLog(3).join('\n');
        this.battleUI.setLogText(log);

        if (!result.missed && result.damage > 0) {
            this.battleUI.flashSprite(targetKey, 0xffffff);
            
            const color = result.critical ? '#ff0000' : '#ffffff';
            this.battleUI.showDamageNumber(targetKey, result.damage, color);

            // Update HP bars
            this.battleUI.updateHP('player', this.currentPlayerCreature);
            this.battleUI.updateHP('enemy', this.enemyCreature);
        }

        if (result.healed > 0) {
            const healKey = targetKey === 'enemy' ? 'player' : 'enemy';
            this.battleUI.showDamageNumber(healKey === 'player' ? 'enemy' : 'player', 0); // placeholder
        }

        // Update HP after status
        this.time.delayedCall(500, () => {
            this.battleUI.updateHP('player', this.currentPlayerCreature);
            this.battleUI.updateHP('enemy', this.enemyCreature);
            callback();
        });
    }

    handleCapture() {
        if (!this.isWild) {
            this.battleUI.setLogText('Não pode capturar criaturas de treinadores!');
            this.time.delayedCall(1000, () => this.showMainMenu());
            return;
        }

        const availableRunes = Object.values(ItemsDB)
            .filter(item => item.type === 'rune' && this.playerData.hasItem(item.id))
            .sort((a, b) => (a.captureRate || 0) - (b.captureRate || 0)); // fraca → forte

        if (availableRunes.length === 0) {
            this.battleUI.setLogText('Sem runas de captura!');
            this.time.delayedCall(1000, () => this.showMainMenu());
            return;
        }

        this.showRuneMenu(availableRunes);
    }

    showRuneMenu(runes) {
        this.battleUI.setLogText('Escolha a runa de captura:');

        this.battleUI.showGenericMenu(
            runes.map(rune => {
                return {
                    label: rune.name,
                    description: `Chance base: ${Math.round((rune.captureRate || 0) * 100)}%`,
                    onSelect: () => this.useRune(rune.id)
                };
            }),
            () => this.showMainMenu()
        );
    }

    useRune(runeId) {
        if (this.processingTurn) return;
        this.processingTurn = true;

        this.playerData.useItem(runeId);

        const captureResult = CaptureSystem.attemptCapture(
            this.enemyCreature,
            runeId,
            this.achievementBonuses.captureRate || 0
        );

        this.animateCapture(captureResult, () => {
            if (captureResult.success) {
                this.battleUI.setLogText(`${this.enemyCreature.name} foi capturado!`);
                this.battleActive = false;

                this.time.delayedCall(1500, () => {
                    this.endBattle({
                        won: true,
                        captured: this.enemyCreature,
                        xp: this.battleSystem.calculateXP(),
                        gold: this.battleSystem.calculateGold()
                    });
                });
            } else {
                this.battleUI.setLogText(`A captura falhou!`);
                this.processEnemyTurn();
            }
        });
    }

    animateCapture(result, callback) {
        const enemySprite = this.battleUI.elements.enemySprite;
        if (!enemySprite) { callback(); return; }

        const rune = this.add.image(
            CONST.GAME_WIDTH / 2,
            CONST.GAME_HEIGHT / 2,
            ItemsDB[result.runeUsed]?.icon || 'asset_missing'
        );

        rune.setScale(1.1);
        rune.setDepth(1000);

        const runeColor = ItemsDB[result.runeUsed]?.color || 0xffffff;
        const rays = [];

        const hoverX = enemySprite.x;
        const hoverY = enemySprite.y - 60;

        // --------------------------
        // 1. runa vai até o hover
        // --------------------------
        this.tweens.add({
            targets: rune,
            x: hoverX,
            y: hoverY,
            duration: 400,
            ease: 'Power2',

            onComplete: () => {

                // --------------------------
                // 2. raios (FORÇANDO VISIBILIDADE)
                // --------------------------
                for (let i = 0; i < 8; i++) {

                    const ray = this.add.line(
                        rune.x,
                        rune.y,
                        rune.x,
                        rune.y,
                        enemySprite.x,
                        enemySprite.y,
                        runeColor,
                        1
                    );

                    ray.setOrigin(0, 0);
                    ray.setDepth(9999);
                    ray.setAlpha(1); // 👈 IMPORTANTE: não começa invisível

                    this.tweens.add({
                        targets: ray,
                        alpha: 0,
                        duration: 300,
                        ease: 'Sine.easeOut',
                        delay: i * 30
                    });

                    rays.push(ray);
                }

                // --------------------------
                // 3. reação da criatura
                // --------------------------
                enemySprite.setTint(runeColor);

                const shake = this.tweens.add({
                    targets: enemySprite,
                    x: enemySprite.x + 3,
                    duration: 50,
                    yoyo: true,
                    repeat: 10
                });

                this.time.delayedCall(250, () => enemySprite.clearTint());

                // --------------------------
                // 4. resultado final
                // --------------------------
                this.time.delayedCall(600, () => {

                    if (result.success) {

                        // ✨ criatura entra na runa (IMPORTANTE)
                        this.tweens.add({
                            targets: enemySprite,
                            scale: 0,
                            alpha: 0,
                            duration: 300,
                            ease: 'Back.In'
                        });

                        // 🌟 runa “absorve energia”
                        this.tweens.add({
                            targets: rune,
                            scale: 1.5,
                            duration: 200,
                            yoyo: true,
                            repeat: 1,
                            onComplete: () => {

                                // 🔄 RUNA VOLTA PRO PLAYER
                                this.tweens.add({
                                    targets: rune,
                                    x: CONST.GAME_WIDTH / 2,
                                    y: CONST.GAME_HEIGHT - 80,
                                    scale: 0.7,
                                    duration: 350,
                                    ease: 'Power2',
                                    onComplete: () => {

                                        rune.destroy();
                                        rays.forEach(r => r.destroy());
                                        shake.stop();

                                        callback();
                                    }
                                });
                            }
                        });

                    } else {

                        // 💥 falha: runa quebra
                        this.tweens.add({
                            targets: rune,
                            angle: 180,
                            alpha: 0,
                            scale: 0.3,
                            duration: 250,
                            onComplete: () => {
                                rune.destroy();
                                rays.forEach(r => r.destroy());
                                shake.stop();
                                callback();
                            }
                        });
                    }
                });
            }
        });
    }

    handleSwitch(creature) {
        if (this.processingTurn) return;
        this.processingTurn = true;
        this.switchCreature(creature);
    }

    switchCreature(creature, forced = false) {
        this.currentPlayerCreature.resetBattleBuffs();
        this.currentPlayerCreature = creature;
        this.currentPlayerCreature.resetBattleBuffs();

        this.battleSystem.playerCreature = creature;
        this.battleSystem.battleOver = false;
        this.battleSystem.result = null;
        this.participants.add(creature.uid);

        // Refresh UI
        this.battleUI.destroy();
        this.battleUI = new BattleUI(this);
        this.battleUI.create(this.currentPlayerCreature, this.enemyCreature);

        this.battleUI.setLogText(`Vai, ${creature.name}!`);

        this.time.delayedCall(1000, () => {
            if (this.battleActive) {
                this.processingTurn = false;
                if (forced) {
                    // Criatura morreu — inimigo já atacou, é a vez do jogador
                    this.battleSystem.isPlayerTurn = true;
                    this.showMainMenu();
                } else {
                    // Troca voluntária conta como turno — inimigo ataca
                    this.battleSystem.isPlayerTurn = false;
                    this.processEnemyTurn();
                }
            }
        });
    }

    handleUseItem(itemId) {
        const item = ItemsDB[itemId];
        if (!item) return;

        if (item.type === 'rune') {
            this.handleCapture();
            return;
        }

        if (!this.playerData.useItem(itemId)) {
            this.battleUI.setLogText('Item indisponível!');
            return;
        }

        this.processingTurn = true;

        if (item.healAmount) {
            this.currentPlayerCreature.currentHp = Math.min(
                this.currentPlayerCreature.currentHp + item.healAmount,
                this.currentPlayerCreature.getMaxHp()
            );
            this.battleUI.setLogText(`Usou ${item.name}! +${item.healAmount} HP!`);
            this.battleUI.updateHP('player', this.currentPlayerCreature);
        }

        if (item.cureStatus) {
            if (item.cureStatus === 'all') {
                this.currentPlayerCreature.status = null;
                this.currentPlayerCreature.statusTurns = 0;
            } else if (this.currentPlayerCreature.status === item.cureStatus) {
                this.currentPlayerCreature.status = null;
                this.currentPlayerCreature.statusTurns = 0;
            }
            this.battleUI.setLogText(`Usou ${item.name}! Status curado!`);
            this.battleUI.updateHP('player', this.currentPlayerCreature);
        }

        // Enemy turn after using item
        this.time.delayedCall(800, () => {
            this.battleSystem.isPlayerTurn = false;
            this.processEnemyTurn();
        });
    }

    handleFlee() {
        if (!this.isWild) {
            this.battleUI.setLogText('Não pode fugir de batalhas de treinadores!');
            this.time.delayedCall(1000, () => this.showMainMenu());
            return;
        }

        this.processingTurn = true;
        const fled = this.battleSystem.tryFlee();

        this.battleUI.setLogText(this.battleSystem.getLastLog(1).join(''));

        if (fled) {
            this.battleActive = false;
            this.time.delayedCall(800, () => {
                this.endBattle({ won: false, fled: true });
            });
        } else {
            this.processEnemyTurn();
        }
    }

    handleBattleEnd(result) {
        this.battleActive = false;

        if (result === 'win') {
            // Check if trainer has more creatures
            if (!this.isWild && this.enemyParty.length > 1) {
                this.enemyPartyIndex++;
                if (this.enemyPartyIndex < this.enemyParty.length) {
                    const nextEnemy = this.enemyParty[this.enemyPartyIndex];
                    this.enemyCreature = nextEnemy;
                    this.battleSystem.init(this.currentPlayerCreature, nextEnemy);
                    this.battleActive = true;

                    // Refresh UI
                    this.battleUI.destroy();
                    this.battleUI = new BattleUI(this);
                    this.battleUI.create(this.currentPlayerCreature, nextEnemy);
                    this.battleUI.setLogText(`${this.trainerName} enviou ${nextEnemy.name}!`);

                    this.time.delayedCall(1200, () => {
                        this.processingTurn = false;
                        this.showMainMenu();
                    });
                    return;
                }
            }

            const xp      = this.battleSystem.calculateXP();
            const gold    = this.isWild ? this.battleSystem.calculateGold() : this.trainerReward;
            const xpEach  = Math.max(1, Math.floor(xp / this.participants.size));

            this.time.delayedCall(800, () => {
                this.battleUI.showXPGain(this.currentPlayerCreature, xpEach, () => {
                    this.endBattle({ won: true, xp, gold, participants: [...this.participants] });
                });
            });
        } else {
            // Lose
            this.time.delayedCall(1500, () => {
                this.endBattle({ won: false });
            });
        }
    }

    endBattle(result) {
        this.battleUI.destroy();
        this.scene.stop();
        if (this.onBattleEnd) this.onBattleEnd(result);
    }
}