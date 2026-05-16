// ============================================
// CREATURE SPRITES — Geração procedural de sprites
// ============================================

const CreatureSprites = {

    // Chamado em BootScene.generateTextures()
    generateAll(scene) {
        const specs = [
            // [key, element, variant, bodyColor, eyeColor]
            ['proc_embrill',         'fire',     0, 0xe74c3c, 0xffd700],
            ['proc_pyrothorn',       'fire',     1, 0xc0392b, 0xff9900],
            ['proc_aquafen',         'water',    0, 0x3498db, 0x00ffee],
            ['proc_tidalix',         'water',    1, 0x2980b9, 0x00ddcc],
            ['proc_thornvine',       'plant',    0, 0x27ae60, 0xaaff44],
            ['proc_floravex',        'plant',    1, 0x1e8449, 0x88ee22],
            ['proc_zapplet',         'electric', 0, 0xf1c40f, 0xffffff],
            ['proc_voltarex',        'electric', 1, 0xd4ac0d, 0xffffff],
            ['proc_dunebite',        'earth',    0, 0xa0522d, 0xffaa00],
            ['proc_glacifawn',       'ice',      0, 0x87ceeb, 0x00eeff],
            ['proc_frostclaw',       'ice',      1, 0x5dade2, 0x88ffff],
            ['proc_psychowl',        'psychic',  0, 0x9b59b6, 0xff44ff],
            ['proc_shadewisp',       'dark',     0, 0x5d6d7e, 0xff2020],
            ['proc_umbravox',        'dark',     1, 0x2c3e50, 0xff0000],
            ['proc_normousse',       'normal',   0, 0xbdc3c7, 0x8899ff],
            // Shinies
            ['proc_embrill_shiny',   'fire',     0, 0xf39c12, 0xffffff],
            ['proc_pyrothorn_shiny', 'fire',     1, 0xe67e22, 0xffffff],
            ['proc_aquafen_shiny',   'water',    0, 0x1abc9c, 0xaaffee],
            ['proc_tidalix_shiny',   'water',    1, 0x16a085, 0x88ffdd],
            ['proc_thornvine_shiny', 'plant',    0, 0xf1c40f, 0xffffff],
            ['proc_floravex_shiny',  'plant',    1, 0xd4ac0d, 0xffffff],
            ['proc_zapplet_shiny',   'electric', 0, 0x8e44ad, 0xee88ff],
            ['proc_voltarex_shiny',  'electric', 1, 0x9b59b6, 0xdd88ff],
            ['proc_dunebite_shiny',  'earth',    0, 0xc0392b, 0xff8888],
            ['proc_glacifawn_shiny', 'ice',      0, 0xecf0f1, 0xffffff],
            ['proc_frostclaw_shiny', 'ice',      1, 0xfdfefe, 0xaaffff],
            ['proc_psychowl_shiny',  'psychic',  0, 0xe74c3c, 0xff8888],
            ['proc_shadewisp_shiny', 'dark',     0, 0xe74c3c, 0xffaaaa],
            ['proc_umbravox_shiny',  'dark',     1, 0xc0392b, 0xff6666],
            ['proc_normousse_shiny', 'normal',   0, 0xf1c40f, 0xffffff],
        ];

        specs.forEach(([key, element, variant, bodyColor, eyeColor]) => {
            this._draw(scene, key, element, variant, bodyColor, eyeColor);
        });
    },

    _draw(scene, key, element, variant, bodyColor, eyeColor) {
        const S = 64;
        const canvas = scene.textures.createCanvas(key, S, S);
        const ctx = canvas.getContext();

        const hex = n => '#' + Math.min(0xffffff, Math.max(0, n)).toString(16).padStart(6, '0');
        const lighter = (n, amt = 35) => {
            const r = Math.min(255, ((n >> 16) & 0xff) + amt);
            const g = Math.min(255, ((n >> 8)  & 0xff) + amt);
            const b = Math.min(255, ( n        & 0xff) + amt);
            return hex((r << 16) | (g << 8) | b);
        };
        const darker = (n, amt = 35) => {
            const r = Math.max(0, ((n >> 16) & 0xff) - amt);
            const g = Math.max(0, ((n >> 8)  & 0xff) - amt);
            const b = Math.max(0, ( n        & 0xff) - amt);
            return hex((r << 16) | (g << 8) | b);
        };

        const main  = hex(bodyColor);
        const light = lighter(bodyColor);
        const dark  = darker(bodyColor);
        const eye   = hex(eyeColor);

        // --- Ground shadow ---
        ctx.fillStyle = 'rgba(0,0,0,0.22)';
        ctx.beginPath();
        ctx.ellipse(32, 60, 14, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // --- Back features (rendered behind body) ---
        this._backFeature(ctx, element, main, light, dark);

        // --- Body ---
        ctx.fillStyle = dark;
        ctx.beginPath(); ctx.ellipse(32, 47, 13, 11, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = main;
        ctx.beginPath(); ctx.ellipse(31, 45, 12, 10, -0.1, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = light;
        ctx.globalAlpha = 0.4;
        ctx.beginPath(); ctx.ellipse(30, 46, 7, 5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;

        // --- Head ---
        ctx.fillStyle = dark;
        ctx.beginPath(); ctx.ellipse(32, 26, 18, 17, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = main;
        ctx.beginPath(); ctx.ellipse(31, 24, 17, 16, -0.1, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = light;
        ctx.globalAlpha = 0.25;
        ctx.beginPath(); ctx.ellipse(26, 18, 10, 8, -0.5, 0, Math.PI); ctx.fill();
        ctx.globalAlpha = 1;

        // --- Ears / Horns (front, over head) ---
        this._ears(ctx, element, main, light, dark);

        // --- Eyes ---
        [[25, 24], [39, 24]].forEach(([ex, ey]) => {
            ctx.fillStyle = eye;
            ctx.globalAlpha = 0.28;
            ctx.beginPath(); ctx.arc(ex, ey, 7.5, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1;

            ctx.fillStyle = eye;
            ctx.beginPath(); ctx.arc(ex, ey, 5.5, 0, Math.PI * 2); ctx.fill();

            ctx.fillStyle = '#04040a';
            ctx.beginPath(); ctx.arc(ex + 1, ey + 1, 3.2, 0, Math.PI * 2); ctx.fill();

            ctx.fillStyle = eye;
            ctx.globalAlpha = 0.5;
            ctx.beginPath(); ctx.arc(ex + 1, ey + 1, 1.8, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1;

            ctx.fillStyle = 'rgba(255,255,255,0.95)';
            ctx.beginPath(); ctx.arc(ex - 1.5, ey - 1.5, 1.8, 0, Math.PI * 2); ctx.fill();
        });

        // --- Smile ---
        ctx.strokeStyle = 'rgba(0,0,0,0.4)';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(32, 31, 4, 0.3, Math.PI - 0.3); ctx.stroke();

        // --- Evolved form subtle rim highlight ---
        if (variant === 1) {
            ctx.strokeStyle = lighter(bodyColor, 80);
            ctx.globalAlpha = 0.15;
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(32, 24, 17, -2.2, -0.8); ctx.stroke();
            ctx.globalAlpha = 1;
        }

        canvas.refresh();
    },

    _backFeature(ctx, element, main, light, dark) {
        switch (element) {
            case 'fire': {
                [[-8, 0, '#ff4400'], [0, -4, '#ff7700'], [8, 0, '#ffaa00']].forEach(([ox, oy, c]) => {
                    ctx.fillStyle = c;
                    ctx.beginPath();
                    ctx.moveTo(32 + ox, 30 + oy);
                    ctx.bezierCurveTo(32 + ox - 5, 18 + oy, 32 + ox - 3, 6, 32 + ox, 2 + oy);
                    ctx.bezierCurveTo(32 + ox + 3, 6, 32 + ox + 5, 18 + oy, 32 + ox, 30 + oy);
                    ctx.fill();
                });
                // Fire tail
                ctx.fillStyle = '#ff5500';
                ctx.beginPath();
                ctx.moveTo(32, 52); ctx.bezierCurveTo(40, 56, 50, 50, 52, 44);
                ctx.bezierCurveTo(50, 48, 44, 50, 38, 50); ctx.closePath(); ctx.fill();
                break;
            }
            case 'water': {
                ctx.fillStyle = light;
                ctx.beginPath();
                ctx.moveTo(44, 38);
                ctx.bezierCurveTo(52, 28, 56, 16, 48, 10);
                ctx.bezierCurveTo(42, 14, 40, 26, 44, 38);
                ctx.fill();
                // Water tail
                ctx.fillStyle = dark;
                ctx.beginPath();
                ctx.moveTo(32, 52); ctx.bezierCurveTo(40, 58, 50, 54, 50, 46);
                ctx.bezierCurveTo(46, 52, 40, 54, 34, 52); ctx.closePath(); ctx.fill();
                break;
            }
            case 'ice': {
                ctx.fillStyle = '#b8e8f8';
                ctx.globalAlpha = 0.45;
                ctx.beginPath(); ctx.ellipse(32, 24, 22, 20, 0, 0, Math.PI * 2); ctx.fill();
                ctx.globalAlpha = 1;
                break;
            }
            case 'electric': {
                ctx.strokeStyle = main; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
                ctx.beginPath(); ctx.moveTo(42, 44); ctx.lineTo(54, 36); ctx.lineTo(48, 38); ctx.lineTo(58, 26); ctx.stroke();
                break;
            }
            case 'plant': {
                ctx.fillStyle = '#1e8449';
                ctx.beginPath();
                ctx.moveTo(20, 30); ctx.bezierCurveTo(8, 22, 6, 6, 18, 8);
                ctx.bezierCurveTo(24, 8, 24, 20, 20, 30); ctx.fill();
                ctx.beginPath();
                ctx.moveTo(44, 30); ctx.bezierCurveTo(56, 22, 58, 6, 46, 8);
                ctx.bezierCurveTo(40, 8, 40, 20, 44, 30); ctx.fill();
                // Leaf veins
                ctx.strokeStyle = '#145a32'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(20, 30); ctx.lineTo(13, 10); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(44, 30); ctx.lineTo(51, 10); ctx.stroke();
                break;
            }
            case 'psychic': {
                ctx.strokeStyle = light; ctx.lineWidth = 2;
                ctx.globalAlpha = 0.6;
                ctx.beginPath(); ctx.ellipse(32, 24, 24, 8, 0.3, 0, Math.PI * 2); ctx.stroke();
                ctx.globalAlpha = 1;
                break;
            }
            case 'dark': {
                ctx.fillStyle = dark;
                ctx.globalAlpha = 0.5;
                [[-12, 0], [0, 2], [12, 0]].forEach(([ox, oy]) => {
                    ctx.beginPath(); ctx.ellipse(32 + ox, 44 + oy, 9, 6, ox * 0.03, 0, Math.PI * 2); ctx.fill();
                });
                ctx.globalAlpha = 1;
                break;
            }
            case 'normal': {
                // Simple round tail
                ctx.fillStyle = dark;
                ctx.beginPath();
                ctx.moveTo(34, 52); ctx.bezierCurveTo(42, 56, 50, 50, 48, 44);
                ctx.bezierCurveTo(46, 48, 40, 50, 36, 50); ctx.closePath(); ctx.fill();
                break;
            }
        }
    },

    _ears(ctx, element, main, light, dark) {
        switch (element) {
            case 'fire': {
                ctx.fillStyle = dark;
                ctx.beginPath(); ctx.moveTo(18, 16); ctx.lineTo(10, 4); ctx.lineTo(22, 12); ctx.fill();
                ctx.beginPath(); ctx.moveTo(46, 16); ctx.lineTo(54, 4); ctx.lineTo(42, 12); ctx.fill();
                ctx.fillStyle = '#ff5500';
                ctx.beginPath(); ctx.moveTo(19, 15); ctx.lineTo(12, 6); ctx.lineTo(21, 13); ctx.fill();
                ctx.beginPath(); ctx.moveTo(45, 15); ctx.lineTo(52, 6); ctx.lineTo(43, 13); ctx.fill();
                break;
            }
            case 'water': {
                ctx.fillStyle = main;
                ctx.beginPath(); ctx.moveTo(16,18); ctx.bezierCurveTo(10,8,14,2,20,8); ctx.bezierCurveTo(22,12,20,16,16,18); ctx.fill();
                ctx.beginPath(); ctx.moveTo(48,18); ctx.bezierCurveTo(54,8,50,2,44,8); ctx.bezierCurveTo(42,12,44,16,48,18); ctx.fill();
                ctx.fillStyle = light;
                ctx.beginPath(); ctx.moveTo(17,16); ctx.bezierCurveTo(13,10,15,5,19,9); ctx.bezierCurveTo(20,12,19,14,17,16); ctx.fill();
                ctx.beginPath(); ctx.moveTo(47,16); ctx.bezierCurveTo(51,10,49,5,45,9); ctx.bezierCurveTo(44,12,45,14,47,16); ctx.fill();
                break;
            }
            case 'ice': {
                ctx.fillStyle = '#c8ecf8';
                ctx.beginPath(); ctx.moveTo(24,14); ctx.lineTo(20,2); ctx.lineTo(28,10); ctx.closePath(); ctx.fill();
                ctx.beginPath(); ctx.moveTo(40,14); ctx.lineTo(44,2); ctx.lineTo(36,10); ctx.closePath(); ctx.fill();
                ctx.beginPath(); ctx.moveTo(32,11); ctx.lineTo(29,3); ctx.lineTo(35,7);  ctx.closePath(); ctx.fill();
                ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(24,14); ctx.lineTo(20,2); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(40,14); ctx.lineTo(44,2); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(32,11); ctx.lineTo(29,3); ctx.stroke();
                break;
            }
            case 'plant': {
                ctx.fillStyle = '#2ecc71';
                ctx.beginPath(); ctx.moveTo(17,17); ctx.bezierCurveTo(8,10,10,0,20,5); ctx.bezierCurveTo(24,8,22,14,17,17); ctx.fill();
                ctx.beginPath(); ctx.moveTo(47,17); ctx.bezierCurveTo(56,10,54,0,44,5); ctx.bezierCurveTo(40,8,42,14,47,17); ctx.fill();
                ctx.strokeStyle = '#1a7a40'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(17,17); ctx.lineTo(14,8); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(47,17); ctx.lineTo(50,8); ctx.stroke();
                break;
            }
            case 'electric': {
                ctx.fillStyle = main;
                ctx.beginPath(); ctx.moveTo(18,16); ctx.lineTo(12,8); ctx.lineTo(16,12); ctx.lineTo(13,4); ctx.lineTo(19,10); ctx.lineTo(20,4); ctx.lineTo(22,14); ctx.fill();
                ctx.beginPath(); ctx.moveTo(46,16); ctx.lineTo(52,8); ctx.lineTo(48,12); ctx.lineTo(51,4); ctx.lineTo(45,10); ctx.lineTo(44,4); ctx.lineTo(42,14); ctx.fill();
                break;
            }
            case 'earth': {
                ctx.fillStyle = '#6b4226';
                ctx.beginPath(); ctx.moveTo(20,16); ctx.lineTo(17,4); ctx.lineTo(24,11); ctx.fill();
                ctx.beginPath(); ctx.moveTo(44,16); ctx.lineTo(47,4); ctx.lineTo(40,11); ctx.fill();
                ctx.fillStyle = '#a0712a';
                ctx.beginPath(); ctx.moveTo(21,15); ctx.lineTo(18,6); ctx.lineTo(24,12); ctx.fill();
                ctx.beginPath(); ctx.moveTo(43,15); ctx.lineTo(46,6); ctx.lineTo(40,12); ctx.fill();
                break;
            }
            case 'psychic': {
                ctx.fillStyle = main;
                ctx.beginPath(); ctx.arc(17,14,7,0,Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(47,14,7,0,Math.PI*2); ctx.fill();
                ctx.fillStyle = light;
                ctx.beginPath(); ctx.arc(15,12,4,0,Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(49,12,4,0,Math.PI*2); ctx.fill();
                // Gem
                ctx.fillStyle = '#e67e22';
                ctx.beginPath(); ctx.moveTo(32,10); ctx.lineTo(28,15); ctx.lineTo(32,17); ctx.lineTo(36,15); ctx.closePath(); ctx.fill();
                ctx.fillStyle = '#f0b060';
                ctx.beginPath(); ctx.moveTo(32,11); ctx.lineTo(29,14); ctx.lineTo(32,15); ctx.lineTo(35,14); ctx.closePath(); ctx.fill();
                break;
            }
            case 'dark': {
                ctx.fillStyle = dark;
                ctx.beginPath(); ctx.moveTo(17,17); ctx.lineTo(10,4); ctx.lineTo(15,11); ctx.lineTo(18,5); ctx.lineTo(22,13); ctx.fill();
                ctx.beginPath(); ctx.moveTo(47,17); ctx.lineTo(54,4); ctx.lineTo(49,11); ctx.lineTo(46,5); ctx.lineTo(42,13); ctx.fill();
                ctx.fillStyle = '#e74c3c'; ctx.globalAlpha = 0.5;
                ctx.beginPath(); ctx.arc(14,8,3,0,Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(50,8,3,0,Math.PI*2); ctx.fill();
                ctx.globalAlpha = 1;
                break;
            }
            case 'normal':
            default: {
                ctx.fillStyle = main;
                ctx.beginPath(); ctx.arc(18,13,8,0,Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(46,13,8,0,Math.PI*2); ctx.fill();
                ctx.fillStyle = light;
                ctx.beginPath(); ctx.arc(17,12,5,0,Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(47,12,5,0,Math.PI*2); ctx.fill();
                ctx.fillStyle = '#ffb6c1';
                ctx.beginPath(); ctx.arc(17,12,3,0,Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(47,12,3,0,Math.PI*2); ctx.fill();
                break;
            }
        }
    }
};
