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
    }

    create() {
        const { width, height } = this.scene.cameras.main;
        const boxH = 120;
        const boxY = height - boxH - 10;
        const boxX = 10;
        const boxW = width - 20;

        this.container = this.scene.add.container(0, 0).setDepth(1000);
        
        // Background
        const bg = this.scene.add.rectangle(boxX + boxW / 2, boxY + boxH / 2, boxW, boxH, 0x000000, 0.85);
        bg.setStrokeStyle(2, 0xffffff);
        
        // Text
        this.textObj = this.scene.add.text(boxX + 15, boxY + 15, '', {
            fontFamily: 'Courier New',
            fontSize: '16px',
            color: '#ffffff',
            wordWrap: { width: boxW - 30 },
            lineSpacing: 4
        });

        // Prompt indicator
        this.promptText = this.scene.add.text(boxX + boxW - 30, boxY + boxH - 25, '▼', {
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
            // Skip typing, show full text
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

    destroy() {
        if (this.typeTimer) this.typeTimer.remove();
        if (this.container) this.container.destroy();
    }
}