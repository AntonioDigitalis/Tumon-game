// ============================================
// EVOLUTION SYSTEM — Evolução, XP e Mutação
// ============================================

class EvolutionSystem {
    /**
     * XP necessário para subir de nível
     */
    static xpForLevel(level) {
        return Math.floor(10 * Math.pow(level, 1.5));
    }

    /**
     * Adiciona XP e verifica level up
     */
    static addXP(creature, amount) {
        const results = [];
        creature.xp += amount;

        while (creature.xp >= this.xpForLevel(creature.level)) {
            creature.xp -= this.xpForLevel(creature.level);
            creature.level++;

            const result = { levelUp: true, newLevel: creature.level, evolved: false, mutated: false };

            // Verifica evolução
            const template = CreaturesDB[creature.templateId];
            if (template.evolution && creature.level >= template.evolution.level && !creature.evolved) {
                const evolvedTemplate = CreaturesDB[template.evolution.to];
                if (evolvedTemplate) {
                    creature.templateId = evolvedTemplate.id;
                    creature.name = evolvedTemplate.name;
                    creature.element = evolvedTemplate.element;
                    creature.baseStats = Helpers.deepClone(evolvedTemplate.baseStats);
                    creature.moves = [...evolvedTemplate.moves];
                    creature.rarity = evolvedTemplate.rarity;
                    creature.baseCritChance = evolvedTemplate.baseCritChance;
                    creature.spriteColor = creature.isShiny ? evolvedTemplate.spriteShinyColor : evolvedTemplate.spriteColor;
                    creature.evolved = true;
                    result.evolved = true;
                    result.evolvedTo = evolvedTemplate.name;
                }
            }

            // Chance de mutação
            if (Helpers.chance(CONST.BREED_MUTATION_CHANCE)) {
                const mutation = this.generateMutation(creature);
                if (mutation) {
                    result.mutated = true;
                    result.mutation = mutation;
                }
            }

            results.push(result);
        }

        return results;
    }

    /**
     * Gera uma mutação aleatória
     */
    static generateMutation(creature) {
        const mutations = [
            { type: 'stat_boost', stat: 'hp', amount: Helpers.randomInt(2, 5) },
            { type: 'stat_boost', stat: 'attack', amount: Helpers.randomInt(2, 5) },
            { type: 'stat_boost', stat: 'defense', amount: Helpers.randomInt(2, 5) },
            { type: 'stat_boost', stat: 'speed', amount: Helpers.randomInt(2, 5) },
            { type: 'crit_boost', amount: 0.01 },
            { type: 'trait', trait: Helpers.randomPick(['hardy', 'swift', 'tough', 'fierce', 'lucky']) }
        ];

        const mutation = Helpers.randomPick(mutations);

        if (mutation.type === 'stat_boost') {
            creature.mutationBonuses = creature.mutationBonuses || {};
            creature.mutationBonuses[mutation.stat] = (creature.mutationBonuses[mutation.stat] || 0) + mutation.amount;
        } else if (mutation.type === 'crit_boost') {
            creature.mutationBonuses = creature.mutationBonuses || {};
            creature.mutationBonuses.critChance = (creature.mutationBonuses.critChance || 0) + mutation.amount;
        } else if (mutation.type === 'trait') {
            creature.traits = creature.traits || [];
            if (!creature.traits.includes(mutation.trait)) {
                creature.traits.push(mutation.trait);
            }
        }

        return mutation;
    }

    /**
     * Verifica se pode evoluir por genética (upgrade de estrelas)
     * Requer acumular stats suficientes
     */
    static canUpgradeGenetics(creature) {
        if (creature.genetics >= CONST.MAX_GENETICS) return false;
        // Requer nível 10 por estrela de genética
        return creature.level >= creature.genetics * 10;
    }

    /**
     * Tenta upgrade de genética (chance baseada em nível)
     */
    static attemptGeneticsUpgrade(creature) {
        if (!this.canUpgradeGenetics(creature)) return false;

        const chance = 0.1 + (creature.level - creature.genetics * 10) * 0.02;
        if (Helpers.chance(Helpers.clamp(chance, 0.05, 0.5))) {
            creature.genetics++;
            
            // Se chegou a 5 estrelas, vira shiny
            if (creature.genetics >= 5 && !creature.isShiny) {
                creature.isShiny = true;
                const template = CreaturesDB[creature.templateId];
                if (template) {
                    creature.spriteColor = template.spriteShinyColor;
                }
            }

            return true;
        }
        return false;
    }
}