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

        ctx.imageSmoothingEnabled = false;

        const p = (x, y, pw, ph, color) => {
            ctx.fillStyle = color;
            ctx.fillRect(Math.round(x), Math.round(y), pw, ph);
        };

        // -- Sombra no chão --
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath();
        ctx.ellipse(w / 2, h - 3, w * 0.28, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // -- Pernas / calça (azul escuro) --
        p(w*0.30, h*0.72, w*0.16, h*0.16, '#2c3e6b');
        p(w*0.54, h*0.72, w*0.16, h*0.16, '#2c3e6b');
        // highlight perna
        p(w*0.30, h*0.72, w*0.06, h*0.05, '#3d52a0');
        p(w*0.54, h*0.72, w*0.06, h*0.05, '#3d52a0');
        // pé/sapato
        p(w*0.28, h*0.86, w*0.20, h*0.06, '#3d2b1f');
        p(w*0.52, h*0.86, w*0.20, h*0.06, '#3d2b1f');

        // -- Corpo / camiseta (verde) --
        p(w*0.22, h*0.42, w*0.56, h*0.32, '#27ae60');
        // dobra/sombra lateral
        p(w*0.22, h*0.42, w*0.05, h*0.32, '#1e8449');
        p(w*0.73, h*0.42, w*0.05, h*0.32, '#1e8449');
        // highlight superior
        p(w*0.27, h*0.42, w*0.46, h*0.05, '#2ecc71');
        // coleira
        p(w*0.38, h*0.42, w*0.24, h*0.04, '#1a7a40');

        // -- Braço esquerdo (pele) --
        p(w*0.08, h*0.44, w*0.14, h*0.24, '#e8b89a');
        p(w*0.08, h*0.44, w*0.14, h*0.06, '#27ae60'); // manga
        // sombra braço
        p(w*0.08, h*0.44, w*0.04, h*0.24, '#d4a082');
        // mão esq
        p(w*0.07, h*0.66, w*0.16, h*0.10, '#e8b89a');
        p(w*0.07, h*0.66, w*0.04, h*0.10, '#d4a082');

        // -- Braço direito (pele) --
        p(w*0.78, h*0.44, w*0.14, h*0.24, '#e8b89a');
        p(w*0.78, h*0.44, w*0.14, h*0.06, '#27ae60'); // manga
        // sombra braço
        p(w*0.88, h*0.44, w*0.04, h*0.24, '#d4a082');
        // mão dir
        p(w*0.77, h*0.66, w*0.16, h*0.10, '#e8b89a');
        p(w*0.89, h*0.66, w*0.04, h*0.10, '#d4a082');

        // -- Pescoço --
        p(w*0.40, h*0.36, w*0.20, h*0.08, '#e8b89a');
        p(w*0.40, h*0.36, w*0.04, h*0.08, '#d4a082');

        // -- Cabeça (rosto) --
        p(w*0.26, h*0.14, w*0.48, h*0.24, '#e8b89a');
        // sombra lateral rosto
        p(w*0.26, h*0.14, w*0.05, h*0.24, '#d4a082');
        p(w*0.69, h*0.14, w*0.05, h*0.24, '#d4a082');
        // queixo/bochecha
        p(w*0.28, h*0.32, w*0.44, h*0.06, '#e0a882');

        // -- Olhos --
        p(w*0.34, h*0.20, w*0.10, h*0.07, '#1a1a2e');
        p(w*0.56, h*0.20, w*0.10, h*0.07, '#1a1a2e');
        // íris castanha
        p(w*0.35, h*0.21, w*0.07, h*0.05, '#6b3a2a');
        p(w*0.57, h*0.21, w*0.07, h*0.05, '#6b3a2a');
        // brilho olho
        p(w*0.35, h*0.21, w*0.03, h*0.02, '#ffffff');
        p(w*0.57, h*0.21, w*0.03, h*0.02, '#ffffff');

        // -- Sobrancelhas --
        p(w*0.33, h*0.17, w*0.12, h*0.03, '#5d3a1a');
        p(w*0.55, h*0.17, w*0.12, h*0.03, '#5d3a1a');

        // -- Boca --
        p(w*0.42, h*0.30, w*0.16, h*0.03, '#c07850');

        // -- Cabelo castanho (topo e laterais) --
        // topo
        p(w*0.24, h*0.02, w*0.52, h*0.14, '#6b3a1f');
        // volume topo
        p(w*0.28, h*0.00, w*0.44, h*0.08, '#7d4520');
        // highlight cabelo
        p(w*0.34, h*0.01, w*0.20, h*0.04, '#9b5a2a');
        // lateral esquerda
        p(w*0.20, h*0.08, w*0.08, h*0.18, '#6b3a1f');
        // lateral direita
        p(w*0.72, h*0.08, w*0.08, h*0.18, '#6b3a1f');
        // franja (alguns fios na testa)
        p(w*0.30, h*0.13, w*0.08, h*0.05, '#7d4520');
        p(w*0.44, h*0.12, w*0.06, h*0.04, '#7d4520');
        p(w*0.60, h*0.13, w*0.08, h*0.05, '#7d4520');

        // -- Contorno pixel art --
        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth = 1;
        ctx.strokeRect(Math.round(w*0.26), Math.round(h*0.14), Math.round(w*0.48), Math.round(h*0.24));
        ctx.strokeRect(Math.round(w*0.22), Math.round(h*0.42), Math.round(w*0.56), Math.round(h*0.32));

        canvas.refresh();
    }
}   