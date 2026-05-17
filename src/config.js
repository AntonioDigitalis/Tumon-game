// ============================================
// CONFIG — Configuração do Phaser
// ============================================

const gameConfig = {
    type: Phaser.AUTO,
    width: CONST.GAME_WIDTH,
    height: CONST.GAME_HEIGHT,
    parent: 'game-container',
    pixelArt: true,
    roundPixels: true,
    backgroundColor: '#0a0a1e',
    input: {
        windowEvents: false  // <-- adicionar isso
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [
        BootScene,
        MenuScene,
        StarterScene,
        WorldScene,
        BattleScene,
        InventoryScene,
        ShopScene,
        StorageScene,
        FusionScene,
        BreedingScene,
        DialogScene
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        autoRound: true 
    }
};