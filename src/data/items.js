const ItemsDB = {
    // Runas de captura
    rune_common: {
        id: 'rune_common',
        name: 'Runa de Vinculação I',
        icon: 'icon_rune_common',
        type: 'rune',
        captureRate: 1.0,
        price: 100,
        description: 'Runa básica de captura.',
        color: 0x11d535
    },
    rune_advanced: {
        id: 'rune_advanced',
        name: 'Runa de Vinculação II',
        icon: 'icon_rune_advanced',
        type: 'rune',
        captureRate: 1.5,
        price: 300,
        description: 'Runa com taxa de captura melhorada.',
        color: 0x2b4ff1
    },
    rune_rare: {
        id: 'rune_rare',
        name: 'Runa de Vinculação III',
        icon: 'icon_rune_rare',
        type: 'rune',
        captureRate: 2.5,
        price: 800,
        description: 'Runa de alta performance.',
        color: 0xfa3636
    },

    // Poções
    rune_heal_small: {
        id: 'rune_heal_small',
        name: 'Runa de Cura Pequena',
        icon: 'icon_rune_heal_small',
        type: 'consumable',
        healAmount: 30,
        price: 50,
        description: 'Recupera 30 HP.'
    },
    rune_heal_medium: {
        id: 'rune_heal_medium',
        name: 'Runa de Cura Média',
        icon: 'icon_rune_heal_medium',
        type: 'consumable',
        healAmount: 70,
        price: 150,
        description: 'Recupera 70 HP.'
    },
    rune_heal_large: {
        id: 'rune_heal_large',
        name: 'Runa de Cura Grande',
        icon: 'icon_rune_heal_large',
        type: 'consumable',
        healAmount: 150,
        price: 400,
        description: 'Recupera 150 HP.'
    },

    // Cura de status
    rune_heal_antidote: {
        id: 'rune_heal_antidote',
        name: 'Runa de Antídoto',
        icon: 'icon_rune_heal_antidote',
        type: 'consumable',
        cureStatus: 'poison',
        price: 75,
        description: 'Cura envenenamento.'
    },
    rune_heal_ice: {
        id: 'rune_heal_ice',
        name: 'Runa de Degelo',
        icon: 'icon_rune_heal_ice',
        type: 'consumable',
        cureStatus: 'freeze',
        price: 75,
        description: 'Descongela a criatura.'
    },
    rune_heal_all: {
        id: 'rune_heal_all',
        name: 'Runa de Cura Total',
        icon: 'icon_rune_heal_all',
        type: 'consumable',
        cureStatus: 'all',
        price: 200,
        description: 'Remove qualquer efeito negativo.'
    }
};

// Inventário inicial do jogador
const DEFAULT_INVENTORY = {
    rune_common: 5,
    rune_heal_small: 3
};

// Itens da loja por mapa
const ShopInventory = {
    town: ['rune_common', 'rune_advanced', 'rune_heal_small', 'rune_heal_medium', 'rune_heal_antidote', 'rune_heal_all'],
    route3_shop: ['rune_common', 'rune_advanced', 'rune_rare', 'rune_heal_medium', 'rune_heal_large', 'rune_heal_all', 'rune_heal_ice']
};