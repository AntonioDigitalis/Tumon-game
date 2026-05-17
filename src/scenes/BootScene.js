// ============================================
// BOOT SCENE — Preload de assets (geramos em runtime)
// ============================================

class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        Log.info("Iniciando preload...");
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

        // Sprites das criaturas
        SpriteAssetLoader.loadAll(this);

        // Imagem dos itens
        ItemAssetLoader.loadAll(this);

        this.load.on('complete', () => {
            Log.ok("Preload concluído com sucesso!");
        });

        this.load.on('loaderror', (file) => {
            Log.error('Erro ao carregar asset: ${file.key}');
        });

        this.load.image('title_bg', 'assets/title_bg.png');

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
        // 1. gerar sprites procedurais
        CreatureSprites.generateAll(this);

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

        // Casa/Prédio genérico
        this.createColorTexture('tile_building', ts, ts, 0x7f4a2b);

        // Fachadas específicas da Vila Aurora
        this.createHouseFacade('tile_house', ts, ts);
        this.createHealFacade('tile_heal', ts, ts);
        this.createShopFacade('tile_shop', ts, ts);

        // Areia (caverna)
        this.createColorTexture('tile_sand', ts, ts, 0x3d3124);

        // Pedra (caverna)
        this.createColorTexture('tile_rock', ts, ts, 0x2a2a2a);

        // Player (sprite sheet: 9 frames — 3 dirs × 3 walk states)
        this.createPlayerSpriteSheet('playerSheet', ts, Math.round(ts * 1.2));

        // NPCs
        this.createMomTexture('npc_mom', ts, Math.round(ts * 1.2));
        this.createNPCTexture('npc_healer',   ts, ts * 1.2, 0xff6b9d);
        this.createNPCTexture('npc_merchant', ts, ts * 1.2, 0x2ecc71);
        this.createNPCTexture('npc_trainer',  ts, ts * 1.2, 0xe74c3c);
        this.createNPCTexture('npc_guide',    ts, ts * 1.2, 0x95a5a6);

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

    createPlayerSpriteSheet(key, w, h) {
        // 9 frames: frente (0,1,2) | costas (3,4,5) | lateral-esq (6,7,8)
        // Lateral direita = lateral esq com flipX=true
        const cols = 9;
        const canvas = this.textures.createCanvas(key, w * cols, h);
        const ctx = canvas.getContext();
        ctx.imageSmoothingEnabled = false;

        const p = (ox, x, y, pw, ph, color) => {
            const rw = Math.max(1, Math.round(pw));
            const rh = Math.max(1, Math.round(ph));
            ctx.fillStyle = color;
            ctx.fillRect(Math.round(ox + x), Math.round(y), rw, rh);
        };

        // ---- FRENTE (frames 0, 1, 2) ----
        const drawDown = (ox, walkFrame) => {
            const bob = walkFrame > 0 ? -1 : 0;
            // walk1: perna esq avança, braço dir avança (oposto)
            let llX=0,llY=0, rlX=0,rlY=0, laY=0, raY=0;
            if (walkFrame === 1) { llX=-1;llY=3;  rlX=1; rlY=-2; laY=-3; raY=3;  }
            if (walkFrame === 2) { llX=1; llY=-2; rlX=-1;rlY=3;  laY=3;  raY=-3; }

            ctx.fillStyle='rgba(0,0,0,0.18)';ctx.beginPath();
            ctx.ellipse(ox+w/2,h-3,w*0.28,3,0,0,Math.PI*2);ctx.fill();

            p(ox,w*0.30+llX,h*0.72+bob+llY,w*0.16,h*0.16,'#2c3e6b');
            p(ox,w*0.30+llX,h*0.72+bob+llY,w*0.06,h*0.05,'#3d52a0');
            p(ox,w*0.28+llX,h*0.86+bob+llY,w*0.20,h*0.06,'#3d2b1f');
            p(ox,w*0.54+rlX,h*0.72+bob+rlY,w*0.16,h*0.16,'#2c3e6b');
            p(ox,w*0.54+rlX,h*0.72+bob+rlY,w*0.06,h*0.05,'#3d52a0');
            p(ox,w*0.52+rlX,h*0.86+bob+rlY,w*0.20,h*0.06,'#3d2b1f');

            p(ox,w*0.22,h*0.42+bob,w*0.56,h*0.32,'#27ae60');
            p(ox,w*0.22,h*0.42+bob,w*0.05,h*0.32,'#1e8449');
            p(ox,w*0.73,h*0.42+bob,w*0.05,h*0.32,'#1e8449');
            p(ox,w*0.27,h*0.42+bob,w*0.46,h*0.05,'#2ecc71');
            p(ox,w*0.38,h*0.42+bob,w*0.24,h*0.04,'#1a7a40');

            p(ox,w*0.08,h*0.44+bob+laY,w*0.14,h*0.24,'#e8b89a');
            p(ox,w*0.08,h*0.44+bob+laY,w*0.14,h*0.06,'#27ae60');
            p(ox,w*0.08,h*0.44+bob+laY,w*0.04,h*0.24,'#d4a082');
            p(ox,w*0.07,h*0.66+bob+laY,w*0.16,h*0.10,'#e8b89a');
            p(ox,w*0.07,h*0.66+bob+laY,w*0.04,h*0.10,'#d4a082');
            p(ox,w*0.78,h*0.44+bob+raY,w*0.14,h*0.24,'#e8b89a');
            p(ox,w*0.78,h*0.44+bob+raY,w*0.14,h*0.06,'#27ae60');
            p(ox,w*0.88,h*0.44+bob+raY,w*0.04,h*0.24,'#d4a082');
            p(ox,w*0.77,h*0.66+bob+raY,w*0.16,h*0.10,'#e8b89a');
            p(ox,w*0.89,h*0.66+bob+raY,w*0.04,h*0.10,'#d4a082');

            p(ox,w*0.40,h*0.36+bob,w*0.20,h*0.08,'#e8b89a');
            p(ox,w*0.40,h*0.36+bob,w*0.04,h*0.08,'#d4a082');

            p(ox,w*0.26,h*0.14+bob,w*0.48,h*0.24,'#e8b89a');
            p(ox,w*0.26,h*0.14+bob,w*0.05,h*0.24,'#d4a082');
            p(ox,w*0.69,h*0.14+bob,w*0.05,h*0.24,'#d4a082');
            p(ox,w*0.28,h*0.32+bob,w*0.44,h*0.06,'#e0a882');
            p(ox,w*0.34,h*0.20+bob,w*0.10,h*0.07,'#1a1a2e');
            p(ox,w*0.56,h*0.20+bob,w*0.10,h*0.07,'#1a1a2e');
            p(ox,w*0.35,h*0.21+bob,w*0.07,h*0.05,'#6b3a2a');
            p(ox,w*0.57,h*0.21+bob,w*0.07,h*0.05,'#6b3a2a');
            p(ox,w*0.35,h*0.21+bob,w*0.03,h*0.02,'#ffffff');
            p(ox,w*0.57,h*0.21+bob,w*0.03,h*0.02,'#ffffff');
            p(ox,w*0.33,h*0.17+bob,w*0.12,h*0.03,'#5d3a1a');
            p(ox,w*0.55,h*0.17+bob,w*0.12,h*0.03,'#5d3a1a');
            p(ox,w*0.42,h*0.30+bob,w*0.16,h*0.03,'#c07850');
            p(ox,w*0.24,h*0.02+bob,w*0.52,h*0.14,'#6b3a1f');
            p(ox,w*0.28,h*0.00+bob,w*0.44,h*0.08,'#7d4520');
            p(ox,w*0.34,h*0.01+bob,w*0.20,h*0.04,'#9b5a2a');
            p(ox,w*0.20,h*0.08+bob,w*0.08,h*0.18,'#6b3a1f');
            p(ox,w*0.72,h*0.08+bob,w*0.08,h*0.18,'#6b3a1f');
            p(ox,w*0.30,h*0.13+bob,w*0.08,h*0.05,'#7d4520');
            p(ox,w*0.44,h*0.12+bob,w*0.06,h*0.04,'#7d4520');
            p(ox,w*0.60,h*0.13+bob,w*0.08,h*0.05,'#7d4520');
            ctx.strokeStyle='#1a1a2e';ctx.lineWidth=1;
            ctx.strokeRect(Math.round(ox+w*0.26),Math.round(h*0.14+bob),Math.round(w*0.48),Math.round(h*0.24));
            ctx.strokeRect(Math.round(ox+w*0.22),Math.round(h*0.42+bob),Math.round(w*0.56),Math.round(h*0.32));
        };

        // ---- COSTAS (frames 3, 4, 5) ----
        const drawUp = (ox, walkFrame) => {
            const bob = walkFrame > 0 ? -1 : 0;
            let llY=0,rlY=0,laY=0,raY=0;
            if (walkFrame === 1) { llY=3;  rlY=-2; laY=-3; raY=3;  }
            if (walkFrame === 2) { llY=-2; rlY=3;  laY=3;  raY=-3; }

            ctx.fillStyle='rgba(0,0,0,0.18)';ctx.beginPath();
            ctx.ellipse(ox+w/2,h-3,w*0.28,3,0,0,Math.PI*2);ctx.fill();

            p(ox,w*0.30,h*0.72+bob+llY,w*0.16,h*0.16,'#2c3e6b');
            p(ox,w*0.30,h*0.72+bob+llY,w*0.06,h*0.05,'#3d52a0');
            p(ox,w*0.28,h*0.86+bob+llY,w*0.20,h*0.06,'#3d2b1f');
            p(ox,w*0.54,h*0.72+bob+rlY,w*0.16,h*0.16,'#2c3e6b');
            p(ox,w*0.54,h*0.72+bob+rlY,w*0.06,h*0.05,'#3d52a0');
            p(ox,w*0.52,h*0.86+bob+rlY,w*0.20,h*0.06,'#3d2b1f');

            // Costas da camisa (sem gola, com costura central)
            p(ox,w*0.22,h*0.42+bob,w*0.56,h*0.32,'#27ae60');
            p(ox,w*0.22,h*0.42+bob,w*0.08,h*0.32,'#1e8449');
            p(ox,w*0.70,h*0.42+bob,w*0.08,h*0.32,'#1e8449');
            p(ox,w*0.47,h*0.44+bob,w*0.06,h*0.28,'#24a055');

            p(ox,w*0.08,h*0.44+bob+laY,w*0.14,h*0.24,'#e8b89a');
            p(ox,w*0.08,h*0.44+bob+laY,w*0.14,h*0.06,'#27ae60');
            p(ox,w*0.12,h*0.44+bob+laY,w*0.04,h*0.24,'#d4a082');
            p(ox,w*0.07,h*0.66+bob+laY,w*0.16,h*0.10,'#e8b89a');
            p(ox,w*0.12,h*0.66+bob+laY,w*0.04,h*0.10,'#d4a082');
            p(ox,w*0.78,h*0.44+bob+raY,w*0.14,h*0.24,'#e8b89a');
            p(ox,w*0.78,h*0.44+bob+raY,w*0.14,h*0.06,'#27ae60');
            p(ox,w*0.82,h*0.44+bob+raY,w*0.04,h*0.24,'#d4a082');
            p(ox,w*0.77,h*0.66+bob+raY,w*0.16,h*0.10,'#e8b89a');
            p(ox,w*0.82,h*0.66+bob+raY,w*0.04,h*0.10,'#d4a082');

            p(ox,w*0.40,h*0.36+bob,w*0.20,h*0.08,'#e8b89a');
            p(ox,w*0.44,h*0.36+bob,w*0.04,h*0.08,'#d4a082');

            // Cabeça de costas: cabelo cobre quase tudo
            p(ox,w*0.28,h*0.30+bob,w*0.44,h*0.06,'#e8b89a');
            p(ox,w*0.24,h*0.02+bob,w*0.52,h*0.34,'#6b3a1f');
            p(ox,w*0.28,h*0.00+bob,w*0.44,h*0.10,'#7d4520');
            p(ox,w*0.34,h*0.01+bob,w*0.20,h*0.04,'#9b5a2a');
            p(ox,w*0.20,h*0.08+bob,w*0.08,h*0.28,'#6b3a1f');
            p(ox,w*0.72,h*0.08+bob,w*0.08,h*0.28,'#6b3a1f');
            p(ox,w*0.26,h*0.30+bob,w*0.48,h*0.06,'#6b3a1f');
            ctx.strokeStyle='#1a1a2e';ctx.lineWidth=1;
            ctx.strokeRect(Math.round(ox+w*0.26),Math.round(h*0.02+bob),Math.round(w*0.48),Math.round(h*0.36));
            ctx.strokeRect(Math.round(ox+w*0.22),Math.round(h*0.42+bob),Math.round(w*0.56),Math.round(h*0.32));
        };

        // ---- LATERAL ESQUERDA (frames 6, 7, 8) ----
        const drawSide = (ox, walkFrame) => {
            const bob = walkFrame > 0 ? -1 : 0;
            let fLY=0,bLY=0,fAY=0,bAY=0;
            if (walkFrame === 1) { fLY=3;  bLY=-2; fAY=-3; bAY=3;  }
            if (walkFrame === 2) { fLY=-2; bLY=3;  fAY=3;  bAY=-3; }

            ctx.fillStyle='rgba(0,0,0,0.18)';ctx.beginPath();
            ctx.ellipse(ox+w/2,h-3,w*0.28,3,0,0,Math.PI*2);ctx.fill();

            // Perna de trás (mais escura, desenhada primeiro)
            p(ox,w*0.44,h*0.72+bob+bLY,w*0.16,h*0.16,'#253260');
            p(ox,w*0.42,h*0.86+bob+bLY,w*0.20,h*0.06,'#2d2015');

            // Corpo
            p(ox,w*0.26,h*0.42+bob,w*0.48,h*0.32,'#27ae60');
            p(ox,w*0.26,h*0.42+bob,w*0.06,h*0.32,'#1e8449');
            p(ox,w*0.68,h*0.42+bob,w*0.06,h*0.32,'#1e8449');
            p(ox,w*0.31,h*0.42+bob,w*0.38,h*0.05,'#2ecc71');

            // Braço de trás (lado direito, mais escuro)
            p(ox,w*0.66,h*0.46+bob+bAY,w*0.12,h*0.22,'#c89a7a');
            p(ox,w*0.66,h*0.46+bob+bAY,w*0.12,h*0.05,'#1e8449');
            p(ox,w*0.65,h*0.66+bob+bAY,w*0.14,h*0.09,'#c89a7a');

            // Perna da frente (sobre o corpo)
            p(ox,w*0.40,h*0.72+bob+fLY,w*0.16,h*0.16,'#2c3e6b');
            p(ox,w*0.40,h*0.72+bob+fLY,w*0.06,h*0.05,'#3d52a0');
            p(ox,w*0.38,h*0.86+bob+fLY,w*0.20,h*0.06,'#3d2b1f');

            // Braço da frente (lado esquerdo, proeminente)
            p(ox,w*0.18,h*0.46+bob+fAY,w*0.12,h*0.22,'#e8b89a');
            p(ox,w*0.18,h*0.46+bob+fAY,w*0.12,h*0.05,'#27ae60');
            p(ox,w*0.14,h*0.46+bob+fAY,w*0.05,h*0.22,'#d4a082');
            p(ox,w*0.16,h*0.66+bob+fAY,w*0.16,h*0.09,'#e8b89a');
            p(ox,w*0.12,h*0.66+bob+fAY,w*0.05,h*0.09,'#d4a082');

            p(ox,w*0.42,h*0.36+bob,w*0.16,h*0.08,'#e8b89a');

            // Cabeça em perfil (olhando para a esquerda)
            p(ox,w*0.28,h*0.13+bob,w*0.44,h*0.24,'#e8b89a');
            p(ox,w*0.58,h*0.13+bob,w*0.14,h*0.24,'#d4a082'); // lado distante
            p(ox,w*0.30,h*0.30+bob,w*0.38,h*0.06,'#e0a882');
            // Um olho (lado visível)
            p(ox,w*0.32,h*0.19+bob,w*0.10,h*0.07,'#1a1a2e');
            p(ox,w*0.33,h*0.20+bob,w*0.07,h*0.05,'#6b3a2a');
            p(ox,w*0.33,h*0.20+bob,w*0.03,h*0.02,'#ffffff');
            p(ox,w*0.31,h*0.16+bob,w*0.12,h*0.03,'#5d3a1a');
            // Nariz (perfil)
            p(ox,w*0.54,h*0.26+bob,w*0.06,h*0.03,'#d4a082');
            // Orelha
            p(ox,w*0.64,h*0.19+bob,w*0.06,h*0.10,'#e8b89a');
            p(ox,w*0.66,h*0.21+bob,w*0.03,h*0.06,'#d4a082');
            // Boca
            p(ox,w*0.38,h*0.29+bob,w*0.12,h*0.03,'#c07850');
            // Cabelo
            p(ox,w*0.26,h*0.02+bob,w*0.48,h*0.14,'#6b3a1f');
            p(ox,w*0.30,h*0.00+bob,w*0.42,h*0.08,'#7d4520');
            p(ox,w*0.36,h*0.01+bob,w*0.18,h*0.04,'#9b5a2a');
            p(ox,w*0.22,h*0.08+bob,w*0.08,h*0.22,'#6b3a1f');
            p(ox,w*0.70,h*0.08+bob,w*0.08,h*0.20,'#6b3a1f');
            p(ox,w*0.24,h*0.12+bob,w*0.08,h*0.08,'#6b3a1f'); // franja frontal
            ctx.strokeStyle='#1a1a2e';ctx.lineWidth=1;
            ctx.strokeRect(Math.round(ox+w*0.28),Math.round(h*0.13+bob),Math.round(w*0.44),Math.round(h*0.24));
            ctx.strokeRect(Math.round(ox+w*0.26),Math.round(h*0.42+bob),Math.round(w*0.48),Math.round(h*0.32));
        };

        drawDown(w*0, 0); drawDown(w*1, 1); drawDown(w*2, 2);
        drawUp  (w*3, 0); drawUp  (w*4, 1); drawUp  (w*5, 2);
        drawSide(w*6, 0); drawSide(w*7, 1); drawSide(w*8, 2);

        // Registra os 9 frames no objeto texture
        for (let i = 0; i < cols; i++) {
            canvas.add(i, 0, i * w, 0, w, h);
        }

        canvas.refresh();
    }

    createMomTexture(key, w, h) {
        const canvas = this.textures.createCanvas(key, w, h);
        const ctx = canvas.getContext();
        ctx.imageSmoothingEnabled = false;

        const p = (x, y, pw, ph, c) => {
            ctx.fillStyle = c;
            ctx.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(pw)), Math.max(1, Math.round(ph)));
        };

        // Sombra elíptica (levemente maior pelo vestido)
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath();
        ctx.ellipse(w/2, h - 3, w * 0.36, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // ---- Sapatos (aparecem abaixo da saia) ----
        p(w*0.30, h*0.88, w*0.14, h*0.06, '#7a4a30');
        p(w*0.56, h*0.88, w*0.14, h*0.06, '#7a4a30');

        // ---- Saia (trapézio — mais larga embaixo) ----
        p(w*0.18, h*0.66, w*0.64, h*0.24, '#ff69b4');
        p(w*0.18, h*0.66, w*0.07, h*0.24, '#e0508a'); // sombra esquerda
        p(w*0.75, h*0.66, w*0.07, h*0.24, '#e0508a'); // sombra direita
        p(w*0.22, h*0.83, w*0.56, h*0.07, '#e0508a'); // barra inferior da saia
        p(w*0.27, h*0.83, w*0.46, h*0.03, '#ff8dc4'); // fio decorativo da barra

        // ---- Corpo / blusa ----
        p(w*0.22, h*0.42, w*0.56, h*0.26, '#ff69b4');
        p(w*0.22, h*0.42, w*0.06, h*0.26, '#e0508a'); // sombra lateral
        p(w*0.72, h*0.42, w*0.06, h*0.26, '#e0508a');
        p(w*0.27, h*0.42, w*0.46, h*0.05, '#ff8dc4'); // highlight superior

        // Avental branco
        p(w*0.32, h*0.46, w*0.36, h*0.18, '#f5f0e8');
        p(w*0.32, h*0.46, w*0.04, h*0.18, '#ddd8cc');
        p(w*0.64, h*0.46, w*0.04, h*0.18, '#ddd8cc');
        p(w*0.36, h*0.42, w*0.28, h*0.05, '#f5f0e8'); // alça do avental

        // ---- Braços ----
        p(w*0.08, h*0.44, w*0.14, h*0.22, '#e8b89a');
        p(w*0.08, h*0.44, w*0.04, h*0.22, '#d4a082');
        p(w*0.78, h*0.44, w*0.14, h*0.22, '#e8b89a');
        p(w*0.88, h*0.44, w*0.04, h*0.22, '#d4a082');
        // Mangas
        p(w*0.08, h*0.44, w*0.14, h*0.06, '#ff69b4');
        p(w*0.78, h*0.44, w*0.14, h*0.06, '#ff69b4');
        // Mãos
        p(w*0.09, h*0.64, w*0.12, h*0.07, '#e8b89a');
        p(w*0.79, h*0.64, w*0.12, h*0.07, '#e8b89a');

        // ---- Pescoço ----
        p(w*0.40, h*0.36, w*0.20, h*0.08, '#e8b89a');

        // ---- Cabelo longo (castanho, cai pelos lados do corpo) ----
        // Mechas laterais longas — desenhadas ANTES da cabeça para ficar atrás
        p(w*0.16, h*0.08, w*0.10, h*0.54, '#5c2e0a'); // mecha esquerda
        p(w*0.16, h*0.08, w*0.04, h*0.54, '#7a4018'); // highlight esq
        p(w*0.74, h*0.08, w*0.10, h*0.54, '#5c2e0a'); // mecha direita
        p(w*0.80, h*0.08, w*0.04, h*0.54, '#7a4018'); // highlight dir

        // ---- Cabeça ----
        p(w*0.26, h*0.14, w*0.48, h*0.24, '#f5c0a0');
        p(w*0.26, h*0.14, w*0.05, h*0.24, '#d4a082');
        p(w*0.69, h*0.14, w*0.05, h*0.24, '#d4a082');
        p(w*0.28, h*0.32, w*0.44, h*0.06, '#e8a882'); // queixo/bochecha

        // Bochechas rosadas
        p(w*0.27, h*0.27, w*0.09, h*0.05, '#ffb0b8');
        p(w*0.64, h*0.27, w*0.09, h*0.05, '#ffb0b8');

        // Olhos femininos — maiores, com cílio
        p(w*0.33, h*0.19, w*0.12, h*0.08, '#1a1a2e'); // olho esq
        p(w*0.55, h*0.19, w*0.12, h*0.08, '#1a1a2e'); // olho dir
        // Íris (roxo violeta)
        p(w*0.34, h*0.20, w*0.09, h*0.06, '#6a3580');
        p(w*0.56, h*0.20, w*0.09, h*0.06, '#6a3580');
        // Brilho
        p(w*0.34, h*0.20, w*0.03, h*0.02, '#ffffff');
        p(w*0.56, h*0.20, w*0.03, h*0.02, '#ffffff');
        // Cílios (linha fina acima do olho)
        p(w*0.32, h*0.18, w*0.14, h*0.02, '#1a1a2e');
        p(w*0.54, h*0.18, w*0.14, h*0.02, '#1a1a2e');

        // Sobrancelhas finas e arqueadas
        p(w*0.34, h*0.16, w*0.10, h*0.02, '#5d3a1a');
        p(w*0.56, h*0.16, w*0.10, h*0.02, '#5d3a1a');

        // Boca (levemente sorridente)
        p(w*0.39, h*0.29, w*0.22, h*0.03, '#c05060');
        p(w*0.41, h*0.30, w*0.18, h*0.02, '#e88898'); // lábio inferior

        // ---- Topo do cabelo ----
        p(w*0.24, h*0.02, w*0.52, h*0.16, '#5c2e0a');
        p(w*0.28, h*0.00, w*0.44, h*0.09, '#7a4018');
        p(w*0.34, h*0.01, w*0.22, h*0.04, '#9b5a2a'); // highlight
        // Franja
        p(w*0.28, h*0.13, w*0.44, h*0.05, '#5c2e0a');

        // Laço rosa no cabelo (lado direito)
        p(w*0.66, h*0.04, w*0.08, h*0.07, '#ff69b4');
        p(w*0.70, h*0.04, w*0.04, h*0.04, '#e0508a');
        p(w*0.74, h*0.04, w*0.08, h*0.07, '#ff69b4');
        p(w*0.70, h*0.06, w*0.04, h*0.03, '#ff8dc4'); // nó central

        // Contorno
        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth = 1;
        ctx.strokeRect(Math.round(w*0.26), Math.round(h*0.14), Math.round(w*0.48), Math.round(h*0.24));
        ctx.strokeRect(Math.round(w*0.22), Math.round(h*0.42), Math.round(w*0.56), Math.round(h*0.26));

        canvas.refresh();
    }

    createHouseFacade(key, w, h) {
        const canvas = this.textures.createCanvas(key, w, h);
        const ctx = canvas.getContext();
        // Terracota lisa — detalhes desenhados por overlay no WorldScene
        ctx.fillStyle = '#c87050';
        ctx.fillRect(0, 0, w, h);
        // Ripas horizontais sutis
        ctx.fillStyle = 'rgba(0,0,0,0.10)';
        for (let y = 5; y < h; y += 6) ctx.fillRect(0, y, w, 1);
        ctx.fillStyle = 'rgba(255,200,150,0.10)';
        for (let y = 2; y < h; y += 6) ctx.fillRect(0, y, w, 3);
        canvas.refresh();
    }

    createHealFacade(key, w, h) {
        const canvas = this.textures.createCanvas(key, w, h);
        const ctx = canvas.getContext();
        // Azul clínico liso — detalhes desenhados por overlay no WorldScene
        ctx.fillStyle = '#b0cede';
        ctx.fillRect(0, 0, w, h);
        // Juntas de azulejo muito sutis
        ctx.fillStyle = 'rgba(60,110,140,0.15)';
        for (let y = 8; y < h; y += 8) ctx.fillRect(0, y, w, 1);
        for (let x = 8; x < w; x += 8) ctx.fillRect(x, 0, 1, h);
        canvas.refresh();
    }

    createShopFacade(key, w, h) {
        const canvas = this.textures.createCanvas(key, w, h);
        const ctx = canvas.getContext();
        // Âmbar/madeira liso — detalhes desenhados por overlay no WorldScene
        ctx.fillStyle = '#a87020';
        ctx.fillRect(0, 0, w, h);
        // Veio vertical sutil
        ctx.fillStyle = 'rgba(0,0,0,0.08)';
        for (let x = 0; x < w; x += 4) ctx.fillRect(x, 0, 1, h);
        canvas.refresh();
    }

    createNPCTexture(key, w, h, color) {
        const canvas = this.textures.createCanvas(key, w, h);
        const ctx = canvas.getContext();
        ctx.imageSmoothingEnabled = false;

        const p = (x, y, pw, ph, c) => {
            ctx.fillStyle = c;
            ctx.fillRect(Math.round(x), Math.round(y), pw, ph);
        };

        const colorHex = '#' + color.toString(16).padStart(6, '0');

        // Sombra
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath();
        ctx.ellipse(w / 2, h - 3, w * 0.28, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pernas
        p(w*0.30, h*0.72, w*0.16, h*0.20, '#4a4a6b');
        p(w*0.54, h*0.72, w*0.16, h*0.20, '#4a4a6b');

        // Sapatos
        p(w*0.28, h*0.88, w*0.20, h*0.06, '#2d1f10');
        p(w*0.52, h*0.88, w*0.20, h*0.06, '#2d1f10');

        // Corpo (cor do NPC)
        p(w*0.22, h*0.42, w*0.56, h*0.32, colorHex);

        // Braços
        p(w*0.08, h*0.44, w*0.14, h*0.24, '#e8b89a');
        p(w*0.78, h*0.44, w*0.14, h*0.24, '#e8b89a');

        // Pescoço
        p(w*0.40, h*0.36, w*0.20, h*0.08, '#e8b89a');

        // Cabeça
        p(w*0.26, h*0.14, w*0.48, h*0.24, '#e8b89a');

        // Olhos
        p(w*0.34, h*0.20, w*0.10, h*0.07, '#1a1a2e');
        p(w*0.56, h*0.20, w*0.10, h*0.07, '#1a1a2e');

        // Boca
        p(w*0.42, h*0.30, w*0.16, h*0.03, '#c07850');

        // Cabelo
        p(w*0.24, h*0.02, w*0.52, h*0.14, '#4a2810');

        // Contorno
        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth = 1;
        ctx.strokeRect(Math.round(w*0.26), Math.round(h*0.14), Math.round(w*0.48), Math.round(h*0.24));
        ctx.strokeRect(Math.round(w*0.22), Math.round(h*0.42), Math.round(w*0.56), Math.round(h*0.32));

        canvas.refresh();
    }
}