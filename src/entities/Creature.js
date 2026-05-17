class Creature {
    constructor(templateId, level = 1, genetics = 1) {
        const template = CreaturesDB[templateId];
        if (!template) throw new Error(`Creature template not found: ${templateId}`);

        this.uid        = Helpers.uuid();
        this.templateId = templateId;

        this.name    = template.name;
        this.element = template.element;
        this.rarity  = template.rarity;

        this.level    = level;
        this.xp       = 0;
        this.genetics = Helpers.clamp(genetics, CONST.MIN_GENETICS, CONST.MAX_GENETICS);
        this.tier     = 1;

        this.isShiny = false;
        this.evolved = false;

        // stats
        this.baseStats      = Helpers.deepClone(template.baseStats);
        this.baseCritChance = template.baseCritChance;
        this.baseAccuracy   = template.baseAccuracy;

        // sistema interno
        this.mutationBonuses = {};
        this.traits = [];

        this.buffAttack  = 0;
        this.buffDefense = 0;

        this.status = null;
        this.statusTurns = 0;

        // 💥 SPRITE SYSTEM (CORRIGIDO)
        this.spriteColor = template.spriteColor;

        // usa PNG se existir
        this.spriteKey = template.spriteKey || template.id;

        // shiny: exclusivo para genética 5/5
        if (this.genetics >= 5) {
            this.isShiny = true;
            if (template.spriteShinyKey) this.spriteKey = template.spriteShinyKey;
            if (template.spriteShinyColor) this.spriteColor = template.spriteShinyColor;
        }

        this.currentHp = this.getMaxHp();

        this.moves = [...template.moves];
    }

    getMaxHp() {
        const base = this.baseStats.hp + (this.mutationBonuses.hp || 0);
        return Helpers.calcStat(base, this.level, this.genetics, this.tier) + 10;
    }

    getEffectiveStat(stat) {
        if (stat === 'accuracy') return this.baseAccuracy;

        const base = (this.baseStats[stat] || 0) +
            ((this.mutationBonuses && this.mutationBonuses[stat]) || 0);

        let value = Helpers.calcStat(base, this.level, this.genetics, this.tier);

        if (stat === 'attack')  value *= (1 + this.buffAttack);
        if (stat === 'defense') value *= (1 + this.buffDefense);

        if (this.traits.includes('swift')  && stat === 'speed')   value *= 1.1;
        if (this.traits.includes('tough')  && stat === 'defense') value *= 1.1;
        if (this.traits.includes('fierce') && stat === 'attack')  value *= 1.1;
        if (this.traits.includes('hardy')  && stat === 'hp')      value *= 1.1;

        if (this.status === 'burn' && stat === 'attack') value *= 0.85;

        return Math.max(1, Math.floor(value));
    }

    getEffectiveCritChance() {
        let crit = this.baseCritChance +
            ((this.mutationBonuses && this.mutationBonuses.critChance) || 0);

        crit += (this.tier - 1) * 0.02;
        if (this.traits.includes('lucky')) crit += 0.05;

        return Helpers.clamp(crit, 0.01, 0.5);
    }

    fullHeal() {
        this.currentHp = this.getMaxHp();
        this.status = null;
        this.statusTurns = 0;
        this.buffAttack = 0;
        this.buffDefense = 0;
    }

    resetBattleBuffs() {
        this.buffAttack = 0;
        this.buffDefense = 0;
    }

    isAlive() {
        return this.currentHp > 0;
    }

    serialize() {
        return {
            uid: this.uid,
            templateId: this.templateId,
            name: this.name,
            element: this.element,
            rarity: this.rarity,
            level: this.level,
            xp: this.xp,
            genetics: this.genetics,
            tier: this.tier,
            isShiny: this.isShiny,
            evolved: this.evolved,
            baseStats: Helpers.deepClone(this.baseStats),
            baseCritChance: this.baseCritChance,
            baseAccuracy: this.baseAccuracy,
            currentHp: this.currentHp,
            moves: [...this.moves],
            status: this.status,
            statusTurns: this.statusTurns,
            mutationBonuses: Helpers.deepClone(this.mutationBonuses),
            traits: [...this.traits],
            spriteColor: this.spriteColor,
            spriteKey: this.spriteKey
        };
    }

    static deserialize(data) {
        const creature = Object.create(Creature.prototype);
        Object.assign(creature, data);

        creature.buffAttack = 0;
        creature.buffDefense = 0;
        creature.mutationBonuses = data.mutationBonuses || {};
        creature.traits = data.traits || [];
        creature.status = data.status || null;
        creature.statusTurns = data.statusTurns || 0;

        return creature;
    }
}