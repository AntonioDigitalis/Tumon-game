// ============================================
// ACHIEVEMENT SYSTEM — Conquistas e bônus
// ============================================

class AchievementSystem {
    constructor() {
        this.achievements = Helpers.deepClone(AchievementsDB);
        this.notifications = [];
    }

    /**
     * Carrega estado de achievements
     */
    loadState(savedAchievements) {
        if (!savedAchievements) return;
        for (const [id, unlocked] of Object.entries(savedAchievements)) {
            if (this.achievements[id]) {
                this.achievements[id].unlocked = unlocked;
            }
        }
    }

    /**
     * Exporta estado para save
     */
    exportState() {
        const state = {};
        for (const [id, ach] of Object.entries(this.achievements)) {
            state[id] = ach.unlocked;
        }
        return state;
    }

    /**
     * Verifica e desbloqueia achievements
     */
    check(playerStats, playerData) {
        const newUnlocks = [];

        for (const [id, ach] of Object.entries(this.achievements)) {
            if (ach.unlocked) continue;

            let unlocked = false;
            const cond = ach.condition;

            switch (cond.type) {
                case 'captures':
                    unlocked = playerStats.captures >= cond.count;
                    break;
                case 'evolutions':
                    unlocked = playerStats.evolutions >= cond.count;
                    break;
                case 'fusions':
                    unlocked = playerStats.fusions >= cond.count;
                    break;
                case 'battles_won':
                    unlocked = playerStats.battlesWon >= cond.count;
                    break;
                case 'shiny':
                    unlocked = playerStats.shiniesFound >= cond.count;
                    break;
                case 'leader':
                    unlocked = playerData.defeatedLeaders && playerData.defeatedLeaders.includes(cond.leaderId);
                    break;
                case 'genetics':
                    unlocked = playerData.party && playerData.party.some(c => c.genetics >= cond.stars);
                    break;
            }

            if (unlocked) {
                ach.unlocked = true;
                newUnlocks.push(ach);
                this.notifications.push(ach);
            }
        }

        return newUnlocks;
    }

    /**
     * Calcula bônus totais de achievements
     */
    getTotalBonuses() {
        const bonuses = { captureRate: 0, critRate: 0, lootRate: 0 };

        for (const ach of Object.values(this.achievements)) {
            if (ach.unlocked && ach.bonus) {
                for (const [key, val] of Object.entries(ach.bonus)) {
                    bonuses[key] = (bonuses[key] || 0) + val;
                }
            }
        }

        return bonuses;
    }

    /**
     * Retorna notificação pendente
     */
    popNotification() {
        return this.notifications.shift() || null;
    }
}