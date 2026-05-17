// ============================================
// BATTLE SYSTEM — Lógica de combate por turnos
// ============================================

class BattleSystem {
    constructor() {
        this.playerCreature = null;
        this.enemyCreature = null;
        this.isPlayerTurn = true;
        this.battleLog = [];
        this.turnCount = 0;
        this.battleOver = false;
        this.result = null; // 'win', 'lose', 'capture', 'flee'
    }

    /**
     * Inicializa uma batalha
     */
    init(playerCreature, enemyCreature) {
        this.playerCreature = playerCreature;
        this.enemyCreature = enemyCreature;
        this.battleLog = [];
        this.turnCount = 0;
        this.battleOver = false;
        this.result = null;

        // Quem começa baseado em velocidade
        const pSpeed = this.playerCreature.getEffectiveStat('speed');
        const eSpeed = this.enemyCreature.getEffectiveStat('speed');
        this.isPlayerTurn = pSpeed >= eSpeed;

        this.log(`Batalha iniciada! ${playerCreature.name} vs ${enemyCreature.name}!`);
        
        if (!this.isPlayerTurn) {
            this.log(`${enemyCreature.name} é mais rápido!`);
        }
    }

    /**
     * Executa ataque do jogador
     */
    playerAttack(moveId) {
        if (this.battleOver || !this.isPlayerTurn) return null;

        const move = MovesDB[moveId];
        if (!move) return null;

        if (this.playerCreature.getPP(moveId) <= 0) return null;
        this.playerCreature.usePP(moveId);

        const result = this.executeMove(this.playerCreature, this.enemyCreature, move);
        
        // Verifica se inimigo morreu
        if (this.enemyCreature.currentHp <= 0) {
            this.enemyCreature.currentHp = 0;
            this.battleOver = true;
            this.result = 'win';
            const xp = this.calculateXP();
            const gold = this.calculateGold();
            this.log(`${this.enemyCreature.name} foi derrotado!`);
            this.log(`+${xp} XP, +${gold} ouro!`);
            return { ...result, battleEnd: true, result: 'win', xp, gold };
        }

        this.isPlayerTurn = false;
        return result;
    }

    /**
     * Executa turno do inimigo (IA)
     */
    enemyTurn() {
        if (this.battleOver || this.isPlayerTurn) return null;

        // IA simples: escolhe melhor ataque
        const move = this.aiSelectMove();
        this.enemyCreature.usePP(move.id);
        const result = this.executeMove(this.enemyCreature, this.playerCreature, move);

        // Verifica se jogador morreu
        if (this.playerCreature.currentHp <= 0) {
            this.playerCreature.currentHp = 0;
            this.battleOver = true;
            this.result = 'lose';
            this.log(`${this.playerCreature.name} desmaiou!`);
            return { ...result, battleEnd: true, result: 'lose' };
        }

        this.turnCount++;
        this.isPlayerTurn = true;

        // Processa status effects no fim do turno
        this.processStatusEffects();

        if (this.battleOver) {
            return { ...result, battleEnd: true, result: this.result };
        }
        return result;
    }

    /**
     * Executa um ataque
     */
    executeMove(attacker, defender, move) {
        const result = {
            attacker: attacker.name,
            defender: defender.name,
            move: move.name,
            damage: 0,
            effective: 1.0,
            critical: false,
            missed: false,
            statusApplied: null,
            healed: 0
        };

        // Verifica se está stunned
        if (attacker.status === 'stun') {
            this.log(`${attacker.name} está paralisado e não pode agir!`);
            attacker.statusTurns--;
            if (attacker.statusTurns <= 0) {
                attacker.status = null;
                attacker.statusTurns = 0;
            }
            result.missed = true;
            return result;
        }

        // Verifica se está frozen
        if (attacker.status === 'freeze') {
            if (Helpers.chance(0.5)) {
                this.log(`${attacker.name} está congelado e não pode agir!`);
                attacker.statusTurns--;
                if (attacker.statusTurns <= 0) {
                    attacker.status = null;
                    attacker.statusTurns = 0;
                    this.log(`${attacker.name} se descongelou!`);
                }
                result.missed = true;
                return result;
            } else {
                attacker.status = null;
                attacker.statusTurns = 0;
                this.log(`${attacker.name} quebrou o gelo!`);
            }
        }

        // Check accuracy
        const accuracy = (move.accuracy / 100) * (attacker.getEffectiveStat('accuracy') / 100);
        if (!Helpers.chance(accuracy)) {
            this.log(`${attacker.name} usou ${move.name}... mas errou!`);
            result.missed = true;
            return result;
        }

        // Move de cura
        if (move.effect && move.effect.type === 'heal') {
            const healAmount = Math.floor(attacker.getMaxHp() * move.effect.amount);
            attacker.currentHp = Math.min(attacker.currentHp + healAmount, attacker.getMaxHp());
            this.log(`${attacker.name} usou ${move.name} e recuperou ${healAmount} HP!`);
            result.healed = healAmount;
            return result;
        }

        // Move de buff
        if (move.effect && move.effect.type === 'buff_atk') {
            attacker.buffAttack += move.effect.amount;
            this.log(`${attacker.name} usou ${move.name}! Ataque aumentou!`);
            return result;
        }
        if (move.effect && move.effect.type === 'buff_def') {
            attacker.buffDefense += move.effect.amount;
            this.log(`${attacker.name} usou ${move.name}! Defesa aumentou!`);
            return result;
        }

        // Calcula dano
        const atk = attacker.getEffectiveStat('attack');
        const def = defender.getEffectiveStat('defense');
        
        // Effectiveness
        const effectiveness = ElementTable.getEffectiveness(move.element, defender.element);
        result.effective = effectiveness;

        // STAB (Same Type Attack Bonus)
        const stab = (move.element === attacker.element) ? CONST.STAB_BONUS : 1.0;

        // Critical
        const critChance = attacker.getEffectiveCritChance();
        const isCrit = Helpers.chance(critChance);
        const critMult = isCrit ? CONST.CRIT_MULTIPLIER : 1.0;
        result.critical = isCrit;

        // Fórmula de dano — nível 30 vs 3 dá ~3x dano extra, mesmo nível dá 1x
        const levelMult = Math.pow(attacker.level / Math.max(1, defender.level), 0.5);
        let damage = Math.floor(
            ((move.power * (atk / def)) / 5) * stab * effectiveness * critMult * levelMult * Helpers.randomFloat(0.85, 1.0)
        );
        
        damage = Math.max(1, damage); // Mínimo 1 de dano
        result.damage = damage;

        // Aplica dano
        defender.currentHp = Math.max(0, defender.currentHp - damage);

        // Log
        let logMsg = `${attacker.name} usou ${move.name}!`;
        if (effectiveness !== 1.0) {
            logMsg += ` ${ElementTable.getEffectivenessText(effectiveness)}`;
        }
        if (isCrit) logMsg += ' Crítico!';
        logMsg += ` (${damage} de dano)`;
        this.log(logMsg);

        // Dreno de vida
        if (move.effect && move.effect.type === 'drain') {
            const drainAmount = Math.floor(damage * move.effect.amount);
            attacker.currentHp = Math.min(attacker.currentHp + drainAmount, attacker.getMaxHp());
            this.log(`${attacker.name} drenou ${drainAmount} HP!`);
            result.healed = drainAmount;
        }

        // Debuff defesa
        if (move.effect && move.effect.type === 'debuff_def') {
            defender.buffDefense -= move.effect.amount;
            this.log(`A defesa de ${defender.name} diminuiu!`);
        }

        // Aplica status
        if (move.effect && ['burn', 'poison', 'freeze', 'stun'].includes(move.effect.type)) {
            if (!defender.status && Helpers.chance(move.effect.chance)) {
                defender.status = move.effect.type;
                defender.statusTurns = CONST.STATUS_DURATION[move.effect.type];
                result.statusApplied = move.effect.type;
                
                const statusNames = { burn: 'queimado', poison: 'envenenado', freeze: 'congelado', stun: 'paralisado' };
                this.log(`${defender.name} foi ${statusNames[move.effect.type]}!`);
            }
        }

        return result;
    }

    /**
     * Processa efeitos de status no fim do turno
     */
    processStatusEffects() {
        [this.playerCreature, this.enemyCreature].forEach(creature => {
            if (!creature || creature.currentHp <= 0) return;

            if (creature.status === 'burn') {
                const burnDmg = Math.max(1, Math.floor(creature.getMaxHp() * 0.06));
                creature.currentHp = Math.max(0, creature.currentHp - burnDmg);
                this.log(`${creature.name} sofreu ${burnDmg} de dano por queimadura!`);
                creature.statusTurns--;
            }

            if (creature.status === 'poison') {
                const poisonDmg = Math.max(1, Math.floor(creature.getMaxHp() * 0.08));
                creature.currentHp = Math.max(0, creature.currentHp - poisonDmg);
                this.log(`${creature.name} sofreu ${poisonDmg} de dano por veneno!`);
                creature.statusTurns--;
            }

            if (creature.status && creature.statusTurns <= 0) {
                const statusNames = { burn: 'queimadura', poison: 'veneno', freeze: 'congelamento', stun: 'paralisia' };
                this.log(`${creature.name} se recuperou de ${statusNames[creature.status]}!`);
                creature.status = null;
                creature.statusTurns = 0;
            }

            // Check death from status
            if (creature.currentHp <= 0) {
                creature.currentHp = 0;
                if (creature === this.playerCreature) {
                    this.battleOver = true;
                    this.result = 'lose';
                } else {
                    this.battleOver = true;
                    this.result = 'win';
                }
            }
        });
    }

    /**
     * IA simples para selecionar ataque
     */
    aiSelectMove() {
        const moves = this.enemyCreature.moves
            .map(id => MovesDB[id])
            .filter(m => m);

        if (moves.length === 0) return MovesDB.tackle;

        // Prioriza ataques super efetivos
        const superEffective = moves.filter(m => {
            if (m.power === 0) return false;
            return ElementTable.getEffectiveness(m.element, this.playerCreature.element) >= 2.0;
        });

        if (superEffective.length > 0 && Helpers.chance(0.7)) {
            return Helpers.randomPick(superEffective);
        }

        // Cura se HP baixo
        if (this.enemyCreature.currentHp < this.enemyCreature.getMaxHp() * 0.3) {
            const heals = moves.filter(m => m.effect && m.effect.type === 'heal');
            if (heals.length > 0 && Helpers.chance(0.6)) {
                return heals[0];
            }
        }

        // Escolhe ataque aleatório com dano
        const damaging = moves.filter(m => m.power > 0);
        if (damaging.length > 0) {
            return Helpers.randomPick(damaging);
        }

        return Helpers.randomPick(moves);
    }

    /**
     * Tenta fugir
     */
    tryFlee() {
        const pSpeed = this.playerCreature.getEffectiveStat('speed');
        const eSpeed = this.enemyCreature.getEffectiveStat('speed');
        const chance = Helpers.clamp(0.3 + (pSpeed - eSpeed) * 0.01, 0.2, 0.9);

        if (Helpers.chance(chance)) {
            this.battleOver = true;
            this.result = 'flee';
            this.log('Fugiu com sucesso!');
            return true;
        }

        this.log('Não conseguiu fugir!');
        this.isPlayerTurn = false;
        return false;
    }

    /**
     * Calcula XP ganho
     */
    calculateXP() {
        const baseXP = this.enemyCreature.level * 5;
        const rarityBonus = { common: 1, uncommon: 1.5, rare: 2, legendary: 3 };
        const bonus = rarityBonus[this.enemyCreature.rarity] || 1;
        return Math.floor(baseXP * bonus * (1 + this.enemyCreature.genetics * 0.1));
    }

    /**
     * Calcula ouro ganho
     */
    calculateGold() {
        return Math.floor(CONST.BASE_WILD_GOLD * this.enemyCreature.level * 0.5);
    }

    /**
     * Adiciona log
     */
    log(msg) {
        this.battleLog.push(msg);
        if (this.battleLog.length > 50) {
            this.battleLog.shift();
        }
    }

    /**
     * Retorna último log
     */
    getLastLog(count = 1) {
        return this.battleLog.slice(-count);
    }
}