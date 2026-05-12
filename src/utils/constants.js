const CONST = {
    // Display
    GAME_WIDTH: 800,
    GAME_HEIGHT: 600,
    TILE_SIZE: 32,

    // Player
    PLAYER_SPEED: 160,
    MAX_PARTY_SIZE: 6,

    // Encounter
    ENCOUNTER_CHANCE: 0.12, // 12% por tile de grama
    
    // Capture
    SPHERE_RATES: {
        common: 1.0,
        advanced: 1.5,
        rare: 2.5
    },

    // Genetics
    MIN_GENETICS: 1,
    MAX_GENETICS: 5,

    // Fusion
    FUSION_SUCCESS_RATE: 0.5,
    MAX_TIER: 3,

    // Breeding
    BREED_MUTATION_CHANCE: 0.08,
    BREED_SHINY_CHANCE: 0.02,

    // Battle
    CRIT_MULTIPLIER: 1.5,
    STAB_BONUS: 1.25, // Same Type Attack Bonus
    
    // Status durations (turns)
    STATUS_DURATION: {
        burn: 4,
        poison: 5,
        freeze: 2,
        stun: 1
    },

    // Economy
    BASE_WILD_GOLD: 15,
    LEADER_GOLD: 500,

    // Save
    SAVE_KEY: 'nexomon_tamer_save',
    AUTOSAVE_INTERVAL: 30000, // 30 seconds

    // Map IDs
    MAPS: {
        TOWN: 'town',
        ROUTE_1: 'route1',
        ROUTE_2: 'route2',
        ROUTE_3: 'route3',
        CAVE: 'cave'
    },

    // Element colors
    ELEMENT_COLORS: {
        fire: '#e74c3c',
        water: '#3498db',
        plant: '#2ecc71',
        electric: '#f1c40f',
        earth: '#a0522d',
        ice: '#87ceeb',
        psychic: '#9b59b6',
        dark: '#2c3e50',
        normal: '#bdc3c7'
    },

    // Rarity colors
    RARITY_COLORS: {
        common: '#bdc3c7',
        uncommon: '#2ecc71',
        rare: '#3498db',
        legendary: '#f1c40f'
    }
};