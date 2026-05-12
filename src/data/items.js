const ItemsDB = {
    // Runas de captura
    rune_common: {
        id: 'rune_common',
        name: 'Runa Comum',
        icon: 'icon_rune_common',
        type: 'rune',
        captureRate: 1.0,
        price: 100,
        description: 'Runa básica de captura.',
        color: 0xecf0f1
    },
    rune_advanced: {
        id: 'rune_advanced',
        name: 'Runa Avançada',
        icon: 'icon_rune_advanced',
        type: 'rune',
        captureRate: 1.5,
        price: 300,
        description: 'Runa com taxa de captura melhorada.',
        color: 0x3498db
    },
    rune_rare: {
        id: 'rune_rare',
        name: 'Runa Rara',
        icon: 'icon_rune_rare',
        type: 'rune',
        captureRate: 2.5,
        price: 800,
        description: 'Runa de alta performance.',
        color: 0xf1c40f
    },

    // Poções
    potion_small: {
        id: 'potion_small',
        name: 'Poção Pequena',
        icon: 'icon_rune_heal_small',
        type: 'consumable',
        healAmount: 30,
        price: 50,
        description: 'Recupera 30 HP.'
    },
    potion_medium: {
        id: 'potion_medium',
        name: 'Poção Média',
        icon: 'icon_rune_heal_medium',
        type: 'consumable',
        healAmount: 70,
        price: 150,
        description: 'Recupera 70 HP.'
    },
    potion_large: {
        id: 'potion_large',
        name: 'Poção Grande',
        icon: 'icon_rune_heal_large',
        type: 'consumable',
        healAmount: 150,
        price: 400,
        description: 'Recupera 150 HP.'
    },

    // Cura de status
    antidote: {
        id: 'antidote',
        name: 'Antídoto',
        icon: 'icon_rune_antidote',
        type: 'consumable',
        cureStatus: 'poison',
        price: 75,
        description: 'Cura envenenamento.'
    },
    thaw_crystal: {
        id: 'thaw_crystal',
        name: 'Cristal de Degelo',
        icon: 'icon_rune_heal_ice',
        type: 'consumable',
        cureStatus: 'freeze',
        price: 75,
        description: 'Descongela a criatura.'
    },
    full_cure: {
        id: 'full_cure',
        name: 'Cura Total',
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
    potion_small: 3
};

// Itens da loja por mapa
const ShopInventory = {
    town: ['rune_common', 'rune_advanced', 'potion_small', 'potion_medium', 'antidote', 'full_cure'],
    route3_shop: ['rune_common', 'rune_advanced', 'rune_rare', 'potion_medium', 'potion_large', 'full_cure', 'thaw_crystal']
};