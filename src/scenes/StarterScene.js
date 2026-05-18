// ============================================
// STARTER SCENE — Entrega do Tumon inicial por Rhaevic Antiquera
// ============================================

class StarterScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StarterScene' });
    }

    preload() {
        const keys = ['tumon-fogo', 'tumon-agua', 'tumon-neutro', 'tumon-raio', 'tumon-sombrio', 'tumon-terra'];
        keys.forEach(k => {
            if (!this.textures.exists(k)) this.load.image(k, `assets/sprites/${k}.png`);
        });
    }

    create() {
        const W = CONST.GAME_WIDTH;
        const H = CONST.GAME_HEIGHT;

        this._phase    = null;
        this._selected = null;
        this._cards    = [];

        this._buildBackground(W, H);

        // Personagem do velho (lado esquerdo, área de conteúdo)
        this._aldricFull = this.add.container(170, 210);
        this._drawAldricFull(this._aldricFull);

        // Cards das criaturas (ocultos inicialmente)
        this._cardsLayer = this.add.container(0, 0).setAlpha(0).setVisible(false);
        this._buildCards(W, H);

        // Preview da criatura escolhida (lado direito, oculto)
        this._previewLayer = this.add.container(0, 0).setAlpha(0).setVisible(false);

        // Caixa de diálogo (bottom 170px)
        this._dlgBox = this._buildDialogBox(W, H);

        // ENTER avança o diálogo
        this.input.keyboard.on('keydown-ENTER', () => this._advanceDialog());

        this._setPhase('intro');
    }

    // ─── Background ────────────────────────────────────────────────
    _buildBackground(W, H) {
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x06061a, 0x06061a, 0x100820, 0x100820, 1);
        bg.fillRect(0, 0, W, H);

        // Estrelas
        for (let i = 0; i < 80; i++) {
            const sx = Phaser.Math.Between(0, W);
            const sy = Phaser.Math.Between(0, H);
            const sr = Phaser.Math.FloatBetween(0.4, 1.8);
            const sa = Phaser.Math.FloatBetween(0.15, 0.7);
            this.add.circle(sx, sy, sr, 0xffffff, sa);
        }

        // Linha divisória sutil entre conteúdo e diálogo
        const div = this.add.graphics();
        div.lineStyle(1, 0x333366, 0.6);
        div.strokeRect(0, 428, W, 172);
        div.fillStyle(0x08081e, 0.95);
        div.fillRect(0, 428, W, 172);
    }

    // ─── Desenho do Rhaevic Antiquera (corpo inteiro) ───────────────────
    _drawAldricFull(container) {
        const g = this.add.graphics();
        const x = 0, y = 0;

        // Sombra no chão
        g.fillStyle(0x000000, 0.18);
        g.fillEllipse(x, y + 148, 80, 18);

        // Pés / botas
        g.fillStyle(0x2a1a0e);
        g.fillRoundedRect(x - 22, y + 124, 18, 22, 4);
        g.fillRoundedRect(x + 4, y + 124, 18, 22, 4);

        // Pernas
        g.fillStyle(0x3d2b1f);
        g.fillRect(x - 19, y + 90, 13, 36);
        g.fillRect(x + 6, y + 90, 13, 36);

        // Robe (corpo) — manto roxo-escuro
        g.fillStyle(0x1e1054);
        g.fillRect(x - 28, y - 12, 56, 105);
        // Alargamento inferior do manto
        g.fillTriangle(x - 28, y + 50, x + 28, y + 50, x - 38, y + 105);
        g.fillTriangle(x - 28, y + 50, x + 28, y + 50, x + 38, y + 105);

        // Detalhes do manto (bordas douradas)
        g.lineStyle(2, 0xc8a200, 0.8);
        g.strokeRect(x - 28, y - 12, 56, 105);

        // Cinto
        g.fillStyle(0x8b6914);
        g.fillRect(x - 28, y + 55, 56, 8);
        g.fillStyle(0xf1c40f);
        g.fillRect(x - 6, y + 56, 12, 6);

        // Braço esquerdo
        g.fillStyle(0x1e1054);
        g.fillRect(x - 40, y - 5, 14, 42);
        // Mão esquerda
        g.fillStyle(0xd4a88a);
        g.fillCircle(x - 33, y + 40, 7);

        // Braço direito + cajado
        g.fillStyle(0x1e1054);
        g.fillRect(x + 26, y - 5, 14, 42);
        // Cajado
        g.fillStyle(0x7b4f1e);
        g.fillRect(x + 36, y + 15, 5, 135);
        // Pomo do cajado
        g.fillStyle(0xf1c40f);
        g.fillCircle(x + 38, y + 10, 9);
        g.fillStyle(0xffffff, 0.4);
        g.fillCircle(x + 36, y + 8, 3);
        // Mão direita
        g.fillStyle(0xd4a88a);
        g.fillCircle(x + 33, y + 35, 6);

        // Pescoço
        g.fillStyle(0xd4a88a);
        g.fillRect(x - 8, y - 24, 16, 16);

        // Cabeça
        g.fillStyle(0xd4a88a);
        g.fillCircle(x, y - 44, 26);

        // Cabelo branco
        g.fillStyle(0xf0f0ec);
        g.fillEllipse(x - 1, y - 64, 46, 24);
        g.fillCircle(x - 22, y - 56, 12);
        g.fillCircle(x + 22, y - 56, 12);
        g.fillEllipse(x, y - 72, 30, 16);

        // Barba
        g.fillStyle(0xe8e8e4);
        g.fillTriangle(x - 14, y - 28, x + 14, y - 28, x, y + 4);
        g.fillEllipse(x, y - 14, 22, 18);

        // Sobrancelhas espessas
        g.fillStyle(0xbbbbbb);
        g.fillRect(x - 17, y - 58, 14, 4);
        g.fillRect(x + 3, y - 58, 14, 4);

        // Olhos (sábios, cansados)
        g.fillStyle(0x5d4037);
        g.fillCircle(x - 9, y - 49, 4);
        g.fillCircle(x + 9, y - 49, 4);
        g.fillStyle(0x1a0d00);
        g.fillCircle(x - 9, y - 49, 2);
        g.fillCircle(x + 9, y - 49, 2);
        g.fillStyle(0xffffff);
        g.fillCircle(x - 8, y - 50, 1);
        g.fillCircle(x + 10, y - 50, 1);

        // Chapéu de mago (alto, azul-noite)
        g.fillStyle(0x12085a);
        g.fillTriangle(x - 18, y - 68, x + 18, y - 68, x, y - 120);
        g.fillRect(x - 24, y - 73, 48, 9); // aba
        // Estrela no chapéu
        g.fillStyle(0xf1c40f);
        this._drawStar(g, x + 6, y - 96, 5, 6, 3);

        container.add(g);

        // Nome flutuante discreto
        const nameTag = this.add.text(x, y - 140, 'Rhaevic Antiquera', {
            fontFamily: 'Courier New',
            fontSize: '11px',
            color: '#c8a200',
            fontStyle: 'italic'
        }).setOrigin(0.5);
        container.add(nameTag);
        this.tweens.add({
            targets: nameTag, y: nameTag.y - 4,
            yoyo: true, repeat: -1, duration: 1800, ease: 'Sine.easeInOut'
        });
    }

    _drawStar(g, cx, cy, points, outerR, innerR) {
        const step = Math.PI / points;
        g.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const r = (i % 2 === 0) ? outerR : innerR;
            const angle = i * step - Math.PI / 2;
            const px = cx + Math.cos(angle) * r;
            const py = cy + Math.sin(angle) * r;
            if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
        }
        g.closePath();
        g.fillPath();
    }

    // ─── Caixa de diálogo (bottom) ─────────────────────────────────
    _buildDialogBox(W, H) {
        const box = {
            container: this.add.container(0, 428),
            bg: null, portrait: null, nameText: null, bodyText: null, indicator: null
        };

        // Fundo
        const bg = this.add.graphics();
        bg.fillStyle(0x08081e, 0.97);
        bg.fillRect(0, 0, W, 172);
        bg.lineStyle(1, 0x333366, 0.8);
        bg.strokeRect(0, 0, W, 172);
        box.bg = bg;

        // Área do retrato
        const portraitBg = this.add.graphics();
        portraitBg.fillStyle(0x12122e);
        portraitBg.fillRoundedRect(10, 10, 90, 152, 6);
        portraitBg.lineStyle(1, 0x444488, 0.8);
        portraitBg.strokeRoundedRect(10, 10, 90, 152, 6);

        // Rosto do Aldric no retrato (mini)
        const face = this._drawAldricFace(55, 86);

        // Nome
        const nameText = this.add.text(115, 14, 'Rhaevic Antiquera', {
            fontFamily: 'Courier New', fontSize: '13px',
            color: '#c8a200', fontStyle: 'bold'
        });

        // Linha decorativa abaixo do nome
        const deco = this.add.graphics();
        deco.lineStyle(1, 0xc8a200, 0.4);
        deco.lineBetween(115, 30, W - 20, 30);

        // Texto do diálogo
        const bodyText = this.add.text(115, 38, '', {
            fontFamily: 'Courier New', fontSize: '12px',
            color: '#dddddd', wordWrap: { width: W - 140 }, lineSpacing: 4
        });
        box.bodyText = bodyText;

        // Indicador "ENTER" — sempre visível, pisca entre linhas
        const indicator = this.add.text(W - 20, 158, '[ ENTER ]', {
            fontFamily: 'Courier New', fontSize: '11px', color: '#f1c40f'
        }).setOrigin(1, 1).setAlpha(0);
        box.indicator = indicator;
        this.tweens.add({
            targets: indicator, alpha: 1,
            yoyo: true, repeat: -1, duration: 550
        });

        // Rótulo da ação (na última linha — apenas visual, Enter/clique executam)
        const actionBtn = this.add.text(W - 20, 138, '', {
            fontFamily: 'Courier New', fontSize: '11px',
            color: '#000000', backgroundColor: '#f1c40f',
            padding: { x: 12, y: 5 }, fontStyle: 'bold'
        }).setOrigin(1, 0.5).setAlpha(0);
        box.actionBtn = actionBtn;

        box.container.add([bg, portraitBg, face, nameText, deco, bodyText, indicator, actionBtn]);

        // Clique na caixa avança diálogo
        const hitArea = this.add.rectangle(W / 2, 86, W, 172, 0x000000, 0)
            .setInteractive({ useHandCursor: false });
        hitArea.on('pointerdown', () => this._advanceDialog());
        box.container.add(hitArea);
        box.hitArea = hitArea;

        return box;
    }

    _drawAldricFace(x, y) {
        const g = this.add.graphics();
        // Fundo escuro da área
        // Corpo mini
        g.fillStyle(0x1e1054);
        g.fillRect(x - 18, y + 8, 36, 30);
        // Pescoço
        g.fillStyle(0xd4a88a);
        g.fillRect(x - 5, y + 4, 10, 8);
        // Cabeça
        g.fillStyle(0xd4a88a);
        g.fillCircle(x, y - 8, 18);
        // Cabelo
        g.fillStyle(0xf0f0ec);
        g.fillEllipse(x, y - 20, 32, 14);
        g.fillCircle(x - 15, y - 14, 8);
        g.fillCircle(x + 15, y - 14, 8);
        // Barba
        g.fillStyle(0xe8e8e4);
        g.fillTriangle(x - 9, y - 2, x + 9, y - 2, x, y + 14);
        // Olhos
        g.fillStyle(0x5d4037);
        g.fillCircle(x - 6, y - 10, 3);
        g.fillCircle(x + 6, y - 10, 3);
        g.fillStyle(0x1a0d00);
        g.fillCircle(x - 6, y - 10, 1.5);
        g.fillCircle(x + 6, y - 10, 1.5);
        // Chapéu
        g.fillStyle(0x12085a);
        g.fillTriangle(x - 12, y - 24, x + 12, y - 24, x, y - 50);
        g.fillRect(x - 16, y - 28, 32, 6);
        return g;
    }

    // ─── Cards das criaturas ────────────────────────────────────────
    _buildCards(W, H) {
        const starterIds = ['flamrak', 'hydravyn', 'aurveil', 'zoltrak', 'nyxmord', 'terravek'];
        const cardW = 220, cardH = 148, gapX = 14, gapY = 10;
        const cols = 3;
        const totalW = cols * cardW + (cols - 1) * gapX;
        const startX = (W - totalW) / 2;
        const startY = 58;

        // Título
        const title = this.add.text(W / 2, 22, 'Escolha sua criatura inicial, jovem...', {
            fontFamily: 'Courier New', fontSize: '14px',
            color: '#c8a200', fontStyle: 'italic'
        }).setOrigin(0.5);
        this._cardsLayer.add(title);

        starterIds.forEach((id, idx) => {
            const col = idx % cols;
            const row = Math.floor(idx / cols);
            const cx = startX + col * (cardW + gapX) + cardW / 2;
            const cy = startY + row * (cardH + gapY) + cardH / 2;
            this._buildCard(cx, cy, cardW, cardH, id);
        });
    }

    _buildCard(cx, cy, cardW, cardH, id) {
        const template = CreaturesDB[id];
        if (!template) return;

        const hexStr = CONST.ELEMENT_COLORS[template.element] || '#aaaaaa';
        const elemColor = parseInt(hexStr.replace('#', ''), 16);
        const elemName = ElementTable.names[template.element] || template.element;

        const container = this.add.container(cx, cy);

        const bg = this.add.graphics();
        bg.fillStyle(0x10102a, 0.97);
        bg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 6);
        bg.lineStyle(2, elemColor, 0.45);
        bg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 6);

        // Glow de elemento
        const glow = this.add.graphics();
        glow.fillStyle(elemColor, 0.07);
        glow.fillCircle(-cardW / 2 + 46, 0, 42);

        // Sprite
        const spriteKey = getSpriteKey(this, template.spriteKey);
        const spr = this.add.image(-cardW / 2 + 46, 0, spriteKey).setDisplaySize(76, 76);

        // Informações (lado direito do sprite)
        const nameText = this.add.text(-cardW / 2 + 100, -cardH / 2 + 10, template.name, {
            fontFamily: 'Courier New', fontSize: '13px',
            color: '#ffffff', fontStyle: 'bold'
        });

        const elemText = this.add.text(-cardW / 2 + 100, -cardH / 2 + 26, `◆ ${elemName}`, {
            fontFamily: 'Courier New', fontSize: '9px', color: hexStr
        });

        // Mini barras de stats — ajustadas para caber dentro do card
        const s = template.baseStats;
        const statsData = [
            { label: 'HP',  val: s.hp,      color: 0x2ecc71, hex: '#2ecc71' },
            { label: 'ATK', val: s.attack,  color: 0xe74c3c, hex: '#e74c3c' },
            { label: 'DEF', val: s.defense, color: 0x3498db, hex: '#3498db' },
            { label: 'SPD', val: s.speed,   color: 0xf1c40f, hex: '#f1c40f' }
        ];
        const statsG = this.add.graphics();
        const labelX = -cardW / 2 + 98;   // início da abreviação
        const barX   = labelX + 28;        // início da barra
        const valW   = 22;                 // espaço para o número à direita
        const barW   = cardW / 2 - barX - valW - 6; // margem direita de 6px
        const statTexts = [];
        statsData.forEach((stat, i) => {
            const sy = -cardH / 2 + 46 + i * 18;
            // Background da barra
            statsG.fillStyle(0x1a1a3a);
            statsG.fillRect(barX, sy + 2, barW, 8);
            // Fill da barra
            statsG.fillStyle(stat.color);
            statsG.fillRect(barX, sy + 2, Math.floor(barW * Math.min(stat.val, 100) / 100), 8);
            // Abreviação
            statTexts.push(this.add.text(labelX, sy - 1, stat.label, {
                fontFamily: 'Courier New', fontSize: '10px',
                color: '#ffffff', fontStyle: 'bold'
            }));
            // Valor numérico (direita da barra)
            statTexts.push(this.add.text(barX + barW + 3, sy - 1, String(stat.val), {
                fontFamily: 'Courier New', fontSize: '10px',
                color: '#ffffff', fontStyle: 'bold'
            }));
        });

        // Área interativa
        const hit = this.add.rectangle(0, 0, cardW, cardH, 0x000000, 0)
            .setInteractive({ useHandCursor: true });

        hit.on('pointerover', () => {
            if (this._selected !== id) {
                bg.clear();
                bg.fillStyle(0x181838, 0.98);
                bg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 6);
                bg.lineStyle(2, elemColor, 1.0);
                bg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 6);
            }
        });
        hit.on('pointerout', () => {
            if (this._selected !== id) this._resetCardBg(bg, cardW, cardH, elemColor);
        });
        hit.on('pointerdown', () => this._pickCreature(id, bg, cardW, cardH, elemColor));

        container.add([bg, glow, spr, nameText, elemText, statsG, ...statTexts, hit]);
        this._cardsLayer.add(container);
        this._cards.push({ id, bg, cardW, cardH, elemColor });
    }

    _resetCardBg(bg, cardW, cardH, elemColor) {
        bg.clear();
        bg.fillStyle(0x10102a, 0.97);
        bg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 6);
        bg.lineStyle(2, elemColor, 0.45);
        bg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 6);
    }

    // ─── Preview da criatura escolhida ─────────────────────────────
    _buildPreview(id) {
        this._previewLayer.removeAll(true);

        const template = CreaturesDB[id];
        if (!template) return;

        const hexStr = CONST.ELEMENT_COLORS[template.element] || '#aaaaaa';
        const elemColor = parseInt(hexStr.replace('#', ''), 16);

        // Posição: lado direito da tela, acima da caixa de diálogo
        const px = 580, py = 200;

        const g = this.add.graphics();
        g.fillStyle(0x0d0d26, 0.9);
        g.fillRoundedRect(px - 110, py - 150, 220, 280, 8);
        g.lineStyle(2, elemColor, 0.7);
        g.strokeRoundedRect(px - 110, py - 150, 220, 280, 8);
        // Brilho
        g.fillStyle(elemColor, 0.06);
        g.fillCircle(px, py - 20, 90);

        const spriteKey = getSpriteKey(this, template.spriteKey);
        const spr = this.add.image(px, py - 30, spriteKey).setDisplaySize(120, 120);

        const nameText = this.add.text(px, py + 58, template.name, {
            fontFamily: 'Courier New', fontSize: '15px',
            color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        const elemText = this.add.text(px, py + 78, `◆ ${ElementTable.names[template.element]}`, {
            fontFamily: 'Courier New', fontSize: '11px', color: hexStr
        }).setOrigin(0.5);

        const lore = template.lore.length > 60
            ? template.lore.slice(0, 57) + '…'
            : template.lore;
        const loreText = this.add.text(px, py + 100, lore, {
            fontFamily: 'Courier New', fontSize: '9px',
            color: '#999999', wordWrap: { width: 200 }, align: 'center'
        }).setOrigin(0.5);

        this._previewLayer.add([g, spr, nameText, elemText, loreText]);

        this._previewLayer.setVisible(true);
        this.tweens.add({ targets: this._previewLayer, alpha: 1, duration: 400 });
    }

    // ─── Máquina de estados ─────────────────────────────────────────
    _setPhase(phase) {
        this._phase = phase;
        this._dlgIdx = 0;

        if (phase === 'intro') {
            this._dialogs = [
                'Ah, jovem! Finalmente chegou. Eu estava esperando... esperando... bem, estava esperando por alguém.',
                'Sou Rhaevic Antiquera. O maior domador que Tumora já conheceu. Sim, o maior. Ninguém discute isso.',
                'Estou me aposentando. Antes de ir, tenho algo importante a lhe entregar — algo que levei décadas desenvolvendo.',
                'Estas criaturas são únicas no mundo. Raridades genéticas. Minha maior obra. Minha... minha... ah! Minha obra-prima!',
                'Escolha 3 delas!'
            ];
            this._dlgActionLabel = 'Escolher →';
            this._dlgOnAction = () => this._setPhase('select');
            this._showDlgLine();
        }

        if (phase === 'select') {
            // Oculta o velho grande, mostra os cards
            this.tweens.add({
                targets: this._aldricFull, alpha: 0, duration: 300,
                onComplete: () => this._aldricFull.setVisible(false)
            });
            this._cardsLayer.setVisible(true);
            this.tweens.add({ targets: this._cardsLayer, alpha: 1, duration: 400 });

            // Diálogo muda para dica
            this._dlgBox.bodyText.setText('Observe cada criatura com cuidado...');
            this._dlgBox.indicator.setAlpha(0);
            this._dlgBox.actionBtn.setAlpha(0);
            this._dlgBox.hitArea.disableInteractive();
        }

        if (phase === 'react') {
            // Oculta cards, mostra Aldric novamente
            this.tweens.add({
                targets: this._cardsLayer, alpha: 0, duration: 300,
                onComplete: () => this._cardsLayer.setVisible(false)
            });
            this._aldricFull.setVisible(true);
            this.tweens.add({ targets: this._aldricFull, alpha: 1, duration: 400 });
            this._dlgBox.hitArea.setInteractive({ useHandCursor: false });

            const name = CreaturesDB[this._selected]?.name || '?';
            this._dialogs = [
                'Quem falou em 3?!',
                `Você tem sorte em ganhar ${name}. Sorte não, afinal, estou te entregando porque... er...`,
                'Bem. Com minha aposentadoria, o mundo precisará de bons domadores. É isso. Cuide bem dela.'
            ];
            this._dlgActionLabel = 'Continuar →';
            this._dlgOnAction = () => this._setPhase('lore');
            this._showDlgLine();

            // Mostra preview da criatura escolhida
            this._buildPreview(this._selected);
        }

        if (phase === 'lore') {
            this._dialogs = [
                'Se um dia quiser mais... existem lugares no reino de Tumora onde grandes domadores conquistam ovos dessas criaturas. Procure-os.',
                'Também é possível cruzá-las com outras. Mas um híbrido dessas raridades é... é... ah, é muito difícil de acontecer.',
                'A não ser que dois desses seres especiais se reproduzam entre si. Aí as chances aumentam... considerávelmente.',
                'Boa sorte, jovem. Tumora vai... vai precisar... de bons domadores. É isso que eu ia dizer.'
            ];
            this._dlgActionLabel = '  Começar aventura!  ';
            this._dlgOnAction = () => this._startGame();
            this._showDlgLine();
        }
    }

    _showDlgLine() {
        const line = this._dialogs[this._dlgIdx];
        if (!line) return;

        this._dlgBox.bodyText.setText(line);

        const isLast = this._dlgIdx === this._dialogs.length - 1;

        if (isLast) {
            // Mostra rótulo da ação; ENTER e clique executam via _advanceDialog
            this._dlgBox.actionBtn.setText(`  ${this._dlgActionLabel}  `);
            this._dlgBox.actionBtn.setAlpha(1);
            this._dlgBox.indicator.setText('[ ENTER ]');
            this._dlgBox.indicator.setAlpha(1);
        } else {
            this._dlgBox.actionBtn.setAlpha(0);
            this._dlgBox.indicator.setText('[ ENTER ]');
            this._dlgBox.indicator.setAlpha(1);
        }
    }

    _advanceDialog() {
        if (this._phase === 'select') return;
        if (this._dlgIdx < this._dialogs.length - 1) {
            this._dlgIdx++;
            this._showDlgLine();
        } else {
            // Última linha: ENTER ou clique executa a ação da fase
            if (this._dlgOnAction) this._dlgOnAction();
        }
    }

    // ─── Seleção da criatura ────────────────────────────────────────
    _pickCreature(id, bg, cardW, cardH, elemColor) {
        // Reseta todos os cards
        this._cards.forEach(c => this._resetCardBg(c.bg, c.cardW, c.cardH, c.elemColor));

        // Destaca o selecionado
        bg.clear();
        bg.fillStyle(0x0a1e12, 0.98);
        bg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 6);
        bg.lineStyle(3, 0xf1c40f, 1.0);
        bg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 6);

        this._selected = id;

        // Muda fase para 'confirming' — desbloqueia _advanceDialog
        this._phase = 'confirming';

        // Mostra confirmação na caixa de diálogo — ENTER ou clique confirma
        const name = CreaturesDB[id]?.name || '?';
        this._dlgBox.bodyText.setText(`Você escolheu: ${name}!`);
        this._dlgBox.actionBtn.setText(`  Confirmar ${name}!  `);
        this._dlgBox.actionBtn.setAlpha(1);
        this._dlgBox.indicator.setAlpha(1);
        this._dlgBox.hitArea.setInteractive({ useHandCursor: false });

        this._dlgOnAction = () => this._setPhase('react');
        this._dialogs = [''];
        this._dlgIdx = 0;
    }

    // ─── Início do jogo ─────────────────────────────────────────────
    _startGame() {
        const starterGenetics = Helpers.randomInt(2, 5);
        const starter = new Creature(this._selected, 5, starterGenetics);
        const defaultData = saveSystem.getDefaultSaveData();
        defaultData.party = [starter.serialize()];
        saveSystem.save(defaultData);

        this.cameras.main.fadeOut(600, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('WorldScene');
        });
    }
}
