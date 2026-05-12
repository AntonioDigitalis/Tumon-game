const ElementTable = {
    types: ['fire', 'water', 'plant', 'electric', 'earth', 'ice', 'psychic', 'dark', 'normal'],

    names: {
        fire: 'Fogo',
        water: 'Água',
        plant: 'Planta',
        electric: 'Elétrico',
        earth: 'Terra',
        ice: 'Gelo',
        psychic: 'Psíquico',
        dark: 'Sombrio',
        normal: 'Normal'
    },

    // 2.0 = super efetivo, 0.5 = resistido, 0 = imune
    // effectiveness[atacante][defensor]
    effectiveness: {
        fire:     { fire: 0.5, water: 0.5, plant: 2.0, electric: 1.0, earth: 1.0, ice: 2.0, psychic: 1.0, dark: 1.0, normal: 1.0 },
        water:    { fire: 2.0, water: 0.5, plant: 0.5, electric: 1.0, earth: 2.0, ice: 1.0, psychic: 1.0, dark: 1.0, normal: 1.0 },
        plant:    { fire: 0.5, water: 2.0, plant: 0.5, electric: 1.0, earth: 2.0, ice: 1.0, psychic: 1.0, dark: 1.0, normal: 1.0 },
        electric: { fire: 1.0, water: 2.0, plant: 0.5, electric: 0.5, earth: 0.0, ice: 1.0, psychic: 1.0, dark: 1.0, normal: 1.0 },
        earth:    { fire: 2.0, water: 1.0, plant: 0.5, electric: 2.0, earth: 1.0, ice: 1.0, psychic: 1.0, dark: 1.0, normal: 1.0 },
        ice:      { fire: 0.5, water: 0.5, plant: 2.0, electric: 1.0, earth: 2.0, ice: 0.5, psychic: 1.0, dark: 1.0, normal: 1.0 },
        psychic:  { fire: 1.0, water: 1.0, plant: 1.0, electric: 1.0, earth: 1.0, ice: 1.0, psychic: 0.5, dark: 0.0, normal: 1.0 },
        dark:     { fire: 1.0, water: 1.0, plant: 1.0, electric: 1.0, earth: 1.0, ice: 1.0, psychic: 2.0, dark: 0.5, normal: 1.0 },
        normal:   { fire: 1.0, water: 1.0, plant: 1.0, electric: 1.0, earth: 1.0, ice: 1.0, psychic: 1.0, dark: 1.0, normal: 1.0 }
    },

    /**
     * Retorna multiplicador de efetividade
     */
    getEffectiveness(atkElement, defElement) {
        if (!this.effectiveness[atkElement]) return 1.0;
        return this.effectiveness[atkElement][defElement] ?? 1.0;
    },

    /**
     * Retorna texto de efetividade
     */
    getEffectivenessText(multiplier) {
        if (multiplier >= 2.0) return 'Super efetivo!';
        if (multiplier <= 0) return 'Sem efeito...';
        if (multiplier < 1.0) return 'Pouco efetivo...';
        return '';
    }
};