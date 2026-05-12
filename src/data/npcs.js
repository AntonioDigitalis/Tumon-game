// ============================================
// NPCs — Dados dos personagens não-jogáveis
// ============================================

const NPCsDB = {
    mom_npc: {
        id: 'mom_npc',
        name: 'Mãe',
        mapId: 'town',
        x: 5,
        y: 12,
        color: 0xff69b4,
        dialog: [
            'Olá querido! Que bom te ver.',
            'Quer que eu guarde seu dinheiro?',
            'Lembre-se: o mundo é perigoso, mas emocionante!'
        ],
        type: 'bank',
        direction: 'down'
    },
    healer_npc: {
        id: 'healer_npc',
        name: 'Curandeira Aria',
        mapId: 'town',
        x: 20,
        y: 11,
        color: 0xff6b9d,
        dialog: [
            'Bem-vindo ao Centro de Recuperação!',
            'Vou curar todas as suas criaturas.',
            'Pronto! Suas criaturas estão saudáveis!'
        ],
        type: 'healer',
        direction: 'down'
    },
    shop_npc: {
        id: 'shop_npc',
        name: 'Mercador Rion',
        mapId: 'town',
        x: 16,
        y: 13,
        color: 0x2ecc71,
        dialog: [
            'Bem-vindo à minha loja!',
            'Temos esferas, poções e mais!',
            'Volte sempre!'
        ],
        type: 'shop',
        direction: 'left'
    },
    guide_npc: {
        id: 'guide_npc',
        name: 'Velho Sábio Elm',
        mapId: 'town',
        x: 12,
        y: 9,
        color: 0x95a5a6,
        dialog: [
            'Então você quer ser um Domador?',
            'Explore as rotas, capture criaturas e fique forte!',
            'Na Rota 3 estão os Líderes Elementais.',
            'Derrote-os para provar seu valor!',
            'Cuidado com a Caverna das Sombras...',
            'Lá habitam criaturas perigosas, mas raras!'
        ],
        type: 'info',
        direction: 'down'
    },
    trainer_npc_1: {
        id: 'trainer_npc_1',
        name: 'Domador Kai',
        mapId: 'route1',
        x: 12,
        y: 9,
        color: 0xe74c3c,
        dialog: [
            'Ei! Você parece forte!',
            'Vamos batalhar!'
        ],
        type: 'trainer',
        party: [
            { creatureId: 'embrill', level: 5, genetics: 1 },
            { creatureId: 'normousse', level: 4, genetics: 1 }
        ],
        reward: 150,
        defeated: false,
        direction: 'down'
    },
    trainer_npc_2: {
        id: 'trainer_npc_2',
        name: 'Domadora Luna',
        mapId: 'route2',
        x: 12,
        y: 12,
        color: 0x9b59b6,
        dialog: [
            'A Costa Azul é meu território!',
            'Prove que merece passar!'
        ],
        type: 'trainer',
        party: [
            { creatureId: 'aquafen', level: 8, genetics: 2 },
            { creatureId: 'glacifawn', level: 7, genetics: 1 },
            { creatureId: 'zapplet', level: 9, genetics: 1 }
        ],
        reward: 300,
        defeated: false,
        direction: 'down'
    }
};