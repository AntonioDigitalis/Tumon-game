const Helpers = {
    /**
     * Número aleatório entre min e max (inclusive)
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Float aleatório entre min e max
     */
    randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    },

    /**
     * Retorna true com a probabilidade dada (0.0 a 1.0)
     */
    chance(probability) {
        return Math.random() < probability;
    },

    /**
     * Escolhe item aleatório de array
     */
    randomPick(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },

    /**
     * Clamp de valor
     */
    clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    },

    /**
     * Deep clone de objeto
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Gera UUID simples
     */
    uuid() {
        return 'xxxx-xxxx-xxxx'.replace(/x/g, () =>
            Math.floor(Math.random() * 16).toString(16)
        );
    },

    /**
     * Formata número com separador de milhar
     */
    formatNumber(n) {
        return n.toLocaleString('pt-BR');
    },

    /**
     * Estrelas de genética como string
     */
    geneticStars(genetics) {
        return '★'.repeat(genetics) + '☆'.repeat(CONST.MAX_GENETICS - genetics);
    },

    /**
     * Calcula stat com level, genética e tier
     */
    calcStat(base, level, genetics, tier) {
        const geneticMult = 1 + (genetics - 1) * 0.1;
        const tierMult = 1 + (tier - 1) * 0.15;
        return Math.floor(base * geneticMult * tierMult * (1 + level * 0.05));
    },

    /**
     * Cor hex para integer Phaser
     */
    hexToInt(hex) {
        return parseInt(hex.replace('#', ''), 16);
    },

    /**
     * Lerp
     */
    lerp(a, b, t) {
        return a + (b - a) * t;
    }
};
