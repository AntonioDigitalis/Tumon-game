// ============================================
// BREEDING SYSTEM — Reprodução e genética
// ============================================

class BreedingSystem {
    /**
     * Verifica se duas criaturas podem reproduzir
     */
    static canBreed(creature1, creature2) {
        if (!creature1 || !creature2) return { can: false, reason: 'Selecione duas criaturas.' };
        if (creature1.uid === creature2.uid) return { can: false, reason: 'Não pode cruzar consigo mesma.' };
        if (creature1.level < 5 || creature2.level < 5) return { can: false, reason: 'Ambas precisam ser nível 5+.' };

        return { can: true, reason: 'Breeding possível!' };
    }

    /**
     * Gera filhote
     */
    static breed(creature1, creature2) {
        const check = this.canBreed(creature1, creature2);
        if (!check.can) return { success: false, reason: check.reason };

        // Filhote é da espécie de um dos pais (aleatório)
        const parentTemplate = Helpers.chance(0.5) ? creature1 : creature2;
        const templateData = CreaturesDB[parentTemplate.templateId];

        // Se a criatura evoluiu, filhote nasce na forma base
        let baseTemplateId = parentTemplate.templateId;
        // Procura forma base (simples: verifica se alguma criatura evolui para esta)
        for (const [id, data] of Object.entries(CreaturesDB)) {
            if (data.evolution && data.evolution.to === parentTemplate.templateId) {
                baseTemplateId = id;
                break;
            }
        }

        const baseTemplate = CreaturesDB[baseTemplateId];

        // Genética do filhote
        const avgGenetics = (creature1.genetics + creature2.genetics) / 2;
        let childGenetics = Math.floor(avgGenetics);
        
        // Chance de genética +1 baseada na média
        if (Helpers.chance(avgGenetics - childGenetics + 0.1)) {
            childGenetics = Math.min(CONST.MAX_GENETICS, childGenetics + 1);
        }
        childGenetics = Helpers.clamp(childGenetics, CONST.MIN_GENETICS, CONST.MAX_GENETICS);

        // Cria filhote (shiny definido automaticamente pelo construtor se genetics === 5)
        const child = new Creature(baseTemplateId, 1, childGenetics);

        // Herda parte dos stats via mutação
        if (Helpers.chance(CONST.BREED_MUTATION_CHANCE * 2)) { // Breeding tem mais chance de mutação
            EvolutionSystem.generateMutation(child);
        }

        // Herda traits dos pais
        const allTraits = [...(creature1.traits || []), ...(creature2.traits || [])];
        const uniqueTraits = [...new Set(allTraits)];
        uniqueTraits.forEach(trait => {
            if (Helpers.chance(0.3)) {
                child.traits = child.traits || [];
                if (!child.traits.includes(trait)) {
                    child.traits.push(trait);
                }
            }
        });

        return {
            success: true,
            child,
            parents: [creature1.name, creature2.name]
        };
    }
}