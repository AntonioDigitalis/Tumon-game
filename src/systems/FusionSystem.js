// ============================================
// FUSION SYSTEM — Fusão de criaturas
// ============================================

class FusionSystem {
    /**
     * Verifica se duas criaturas podem ser fundidas
     */
    static canFuse(creature1, creature2) {
        if (!creature1 || !creature2) return { can: false, reason: 'Selecione duas criaturas.' };
        if (creature1.uid === creature2.uid) return { can: false, reason: 'Não pode fundir consigo mesma.' };
        if (creature1.genetics !== creature2.genetics) return { can: false, reason: 'Genética deve ser igual.' };
        if (creature1.tier !== creature2.tier) return { can: false, reason: 'Tier deve ser igual.' };
        if (creature1.tier >= CONST.MAX_TIER) return { can: false, reason: 'Tier máximo atingido.' };

        return { can: true, reason: 'Fusão possível!' };
    }

    /**
     * Executa fusão
     * @returns { success, resultCreature, lostCreature }
     */
    static fuse(creature1, creature2) {
        const check = this.canFuse(creature1, creature2);
        if (!check.can) return { success: false, reason: check.reason };

        const success = Helpers.chance(CONST.FUSION_SUCCESS_RATE);

        if (success) {
            // Criatura1 sobe de tier
            creature1.tier++;
            
            // Bônus de stats da fusão
            const statBonus = 0.05 * creature1.tier;
            creature1.baseStats.hp += Math.floor(creature2.baseStats.hp * statBonus);
            creature1.baseStats.attack += Math.floor(creature2.baseStats.attack * statBonus);
            creature1.baseStats.defense += Math.floor(creature2.baseStats.defense * statBonus);
            creature1.baseStats.speed += Math.floor(creature2.baseStats.speed * statBonus);

            // Bônus de crit por tier
            creature1.baseCritChance += 0.02;

            // Chance de puxar um move da creature2
            const uniqueMoves = creature2.moves.filter(m => !creature1.moves.includes(m));
            if (uniqueMoves.length > 0 && creature1.moves.length < 6) {
                creature1.moves.push(Helpers.randomPick(uniqueMoves));
            }

            return {
                success: true,
                resultCreature: creature1,
                lostCreature: creature2,
                newTier: creature1.tier
            };
        } else {
            // Falha: perde creature2
            return {
                success: false,
                resultCreature: creature1,
                lostCreature: creature2,
                reason: 'A fusão falhou! Uma criatura foi perdida.'
            };
        }
    }
}