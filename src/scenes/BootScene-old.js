// ============================================
// BOOT SCENE — Preload de assets (geramos em runtime)
// ============================================

class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Mostra barra de loading
        const w = CONST.GAME_WIDTH;
        const h = CONST.GAME_HEIGHT;
        
        const loadingText = this.add.text(w / 2, h / 2 - 30, 'Carregando...', {
            fontFamily: 'Courier New',
            fontSize: '24px',
            color: '#f1c40f'
        }).setOrigin(0.5);

        const barBg = this.add.rectangle(w / 2, h / 2 + 10, 300, 20, 0x333333);
        const bar = this.add.rectangle(w / 2 - 150, h / 2 + 10, 0, 20, 0x3498db).setOrigin(0, 0.5);

        this.load.on('progress', (value) => {
            bar.width = 300 * value;
        });
    }

    create() {
        // Gera texturas procedurais
        this.generateTextures();
        
        // Vai para o menu
        this.scene.start('MenuScene');
    }

    generateTextures() {
        const ts = CONST.TILE_SIZE;

        // Grama normal
        this.createColorTexture('tile_grass', ts, ts, 0x4a8c3f);
        
        // Grama alta
        this.createGrassTexture('tile_tall_grass', ts, ts);

        // Parede/Árvore
        this.createColorTexture('tile_wall', ts, ts, 0x2d5a1e);

        // Água
        this.createWaterTexture('tile_water', ts, ts);

        // Caminho
        this.createColorTexture('tile_path', ts, ts, 0xc9a95e);

        // Porta/Transição
        this.createColorTexture('tile_door', ts, ts, 0x8b4513);

        // NPC marker
        this.createColorTexture('tile_npc', ts, ts, 0x4a8c3f);

        // Casa/Prédio
        this.createColorTexture('tile_building', ts, ts, 0x7f4a2b);

        // Areia (caverna)
        this.createColorTexture('tile_sand', ts, ts, 0x3d3124);

        // Pedra (caverna)
        this.createColorTexture('tile_rock', ts, ts, 0x2a2a2a);

        // Player
        this.createPlayerTexture('player', ts, ts * 1.2);
    }

    createColorTexture(key, w, h, color) {
        const canvas = this.textures.createCanvas(key, w, h);
        const ctx = canvas.getContext();
        
        ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
        ctx.fillRect(0, 0, w, h);

        // Adiciona leve variação
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        for (let i = 0; i < 3; i++) {
            const rx = Math.random() * w;
            const ry = Math.random() * h;
            ctx.fillRect(rx, ry, 4, 4);
        }

        canvas.refresh();
    }

    createGrassTexture(key, w, h) {
        const canvas = this.textures.createCanvas(key, w, h);
        const ctx = canvas.getContext();

        // Base
        ctx.fillStyle = '#3d7a33';
        ctx.fillRect(0, 0, w, h);

        // Grass blades
        ctx.strokeStyle = '#5cb849';
        ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
            const x = 4 + (i % 3) * 10;
            const y = h;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + (Math.random() * 6 - 3), y - 12 - Math.random() * 8);
            ctx.stroke();
        }

        canvas.refresh();
    }

    createWaterTexture(key, w, h) {
        const canvas = this.textures.createCanvas(key, w, h);
        const ctx = canvas.getContext();

        ctx.fillStyle = '#2574a9';
        ctx.fillRect(0, 0, w, h);

        // Waves
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        for (let y = 5; y < h; y += 8) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            for (let x = 0; x < w; x += 4) {
                ctx.lineTo(x, y + Math.sin(x * 0.5) * 2);
            }
            ctx.stroke();
        }

        canvas.refresh();
    }

    createPlayerTexture(key, w, h) {
        const canvas = this.textures.createCanvas(key, w, h);
        const ctx = canvas.getContext();
        
        const cw = w;
        const ch = h;

        // Body
        ctx.fillStyle = '#3498db';
        ctx.fillRect(cw * 0.2, ch * 0.35, cw * 0.6, ch * 0.5);

        // Head
        ctx.fillStyle = '#f5cba7';
        ctx.beginPath();
        ctx.arc(cw / 2, ch * 0.25, cw * 0.25, 0, Math.PI * 2);
        ctx.fill();

        // Hair
        ctx.fillStyle = '#5d4037';
        ctx.beginPath();
        ctx.arc(cw / 2, ch * 0.2, cw * 0.27, Math.PI, 0);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(cw * 0.35, ch * 0.22, 3, 3);
        ctx.fillRect(cw * 0.55, ch * 0.22, 3, 3);

        canvas.refresh();
    }
}