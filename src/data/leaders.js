// ============================================
// LEADERS — Líderes Elementais (Bosses)
// ============================================

const LeadersDB = {
    leader_fire: {
        id: 'leader_fire',
        name: 'Líder Ignis',
        title: 'Mestre do Fogo',
        mapId: 'route3',
        x: 12,
        y: 20,
        color: 0xe74c3c,
        dialog: {
            before: [
                'Eu sou Ignis, Mestre do Fogo!',
                'Prove que pode suportar o calor!'
            ],
            after: [
                'Impressionante... você apagou minhas chamas.',
                'Tome este Badge de Fogo como prova da sua força!'
            ]
        },
        party: [
            { creatureId: 'embrill', level: 14, genetics: 3 },
            { creatureId: 'pyrothorn', level: 16, genetics: 3 },
            { creatureId: 'pyrothorn', level: 18, genetics: 4 }
        ],
        reward: 500,
        badge: 'fire_badge',
        defeated: false
    },
    leader_ice: {
        id: 'leader_ice',
        name: 'Líder Glacius',
        title: 'Mestre do Gelo',
        mapId: 'route3',
        x: 12,
        y: 20,
        color: 0x3498db,
        dialog: {
            before: [
                'Sou Glacius, senhor do inverno eterno.',
                'Prepare-se para congelar!'
            ],
            after: [
                'Você... derreteu minha frieza.',
                'O Badge de Gelo é seu. Use-o com sabedoria.'
            ]
        },
        party: [
            { creatureId: 'glacifawn', level: 18, genetics: 3 },
            { creatureId: 'frostclaw', level: 20, genetics: 3 },
            { creatureId: 'frostclaw', level: 22, genetics: 4 }
        ],
        reward: 800,
        badge: 'ice_badge',
        defeated: false
    }
};