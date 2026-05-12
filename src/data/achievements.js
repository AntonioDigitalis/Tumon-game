// ============================================
// ACHIEVEMENTS — Sistema de conquistas
// ============================================

const AchievementsDB = {
    first_capture: {
        id: 'first_capture',
        name: 'Primeiro Passo',
        description: 'Capture sua primeira criatura.',
        condition: { type: 'captures', count: 1 },
        bonus: { captureRate: 0.02 },
        unlocked: false
    },
    ten_captures: {
        id: 'ten_captures',
        name: 'Colecionador',
        description: 'Capture 10 criaturas.',
        condition: { type: 'captures', count: 10 },
        bonus: { captureRate: 0.05 },
        unlocked: false
    },
    first_evolution: {
        id: 'first_evolution',
        name: 'Transformação',
        description: 'Evolua uma criatura pela primeira vez.',
        condition: { type: 'evolutions', count: 1 },
        bonus: { critRate: 0.02 },
        unlocked: false
    },
    first_fusion: {
        id: 'first_fusion',
        name: 'Alquimista',
        description: 'Realize sua primeira fusão com sucesso.',
        condition: { type: 'fusions', count: 1 },
        bonus: { lootRate: 0.05 },
        unlocked: false
    },
    beat_leader_fire: {
        id: 'beat_leader_fire',
        name: 'Domador de Chamas',
        description: 'Derrote o Líder Ignis.',
        condition: { type: 'leader', leaderId: 'leader_fire' },
        bonus: { critRate: 0.03 },
        unlocked: false
    },
    beat_leader_ice: {
        id: 'beat_leader_ice',
        name: 'Quebra-Gelo',
        description: 'Derrote o Líder Glacius.',
        condition: { type: 'leader', leaderId: 'leader_ice' },
        bonus: { captureRate: 0.05 },
        unlocked: false
    },
    five_star_genetics: {
        id: 'five_star_genetics',
        name: 'Gênio Genético',
        description: 'Obtenha uma criatura 5 estrelas.',
        condition: { type: 'genetics', stars: 5 },
        bonus: { lootRate: 0.1 },
        unlocked: false
    },
    shiny_found: {
        id: 'shiny_found',
        name: 'Brilho Raro',
        description: 'Encontre uma criatura shiny.',
        condition: { type: 'shiny', count: 1 },
        bonus: { critRate: 0.05 },
        unlocked: false
    },
    fifty_battles: {
        id: 'fifty_battles',
        name: 'Veterano',
        description: 'Vença 50 batalhas.',
        condition: { type: 'battles_won', count: 50 },
        bonus: { critRate: 0.03, captureRate: 0.03 },
        unlocked: false
    }
};