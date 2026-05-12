// ============================================
// INVENTORY UI — Painel de inventário
// ============================================

class InventoryUI {
    static createItemList(scene, inventory, x, y, onSelect = null) {
        const container = scene.add.container(x, y);

        const items = Object.entries(inventory)
            .filter(([id, qty]) => qty > 0 && ItemsDB[id])
            .sort(([a], [b]) => a.localeCompare(b));

        if (items.length === 0) {
            const emptyText = scene.add.text(0, 0, 'Inventário vazio.', {
                fontFamily: 'Courier New',
                fontSize: '14px',
                color: '#888888'
            });
            container.add(emptyText);
            return container;
        }

        items.forEach(([itemId, qty], i) => {
            const item = ItemsDB[itemId];
            const iy = i * 40;

            const bg = scene.add.rectangle(160, iy + 15, 320, 35, 0x1a1a2e, 0.8);
            bg.setStrokeStyle(1, 0x444444);

            if (onSelect) {
                bg.setInteractive({ useHandCursor: true });
                bg.on('pointerdown', () => onSelect(itemId));
                bg.on('pointerover', () => bg.setStrokeStyle(1, 0xf1c40f));
                bg.on('pointerout', () => bg.setStrokeStyle(1, 0x444444));
            }

            const icon = scene.add.image(20, iy + 17, item.icon).setDisplaySize(24, 24);

            const nameText = scene.add.text(45, iy + 7, `${item.name} x${qty}`, {
                fontFamily: 'Courier New',
                fontSize: '12px',
                color: '#ffffff'
            });

            const descText = scene.add.text(45, iy + 22, item.description, {
                fontFamily: 'Courier New',
                fontSize: '9px',
                color: '#888888'
            });

            container.add([bg, icon, nameText, descText]);
        });

        return container;
    }
}