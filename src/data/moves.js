const MovesDB = {
    // FOGO
    ember: {
        id: 'ember',
        name: 'Brasa',
        element: 'fire',
        power: 40,
        accuracy: 100,
        pp: 25,
        effect: null,
        description: 'Lança uma pequena bola de fogo.'
    },
    inferno: {
        id: 'inferno',
        name: 'Inferno',
        element: 'fire',
        power: 75,
        accuracy: 85,
        pp: 10,
        effect: { type: 'burn', chance: 0.3 },
        description: 'Chamas intensas. Pode queimar.'
    },
    fire_fang: {
        id: 'fire_fang',
        name: 'Presa Ígnea',
        element: 'fire',
        power: 60,
        accuracy: 95,
        pp: 15,
        effect: { type: 'burn', chance: 0.15 },
        description: 'Mordida flamejante.'
    },

    // ÁGUA
    splash: {
        id: 'splash',
        name: 'Jato d\'Água',
        element: 'water',
        power: 40,
        accuracy: 100,
        pp: 25,
        effect: null,
        description: 'Jato de água pressurizado.'
    },
    tidal_wave: {
        id: 'tidal_wave',
        name: 'Onda Gigante',
        element: 'water',
        power: 80,
        accuracy: 80,
        pp: 8,
        effect: null,
        description: 'Uma onda devastadora.'
    },
    aqua_heal: {
        id: 'aqua_heal',
        name: 'Cura Aquática',
        element: 'water',
        power: 0,
        accuracy: 100,
        pp: 10,
        effect: { type: 'heal', amount: 0.3 },
        description: 'Recupera 30% do HP máximo.'
    },

    // PLANTA
    vine_whip: {
        id: 'vine_whip',
        name: 'Chicote de Vinha',
        element: 'plant',
        power: 40,
        accuracy: 100,
        pp: 25,
        effect: null,
        description: 'Golpeia com vinhas flexíveis.'
    },
    thorn_barrage: {
        id: 'thorn_barrage',
        name: 'Chuva de Espinhos',
        element: 'plant',
        power: 65,
        accuracy: 90,
        pp: 15,
        effect: { type: 'poison', chance: 0.2 },
        description: 'Lança espinhos venenosos.'
    },
    root_bind: {
        id: 'root_bind',
        name: 'Raiz Prendedora',
        element: 'plant',
        power: 50,
        accuracy: 85,
        pp: 15,
        effect: { type: 'stun', chance: 0.25 },
        description: 'Raízes prendem o inimigo.'
    },

    // ELÉTRICO
    spark: {
        id: 'spark',
        name: 'Faísca',
        element: 'electric',
        power: 40,
        accuracy: 100,
        pp: 25,
        effect: null,
        description: 'Descarga elétrica leve.'
    },
    thunderbolt: {
        id: 'thunderbolt',
        name: 'Trovão',
        element: 'electric',
        power: 80,
        accuracy: 85,
        pp: 10,
        effect: { type: 'stun', chance: 0.2 },
        description: 'Raio devastador. Pode paralisar.'
    },
    static_field: {
        id: 'static_field',
        name: 'Campo Estático',
        element: 'electric',
        power: 30,
        accuracy: 100,
        pp: 20,
        effect: { type: 'stun', chance: 0.4 },
        description: 'Campo elétrico paralisante.'
    },

    // TERRA
    sand_strike: {
        id: 'sand_strike',
        name: 'Golpe de Areia',
        element: 'earth',
        power: 45,
        accuracy: 100,
        pp: 25,
        effect: null,
        description: 'Ataca com areia compactada.'
    },
    earthquake: {
        id: 'earthquake',
        name: 'Terremoto',
        element: 'earth',
        power: 85,
        accuracy: 80,
        pp: 8,
        effect: null,
        description: 'O chão treme violentamente.'
    },

    // GELO
    frost_bite: {
        id: 'frost_bite',
        name: 'Mordida Gélida',
        element: 'ice',
        power: 50,
        accuracy: 95,
        pp: 20,
        effect: { type: 'freeze', chance: 0.15 },
        description: 'Mordida congelante.'
    },
    blizzard: {
        id: 'blizzard',
        name: 'Nevasca',
        element: 'ice',
        power: 80,
        accuracy: 75,
        pp: 8,
        effect: { type: 'freeze', chance: 0.25 },
        description: 'Tempestade de gelo devastadora.'
    },
    ice_shard: {
        id: 'ice_shard',
        name: 'Estilhaço de Gelo',
        element: 'ice',
        power: 40,
        accuracy: 100,
        pp: 25,
        effect: null,
        description: 'Fragmento de gelo afiado.'
    },

    // PSÍQUICO
    mind_blast: {
        id: 'mind_blast',
        name: 'Explosão Mental',
        element: 'psychic',
        power: 55,
        accuracy: 95,
        pp: 20,
        effect: null,
        description: 'Onda psíquica concentrada.'
    },
    confusion: {
        id: 'confusion',
        name: 'Confusão',
        element: 'psychic',
        power: 40,
        accuracy: 100,
        pp: 25,
        effect: { type: 'stun', chance: 0.2 },
        description: 'Perturba a mente do inimigo.'
    },
    psychic_surge: {
        id: 'psychic_surge',
        name: 'Surto Psíquico',
        element: 'psychic',
        power: 80,
        accuracy: 85,
        pp: 10,
        effect: { type: 'debuff_def', amount: 0.15 },
        description: 'Reduz a defesa do alvo.'
    },

    // SOMBRIO
    shadow_claw: {
        id: 'shadow_claw',
        name: 'Garra Sombria',
        element: 'dark',
        power: 55,
        accuracy: 95,
        pp: 20,
        effect: null,
        description: 'Garra feita de escuridão pura.'
    },
    dark_pulse: {
        id: 'dark_pulse',
        name: 'Pulso Negro',
        element: 'dark',
        power: 75,
        accuracy: 90,
        pp: 12,
        effect: { type: 'stun', chance: 0.15 },
        description: 'Onda de energia sombria.'
    },
    drain_life: {
        id: 'drain_life',
        name: 'Drenar Vida',
        element: 'dark',
        power: 50,
        accuracy: 100,
        pp: 15,
        effect: { type: 'drain', amount: 0.5 },
        description: 'Drena HP do inimigo. Cura 50% do dano.'
    },

    // NORMAL
    tackle: {
        id: 'tackle',
        name: 'Investida',
        element: 'normal',
        power: 40,
        accuracy: 100,
        pp: 35,
        effect: null,
        description: 'Ataque corpo a corpo básico.'
    },
    bite: {
        id: 'bite',
        name: 'Mordida',
        element: 'normal',
        power: 50,
        accuracy: 95,
        pp: 25,
        effect: null,
        description: 'Mordida forte.'
    },
    rally: {
        id: 'rally',
        name: 'Motivar',
        element: 'normal',
        power: 0,
        accuracy: 100,
        pp: 15,
        effect: { type: 'buff_atk', amount: 0.25 },
        description: 'Aumenta ataque em 25%.'
    },
    harden: {
        id: 'harden',
        name: 'Endurecer',
        element: 'normal',
        power: 0,
        accuracy: 100,
        pp: 20,
        effect: { type: 'buff_def', amount: 0.25 },
        description: 'Aumenta defesa em 25%.'
    }
};