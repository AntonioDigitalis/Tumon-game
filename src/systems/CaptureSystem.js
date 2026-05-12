// ============================================
// CAPTURE SYSTEM — Lógica de captura
// ============================================

class CaptureSystem {
    /**
     * Calcula chance de captura
     */
    static calculateCaptureChance(creature, runeId, achievementBonus = 0) {
        const rune = ItemsDB[runeId];
        if (!rune) return 0;

        // Base chance
        let chance = 0.5;

        // HP factor (menos HP = mais chance)
        const hpRatio = creature.currentHp / creature.getMaxHp();
        chance += (1 - hpRatio) * 0.3; // até +30%

        // Status bonus
        if (creature.status === 'freeze') chance += 0.15;
        if (creature.status === 'stun') chance += 0.12;
        if (creature.status === 'poison') chance += 0.08;
        if (creature.status === 'burn') chance += 0.08;

        // Rarity penalty
        const rarityPenalty = {
            common: 0,
            uncommon: -0.1,
            rare: -0.25,
            legendary: -0.45
        };
        chance += rarityPenalty[creature.rarity] || 0;

        // Genetics penalty (criaturas de genética alta são mais difíceis)
        chance -= (creature.genetics - 1) * 0.05;

        // rune multiplier
        chance *= rune.captureRate;

        // Achievement bonus
        chance += achievementBonus;

        // Clamp
        return Helpers.clamp(chance, 0.05, 0.95);
    }

    /**
     * Tenta capturar uma criatura
     */
    static attemptCapture(creature, runeId, achievementBonus = 0) {
        const chance = this.calculateCaptureChance(creature, runeId, achievementBonus);
        const success = Helpers.chance(chance);

        // Número de "shakes" (1-3) para animação
        let shakes = 0;
        if (!success) {
            // Quanto mais perto da captura, mais shakes
            if (Helpers.chance(chance * 0.8)) shakes = 2;
            else if (Helpers.chance(chance * 0.5)) shakes = 1;
        } else {
            shakes = 3; // Captura bem-sucedida
        }

        return {
            success,
            chance: Math.round(chance * 100),
            shakes,
            runeUsed: runeId
        };
    }
}