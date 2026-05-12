// ============================================
// ENCOUNTER SYSTEM — Encontros aleatórios
// ============================================

class EncounterSystem {
    /**
     * Verifica se ocorre encontro ao pisar em grama alta
     */
    static checkEncounter(mapId) {
        if (!EncounterTables[mapId]) return null;
        if (!Helpers.chance(CONST.ENCOUNTER_CHANCE)) return null;

        return this.generateEncounter(mapId);
    }

    /**
     * Gera uma criatura selvagem
     */
    static generateEncounter(mapId) {
        const table = EncounterTables[mapId];
        const levels = EncounterLevels[mapId];
        if (!table || !levels) return null;

        // Weighted random selection
        const totalWeight = table.reduce((sum, e) => sum + e.weight, 0);
        let roll = Math.random() * totalWeight;

        let selectedId = table[0].id;
        for (const entry of table) {
            roll -= entry.weight;
            if (roll <= 0) {
                selectedId = entry.id;
                break;
            }
        }

        // Gera nível
        const level = Helpers.randomInt(levels.min, levels.max);

        // Gera genética (maioria 1-2, raramente 3+)
        let genetics = 1;
        if (Helpers.chance(0.25)) genetics = 2;
        if (Helpers.chance(0.08)) genetics = 3;
        if (Helpers.chance(0.02)) genetics = 4;
        if (Helpers.chance(0.005)) genetics = 5;

        // Cria criatura
        const creature = new Creature(selectedId, level, genetics);

        // Shiny check
        const template = CreaturesDB[selectedId];
        if (template && Helpers.chance(template.shinyChance)) {
            creature.isShiny = true;
            creature.spriteColor = template.spriteShinyColor;
            creature.genetics = Math.max(creature.genetics, 4); // Shiny tem pelo menos 4 estrelas
        }

        return creature;
    }
}