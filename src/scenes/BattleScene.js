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
                    // Check if player has more alive creatures
                    if (result.result === 'lose') {
                        const nextAlive = this.playerData.party.find(
                            c => c.isAlive() && c.uid !== this.currentPlayerCreature.uid
                        );
                        if (nextAlive) {
                            this.switchCreature(nextAlive, true);
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

        // Procura runa no inventário
        const runeTypes = ['rune_rare', 'rune_advanced', 'rune_common'];
        let runeId = null;
        for (const r of runeTypes) {
            if (this.playerData.hasItem(r)) {
                runeId = r;
                break;
            }
        }

        // Use a mais fraca primeiro
        const runeOrder = ['rune_common', 'rune_advanced', 'rune_rare'];
        runeId = null;
        for (const r of runeOrder) {
            if (this.playerData.hasItem(r)) {
                runeId = r;
                break;
            }
        }

        if (!runeId) {
            this.battleUI.setLogText('Sem runas de captura!');
            this.time.delayedCall(1000, () => this.showMainMenu());
            return;
        }

        this.processingTurn = true;
        this.playerData.useItem(runeId);

        const captureResult = CaptureSystem.attemptCapture(
            this.enemyCreature, runeId, this.achievementBonuses.captureRate || 0
        );

        // Animação de captura
        this.animateCapture(captureResult, () => {
            if (captureResult.success) {
                this.battleUI.setLogText(`${this.enemyCreature.name} foi capturado! (${captureResult.chance}% chance)`);
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
                this.battleUI.setLogText(`A captura falhou! (${captureResult.chance}% chance)`);
                // Enemy turn
                this.processEnemyTurn();
            }
        });
    }

    animateCapture(result, callback) {
        const enemySprite = this.battleUI.elements.enemySprite;
        if (!enemySprite) { callback(); return; }

        const rune = this.add.circle(CONST.GAME_WIDTH / 2, CONST.GAME_HEIGHT / 2, 12,
            ItemsDB[result.runeUsed]?.color || 0xffffff);
        rune.setStrokeStyle(2, 0x000000);

        // Throw animation
        this.tweens.add({
            targets: rune,
            x: enemySprite.x,
            y: enemySprite.y,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                // Shakes
                let shakeCount = 0;
                const doShake = () => {
                    if (shakeCount >= result.shakes) {
                        rune.destroy();
                        callback();
                        return;
                    }
                    shakeCount++;
                    this.tweens.add({
                        targets: rune,
                        x: rune.x + 10,
                        duration: 150,
                        yoyo: true,
                        repeat: 1,
                        onComplete: () => {
                            this.time.delayedCall(300, doShake);
                        }
                    });
                };

                // Shrink enemy
                if (result.success) {
                    this.tweens.add({
                        targets: enemySprite,
                        scaleX: 0,
                        scaleY: 0,
                        duration: 300,
                        onComplete: doShake
                    });
                } else {
                    doShake();
                }
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

            const xp   = this.battleSystem.calculateXP();
            const gold = this.isWild ? this.battleSystem.calculateGold() : this.trainerReward;

            this.time.delayedCall(800, () => {
                this.battleUI.showXPGain(this.currentPlayerCreature, xp, () => {
                    this.endBattle({ won: true, xp, gold });
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