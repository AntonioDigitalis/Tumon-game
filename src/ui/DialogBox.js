// ============================================
// DIALOG BOX — Caixa de diálogo reutilizável
// ============================================

class DialogBox {
    constructor(scene) {
        this.scene = scene;
        this.container = null;
        this.textObj = null;
        this.isVisible = false;
        this.messages = [];
        this.currentIndex = 0;
        this.callback = null;
        this.typing = false;
        this.fullText = '';
        this.displayedText = '';
        this.typeTimer = null;
        this.choiceActive = false;
        this.choiceIndex = 0;
        this.choiceCallback = null;
        this._choiceTexts = null;
        this._choiceCursor = null;
    }

    create() {
        // FIX: usa as dimensões reais do canvas, não da câmera
        // A câmera pode ter zoom e mover — o canvas é fixo
        const W = this.scene.scale.width;
        const H = this.scene.scale.height;

        const boxH = 120;
        const boxPad = 120;
        const boxW = W - boxPad * 2;

        // FIX: container com scrollFactor(0) para fixar na tela
        // Posicionado em (0,0) — todos os filhos usam coordenadas relativas ao container
        this.container = this.scene.add.container(0, 0)
            .setDepth(1000)
            .setScrollFactor(0);

        // Background: posição relativa ao container (centro do box)
        const bgX = boxPad + boxW / 2;
        const bgY = H - boxH - boxPad + boxH / 2;
        const bg = this.scene.add.rectangle(bgX, bgY, boxW, boxH, 0x000000, 0.85);
        bg.setStrokeStyle(2, 0xffffff);

        // Texto: canto superior esquerdo do box
        const textX = boxPad + 15;
        const textY = H - boxH - boxPad + 15;
        this.textObj = this.scene.add.text(textX, textY, '', {
            fontFamily: 'Courier New',
            fontSize: '16px',
            color: '#ffffff',
            wordWrap: { width: boxW - 30 },
            lineSpacing: 4
        });

        // Indicador de avanço: canto inferior direito do box
        const promptX = boxPad + boxW - 30;
        const promptY = H - boxPad - 25;
        this.promptText = this.scene.add.text(promptX, promptY, '▼', {
            fontFamily: 'Courier New',
            fontSize: '16px',
            color: '#f1c40f'
        });

        this.container.add([bg, this.textObj, this.promptText]);
        this.container.setVisible(false);

        // Blink prompt
        this.scene.tweens.add({
            targets: this.promptText,
            alpha: 0,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }

    show(messages, callback = null) {
        this.messages = Array.isArray(messages) ? messages : [messages];
        this.currentIndex = 0;
        this.callback = callback;
        this.isVisible = true;
        this.container.setVisible(true);
        this.showCurrentMessage();
    }

    showCurrentMessage() {
        if (this.currentIndex >= this.messages.length) {
            this.hide();
            return;
        }

        this.fullText = this.messages[this.currentIndex];
        this.displayedText = '';
        this.typing = true;
        this.textObj.setText('');

        let charIndex = 0;
        if (this.typeTimer) this.typeTimer.remove();

        this.typeTimer = this.scene.time.addEvent({
            delay: 25,
            callback: () => {
                if (charIndex < this.fullText.length) {
                    this.displayedText += this.fullText[charIndex];
                    this.textObj.setText(this.displayedText);
                    charIndex++;
                } else {
                    this.typing = false;
                    if (this.typeTimer) this.typeTimer.remove();
                }
            },
            repeat: this.fullText.length - 1
        });
    }

    advance() {
        if (!this.isVisible) return;

        if (this.typing) {
            // Skip typing, mostra texto completo
            this.typing = false;
            if (this.typeTimer) this.typeTimer.remove();
            this.displayedText = this.fullText;
            this.textObj.setText(this.displayedText);
            return;
        }

        this.currentIndex++;
        if (this.currentIndex >= this.messages.length) {
            this.hide();
        } else {
            this.showCurrentMessage();
        }
    }

    hide() {
        this.isVisible = false;
        this.container.setVisible(false);
        if (this.typeTimer) this.typeTimer.remove();
        if (this.callback) {
            const cb = this.callback;
            this.callback = null;
            cb();
        }
    }

    showChoice(header, options, callback) {
        this.choiceActive = true;
        this.choiceIndex = 0;
        this.choiceCallback = callback;
        this.isVisible = true;
        this.container.setVisible(true);
        this.promptText.setVisible(false);
        this.typing = false;
        if (this.typeTimer) this.typeTimer.remove();
        this.textObj.setText(header);

        const H = this.scene.scale.height;
        const boxTop = H - 120 - 120;

        this._choiceTexts = options.map((opt, i) => {
            const t = this.scene.add.text(120 + 38, boxTop + 42 + i * 22, opt, {
                fontFamily: 'Courier New',
                fontSize: '14px',
                color: '#ffffff'
            });
            this.container.add(t);
            return t;
        });

        this._choiceCursor = this.scene.add.text(120 + 20, boxTop + 42, '►', {
            fontFamily: 'Courier New',
            fontSize: '14px',
            color: '#f1c40f'
        });
        this.container.add(this._choiceCursor);
        this._updateChoiceCursor();
    }

    navigateChoice(dir) {
        if (!this.choiceActive) return;
        this.choiceIndex = (this.choiceIndex + dir + this._choiceTexts.length) % this._choiceTexts.length;
        this._updateChoiceCursor();
    }

    _updateChoiceCursor() {
        const H = this.scene.scale.height;
        const boxTop = H - 120 - 120;
        this._choiceCursor.setY(boxTop + 42 + this.choiceIndex * 22);
        this._choiceTexts.forEach((t, i) => t.setColor(i === this.choiceIndex ? '#f1c40f' : '#ffffff'));
    }

    confirmChoice() {
        if (!this.choiceActive) return;
        const selected = this.choiceIndex;
        const cb = this.choiceCallback;
        this.choiceCallback = null;
        this._cleanupChoice();
        this.isVisible = false;
        this.container.setVisible(false);
        if (this.typeTimer) this.typeTimer.remove();
        cb(selected);
    }

    _cleanupChoice() {
        if (this._choiceTexts) {
            this._choiceTexts.forEach(t => t.destroy());
            this._choiceTexts = null;
        }
        if (this._choiceCursor) {
            this._choiceCursor.destroy();
            this._choiceCursor = null;
        }
        this.choiceActive = false;
        this.promptText.setVisible(true);
    }

    destroy() {
        if (this.choiceActive) this._cleanupChoice();
        if (this.typeTimer) this.typeTimer.remove();
        if (this.container) this.container.destroy();
    }
}
