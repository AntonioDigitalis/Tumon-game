// ============================================
// NPCs — Dados dos personagens não-jogáveis
// ============================================

const NPCsDB = {
    mom_npc: {
        id: 'mom_npc',
        name: 'Mãe',
        mapId: 'player_house',
        x: 7,
        y: 5,
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
        mapId: 'heal_center',
        x: 7,
        y: 3,
        color: 0xff6b9d,
        dialog: [
            'Bem-vindo ao Centro de Cura!',
            'Vou cuidar das suas criaturas.',
            'Pronto! Suas criaturas estão saudáveis!'
        ],
        type: 'healer',
        direction: 'down'
    },
    shop_npc: {
        id: 'shop_npc',
        name: 'Mercador Rion',
        mapId: 'shop',
        x: 7,
        y: 3,
        color: 0x2ecc71,
        dialog: [
            'Bem-vindo ao meu mercado!',
            'Temos runas, poções e mais!',
            'Volte sempre!'
        ],
        type: 'shop',
        direction: 'down'
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
    },
    leader_fire_npc: {
        id: 'leader_fire_npc',
        name: 'Ignis',
        mapId: 'route3',
        x: 11,
        y: 20,
        color: 0xe74c3c,
        dialog: [
            'Aqui fica o Templo do Fogo.',
            'Somente os mais fortes entram.',
            'Entre pela porta se tiver coragem!'
        ],
        type: 'info',
        direction: 'down'
    },
    leader_ice_npc: {
        id: 'leader_ice_npc',
        name: 'Glacius',
        mapId: 'route3',
        x: 13,
        y: 20,
        color: 0x3498db,
        dialog: [
            'Aqui fica o Templo do Gelo.',
            'O frio aqui congela a alma.',
            'Entre pela porta... se sobreviver.'
        ],
        type: 'info',
        direction: 'down'
    },
    barqueiro_npc: {
        id: 'barqueiro_npc',
        name: 'Barqueiro Tomas',
        mapId: 'porto_costa',
        x: 10,
        y: 2,
        color: 0x8b4513,
        dialog: [
            'Olá, viajante!',
            'Este barco vai à Ilha Misteriosa.',
            'Mas só levo quem possui a Insígnia de Gelo.',
            'Derrote o Líder Glacius primeiro!'
        ],
        type: 'info',
        direction: 'down'
    },
    trainer_ilha: {
        id: 'trainer_ilha',
        name: 'Domador Maris',
        mapId: 'ilha_misteriosa',
        x: 11,
        y: 11,
        color: 0x1abc9c,
        dialog: [
            'Esta ilha é meu domínio!',
            'Nenhum intruso passa por aqui!'
        ],
        type: 'trainer',
        party: [
            { creatureId: 'frostclaw', level: 28, genetics: 3 },
            { creatureId: 'umbravox',  level: 30, genetics: 3 },
            { creatureId: 'voltarex',  level: 28, genetics: 2 }
        ],
        reward: 900,
        defeated: false,
        direction: 'down'
    },
    trainer_floresta: {
        id: 'trainer_floresta',
        name: 'Domadora Ivy',
        mapId: 'floresta_sombria',
        x: 12,
        y: 9,
        color: 0x27ae60,
        dialog: [
            'Esta floresta guarda segredos antigos.',
            'Mostre que é digno de avançar!'
        ],
        type: 'trainer',
        party: [
            { creatureId: 'thornvine', level: 14, genetics: 2 },
            { creatureId: 'shadewisp', level: 16, genetics: 2 }
        ],
        reward: 500,
        defeated: false,
        direction: 'down'
    },
    boss_templo: {
        id: 'boss_templo',
        name: 'Guardião Nox',
        mapId: 'templo_antigo',
        x: 10,
        y: 12,
        color: 0x6c3483,
        dialog: [
            'Você ousa profanar o Templo Antigo?',
            'Os espíritos das trevas julgarão sua força!'
        ],
        type: 'trainer',
        party: [
            { creatureId: 'psychowl', level: 30, genetics: 3 },
            { creatureId: 'umbravox', level: 32, genetics: 3 },
            { creatureId: 'umbravox', level: 28, genetics: 2 }
        ],
        reward: 1200,
        defeated: false,
        direction: 'down'
    }
};