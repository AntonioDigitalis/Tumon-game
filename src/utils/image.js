function ensureProceduralFallback(scene, creatureKey) {

    const procKey = `proc_${creatureKey}`;

    if (scene.textures.exists(procKey)) {
        return procKey;
    }

    // tenta achar na DB pra gerar certo
    const creature = CreaturesDB[creatureKey];
    if (!creature) return 'asset_missing';

    CreatureSprites._draw(
        scene,
        procKey,
        creature.element,
        creature.variant || 0,
        creature.bodyColor || 0x888888,
        creature.eyeColor || 0xffffff
    );

    return procKey;
}

function safeImageLoadWithFallback(scene, key, path) {

    if (!scene.__missingAssets) {
        scene.__missingAssets = new Set();
    }

    scene.load.image(key, path);

    scene.load.on('loaderror', (file) => {
        scene.__missingAssets.add(file.key);
    });
}

const ItemAssetLoader = {
    loadAll(scene) {

        const items = ItemsDB;

        Object.values(items).forEach(item => {
            if (item.icon){
                const path = `assets/items/${item.icon}.png`;
                safeImageLoadWithFallback(scene, item.icon, path);
            }
        });

        Log.ok(`Itens registrados: ${Object.keys(items).length}`);
    }
};

const SpriteAssetLoader = {
    loadAll(scene) {
        const criaturas = CreaturesDB;

        Object.values(criaturas).forEach(criatura => {

            if (criatura.spriteKey) {
                const path = `assets/sprites/${criatura.spriteKey}.png`;
                safeImageLoadWithFallback(scene, criatura.spriteKey, path);
            }

            if (criatura.spriteShinyKey) {
                const shinyPath = `assets/sprites/${criatura.spriteShinyKey}.png`;
                safeImageLoadWithFallback(scene, criatura.spriteShinyKey, shinyPath);
            }
        });

        Log.ok(`Sprites registradas: ${Object.keys(criaturas).length}`);
       }
};

function getSpriteKey(scene, key) {
    if (scene.textures.exists(key)) return key;

    const creature = CreaturesDB[key];
    if (!creature) return 'asset_missing';

    const procKey = `proc_${key}`;

    if (!scene.textures.exists(procKey)) {
        CreatureSprites._draw(
            scene,
            procKey,
            creature.element,
            creature.variant || 0,
            creature.bodyColor || 0x888888,
            creature.eyeColor || 0xffffff
        );
    }

    return procKey;
}