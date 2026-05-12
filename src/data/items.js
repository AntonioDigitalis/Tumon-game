const ItemsDB = {
    // Esferas de captura
    sphere_common: {
        id: 'sphere_common',
        name: 'Esfera Comum',
        type: 'sphere',
        captureRate: 1.0,
        price: 100,
        description: 'Esfera básica de captura.',
        color: 0xecf0f1
    },
    sphere_advanced: {
        id: 'sphere_advanced',
        name: 'Esfera Avançada',
        type: 'sphere',
        captureRate: 1.5,
        price: 300,
        description: 'Esfera com taxa de captura melhorada.',
        color: 0x3498db
    },
    sphere_rare: {
        id: 'sphere_rare',
        name: 'Esfera Rara',
        type: 'sphere',
        captureRate: 2.5,
        price: 800,
        description: 'Esfera de alta performance.',
        color: 0xf1c40f
    },

    // Poções
    potion_small: {
        id: 'potion_small',
        name: 'Poção Pequena',
        type: 'consumable',
        healAmount: 30,
        price: 50,
        description: 'Recupera 30 HP.'
    },
    potion_medium: {
        id: 'potion_medium',
        name: 'Poção Média',
        type: 'consumable',
        healAmount: 70,
        price: 150,
        description: 'Recupera 70 HP.'
    },
    potion_large: {
        id: 'potion_large',
        name: 'Poção Grande',
        type: 'consumable',
        healAmount: 150,
        price: 400,
        description: 'Recupera 150 HP.'
    },

    // Cura de status
    antidote: {
        id: 'antidote',
        name: 'Antídoto',
        type: 'consumable',
        cureStatus: 'poison',
        price: 75,
        description: 'Cura envenenamento.'
    },
    thaw_crystal: {
        id: 'thaw_crystal',
        name: 'Cristal de Degelo',
        type: 'consumable',
        cureStatus: 'freeze',
        price: 75,
        description: 'Descongela a criatura.'
    },
    full_cure: {
        id: 'full_cure',
        name: 'Cura Total',
        type: 'consumable',
        cureStatus: 'all',
        price: 200,
        description: 'Remove qualquer efeito negativo.'
    }
};

// Inventário inicial do jogador
const DEFAULT_INVENTORY = {
    sphere_common: 5,
    potion_small: 3
};

// Itens da loja por mapa
const ShopInventory = {
    town: ['sphere_common', 'sphere_advanced', 'potion_small', 'potion_medium', 'antidote', 'full_cure'],
    route3_shop: ['sphere_common', 'sphere_advanced', 'sphere_rare', 'potion_medium', 'potion_large', 'full_cure', 'thaw_crystal']
};