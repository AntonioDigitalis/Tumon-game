// ============================================
// MAIN — Bootstrap do jogo
// ============================================

window.addEventListener('load', () => {
    console.log('🎮 Tumon — MVP v0.1');
    console.log('Iniciando jogo...');
    
    const game = new Phaser.Game(gameConfig);

    // Global reference (útil para debug)
    window.game = game;
    window.saveSystem = saveSystem;

    console.log('✅ Phaser inicializado.');
});